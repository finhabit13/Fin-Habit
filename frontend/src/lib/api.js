// Klien Supabase. Bentuk respons sengaja menyamai store.js agar AppContext
// bisa memakai keduanya secara bergantian (demo vs live).

import { createClient } from "@supabase/supabase-js";
import { CASES, CHALLENGES, MISSIONS } from "./data";
import { applyReward, dimOf, shootForDay, unlockBadges } from "./rewards";
import { monthKey, todayKey } from "./util";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let client = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const TOKEN_KEY = "finhabit_token";

let token = localStorage.getItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(status, message, key = null) {
    super(message);
    this.status = status;
    this.key = key;
  }
}

export class NetworkError extends Error {
  constructor() {
    super("network");
  }
}

export const setToken = (t) => {
  token = t;
  localStorage.setItem(TOKEN_KEY, t);
};

export const clearToken = () => {
  token = null;
  localStorage.removeItem(TOKEN_KEY);
  client?.auth.signOut().catch(() => {});
};

export const hasToken = () => !!token;

export const subscribeRecovery = (cb) => {
  if (!client) return null;
  const { data } = client.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") cb();
  });
  return data?.subscription || null;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function needClient() {
  if (!client) throw new NetworkError();
  return client;
}

async function sessionUser() {
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) throw new ApiError(401, "Sesi berakhir. Silakan masuk lagi.");
  return data.user;
}

function toUser(row) {
  return {
    name: row.name,
    points: row.points,
    streak: row.streak,
    challengesDone: row.challenges_done,
    dims: row.dims,
    lastWeek: row.last_week,
    weekly: row.weekly,
    todayDone: row.today_done,
    todayTotal: row.today_total,
    lessonsDone: row.lessons_done,
    doneChallenges: row.done_challenges,
    challengeDate: row.challenge_date,
    challengeCategories: row.challenge_categories || [],
    caseIndex: row.case_index,
    doneMissions: row.done_missions,
    badges: row.badges,
    savingGoal: Number(row.saving_goal),
    savingCurrent: Number(row.saving_current),
    monthlyBudget: Number(row.monthly_budget),
    lastActiveDay: row.last_active_day,
    role: row.role || "user",
    banned: !!row.banned
  };
}

function toRow(user) {
  return {
    name: user.name,
    points: user.points,
    streak: user.streak,
    challenges_done: user.challengesDone,
    dims: user.dims,
    last_week: user.lastWeek,
    weekly: user.weekly,
    today_done: user.todayDone,
    today_total: user.todayTotal,
    lessons_done: user.lessonsDone,
    done_challenges: user.doneChallenges,
    challenge_date: user.challengeDate,
    challenge_categories: user.challengeCategories || [],
    case_index: user.caseIndex,
    done_missions: user.doneMissions,
    badges: user.badges,
    saving_goal: user.savingGoal,
    saving_current: user.savingCurrent,
    monthly_budget: user.monthlyBudget,
    last_active_day: user.lastActiveDay,
    role: user.role || "user",
    banned: !!user.banned
  };
}

function authErrorKey(raw, kind) {
  const r = (raw || "").toLowerCase();
  if (/already registered|already been registered|exists|duplicate/.test(r)) return "err.emailTaken";
  if (/email not confirmed|confirm your email|verify your email/.test(r)) return "err.emailNotConfirmed";
  if (/invalid email|unable to validate|email address|missing email/.test(r)) return "err.emailFormat";
  if (/invalid login credentials/.test(r)) return "err.badCredentials";
  if (/too many requests|rate limit/.test(r)) return "err.rateLimit";
  if (/password should be at least|too short|weak password/.test(r)) return "err.weakPassword";
  if (/signups? not allowed|signup closed/.test(r)) return "err.signupClosed";
  if (/expired|invalid token|invalid otp|verification code/i.test(r)) return "err.otpInvalid";
  return kind === "login" ? "err.loginFailed" : "err.registerFailed";
}

// Trigger profiles dibuat saat signUp; beri jeda singkat bila baris belum ada.
async function loadProfile(authUserId, tries = 0) {
  const { data, error } = await client.from("profiles").select("*").eq("id", authUserId).maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!data) {
    if (tries < 3) {
      await sleep(250);
      return loadProfile(authUserId, tries + 1);
    }
    throw new ApiError(404, "Profil belum tersedia. Coba lagi sebentar.");
  }
  return toUser(data);
}

function assertNotBanned(user) {
  if (user?.banned) {
    throw new ApiError(403, "err.banned", "err.banned");
  }
  return user;
}

async function mutateUser(authUserId, fn) {
  const current = await loadProfile(authUserId);
  const user = JSON.parse(JSON.stringify(current));
  fn(user);
  const { error } = await client.from("profiles").update(toRow(user)).eq("id", authUserId);
  if (error) throw new ApiError(500, error.message);
  return JSON.parse(JSON.stringify(user));
}

function nextMonth(month) {
  const [y, m] = month.split("-").map(Number);
  return `${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, "0")}`;
}

function summary(month, spent, budget) {
  const pct = budget > 0 ? Math.round((spent / budget) * 1000) / 10 : 0;
  const status = budget <= 0 ? "none" : spent >= budget ? "over" : pct >= 80 ? "warn" : "safe";
  return { month, spent: Math.round(spent * 100) / 100, budget: Number(budget), pct, status };
}

function freshUser(name) {
  return {
    name: name || "Bailey",
    points: 0,
    streak: 0,
    challengesDone: 0,
    dims: { saving: 0, spending: 0, decision: 0, goal: 0, risk: 0 },
    lastWeek: 0,
    weekly: [0, 0, 0, 0, 0, 0, 0],
    todayDone: 0,
    todayTotal: 3,
    lessonsDone: [],
    doneChallenges: [],
    challengeDate: {},
    challengeCategories: [],
    caseIndex: 0,
    doneMissions: [],
    badges: [],
    savingGoal: 300000,
    savingCurrent: 0,
    monthlyBudget: 500000,
    lastActiveDay: null,
    role: "user",
    banned: false
  };
}

export const api = {
  health: async () => {
    try {
      if (!client) return false;
      const { error } = await client.from("profiles").select("id").limit(1);
      return !error;
    } catch {
      return false;
    }
  },

  register: async ({ name, email, password }) => {
    const c = needClient();
    const { data, error } = await c.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin
      }
    });
    if (error) {
      const status = /invalid email|unable to validate|email address|missing email/i.test(error.message) ? 400 : 500;
      const key = authErrorKey(error.message, "register");
      throw new ApiError(status, key, key);
    }
    if (data?.session) {
      const user = assertNotBanned(await loadProfile(data.user.id));
      setToken(data.session.access_token);
      return { token: data.session.access_token, user };
    }
    return { needVerification: true, email };
  },

  resendCode: async ({ email, name, password }) => {
    const c = needClient();
    const { error } = await c.auth.signUp({
      email,
      password,
      options: {
        data: name ? { name } : undefined,
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw new ApiError(500, authErrorKey(error.message, "register"), authErrorKey(error.message, "register"));
    return { ok: true };
  },

  resetPassword: async ({ email }) => {
    const c = needClient();
    const { error } = await c.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw new ApiError(500, authErrorKey(error.message, "register"), authErrorKey(error.message, "register"));
    return { ok: true, email };
  },

  updatePassword: async ({ password }) => {
    const c = needClient();
    const { error } = await c.auth.updateUser({ password });
    if (error) {
      const key = authErrorKey(error.message, "register");
      throw new ApiError(500, key, key);
    }
    return { ok: true };
  },

  verify: async ({ email, code, password }) => {
    const c = needClient();
    const { data, error } = await c.auth.verifyOtp({ email, token: String(code).trim(), type: "email" });
    if (error) {
      const key = authErrorKey(error.message, "register");
      throw new ApiError(401, key, key);
    }
    if (password) {
      const { error: pu } = await c.auth.updateUser({ password });
      if (pu) throw new ApiError(500, pu.message);
    }
    const user = assertNotBanned(await loadProfile(data.user.id));
    const token = data.session?.access_token;
    if (token) setToken(token);
    return { token: token || null, user };
  },

  verifyMagicLink: async (params) => {
    const c = needClient();
    const { data, error } = await c.auth.verifyOtp({
      token_hash: params.tokenHash || undefined,
      token: params.token || undefined,
      type: params.type || "email"
    });
    if (error) {
      const key = authErrorKey(error.message, "register");
      throw new ApiError(401, key, key);
    }
    if (params.type === "recovery") {
      const token = data.session?.access_token;
      if (token) setToken(token);
      return { token: token || null, user: null };
    }
    const user = assertNotBanned(await loadProfile(data.user.id));
    const token = data.session?.access_token;
    if (token) setToken(token);
    return { token: token || null, user };
  },

  login: async ({ email, password }) => {
    const c = needClient();
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    if (error) {
      const key = authErrorKey(error.message, "login");
      throw new ApiError(401, key, key);
    }
    const user = await loadProfile(data.user.id);
    if (user.banned) {
      await c.auth.signOut().catch(() => {});
      throw new ApiError(403, "err.banned", "err.banned");
    }
    setToken(data.session.access_token);
    return { token: data.session.access_token, user };
  },

  me: async () => {
    const c = needClient();
    const au = await sessionUser();
    return assertNotBanned(await loadProfile(au.id));
  },

  patchUser: async (body) => {
    const c = needClient();
    const au = await sessionUser();
    const patch = {};
    if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
    if (body.caseIndex != null) patch.case_index = body.caseIndex;
    if (body.challengeCategories) patch.challenge_categories = body.challengeCategories;
    if (Object.keys(patch).length) {
      const { error } = await c.from("profiles").update(patch).eq("id", au.id);
      if (error) throw new ApiError(500, error.message);
    }
    return loadProfile(au.id);
  },

  reset: async () => {
    const c = needClient();
    const au = await sessionUser();
    const user = freshUser(au.user_metadata?.name);
    const { error } = await c.from("profiles").update(toRow(user)).eq("id", au.id);
    if (error) throw new ApiError(500, error.message);
    const { error: delError } = await c.from("expenses").delete().eq("user_id", au.id);
    if (delError) throw new ApiError(500, delError.message);
    return user;
  },

  expenses: async (month) => {
    const c = needClient();
    const au = await sessionUser();
    const mk = month || monthKey();
    const { data, error } = await c
      .from("expenses")
      .select("*")
      .gte("date", mk + "-01")
      .lt("date", nextMonth(mk) + "-01")
      .order("date", { ascending: false });
    if (error) throw new ApiError(500, error.message);
    const list = (data || []).map((e) => ({
      id: e.id,
      amount: Number(e.amount),
      category: e.category,
      note: e.note,
      date: e.date
    }));
    const spent = list.reduce((s, e) => s + e.amount, 0);
    const user = await loadProfile(au.id);
    return { expenses: list, month: mk, spent, budget: user.monthlyBudget };
  },

  addExpense: async (body) => {
    const c = needClient();
    const au = await sessionUser();
    const amount = Math.round(Number(body.amount) * 100) / 100;
    const doc = { user_id: au.id, amount, category: body.category, note: body.note || "", date: body.date || todayKey() };
    const { data, error } = await c.from("expenses").insert(doc).select().single();
    if (error) throw new ApiError(500, error.message);
    const user = await mutateUser(au.id, (u) => {
      shootForDay(u, todayKey());
      applyReward(u, 5, "spending", 1, { hasExpenses: true });
    });
    return { expense: { id: data.id, amount, category: data.category, note: data.note, date: data.date }, user };
  },

  deleteExpense: async (id) => {
    const c = needClient();
    const au = await sessionUser();
    const { error } = await c.from("expenses").delete().eq("id", id).eq("user_id", au.id);
    if (error) throw new ApiError(500, error.message);
    const { count, error: countError } = await c
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", au.id);
    if (countError) throw new ApiError(500, countError.message);
    const user = await mutateUser(au.id, (u) => unlockBadges(u, { hasExpenses: count > 0 }));
    return { ok: true, user };
  },

  saving: async () => {
    const c = needClient();
    const au = await sessionUser();
    const user = await loadProfile(au.id);
    return { goal: user.savingGoal, current: user.savingCurrent };
  },

  addSaving: async (amount) => {
    const c = needClient();
    const au = await sessionUser();
    const n = Number(amount);
    const user = await mutateUser(au.id, (u) => {
      if (u.savingGoal > 0) u.savingCurrent = Math.min(u.savingCurrent + n, u.savingGoal);
      else u.savingCurrent += n;
      applyReward(u, 10, "saving", 1);
    });
    return { goal: user.savingGoal, current: user.savingCurrent, user };
  },

  setTarget: async (target) => {
    const c = needClient();
    const au = await sessionUser();
    const n = Number(target);
    const user = await mutateUser(au.id, (u) => {
      u.savingGoal = n;
      applyReward(u, 5, "goal", 1);
    });
    return { goal: user.savingGoal, current: user.savingCurrent, user };
  },

  budget: async () => {
    const c = needClient();
    const au = await sessionUser();
    const user = await loadProfile(au.id);
    const mk = monthKey();
    const { data, error } = await c
      .from("expenses")
      .select("amount")
      .gte("date", mk + "-01")
      .lt("date", nextMonth(mk) + "-01");
    if (error) throw new ApiError(500, error.message);
    const spent = (data || []).reduce((s, e) => s + Number(e.amount), 0);
    return summary(mk, spent, user.monthlyBudget);
  },

  setBudget: async (budget) => {
    const c = needClient();
    const au = await sessionUser();
    const n = Number(budget);
    const { error } = await c.from("profiles").update({ monthly_budget: n }).eq("id", au.id);
    if (error) throw new ApiError(500, error.message);
    const user = await loadProfile(au.id);
    const mk = monthKey();
    const { data, error: sumError } = await c
      .from("expenses")
      .select("amount")
      .gte("date", mk + "-01")
      .lt("date", nextMonth(mk) + "-01");
    if (sumError) throw new ApiError(500, sumError.message);
    const spent = (data || []).reduce((s, e) => s + Number(e.amount), 0);
    return { ...summary(mk, spent, user.monthlyBudget), user };
  },

  completeLesson: async (id) => {
    const c = needClient();
    const au = await sessionUser();
    const current = await loadProfile(au.id);
    if (current.lessonsDone.includes(id)) return { already: true, user: current };
    const user = await mutateUser(au.id, (u) => {
      u.lessonsDone.push(id);
      shootForDay(u, todayKey());
      applyReward(u, 10, dimOf(id), 1);
    });
    return { user };
  },

  completeChallenge: async ({ challengeId, chips }) => {
    const c = needClient();
    const au = await sessionUser();
    const current = await loadProfile(au.id);
    const today = todayKey();
    if (current.challengeDate[challengeId] === today) return { already: true, user: current };
    const ch = CHALLENGES.find((x) => x.id === challengeId) || {};
    const user = await mutateUser(au.id, (u) => {
      if (chips && chips.length) {
        u.challengeCategories = [...new Set([...(u.challengeCategories || []), ...chips])];
      }
      u.challengeDate[challengeId] = today;
      if (!u.doneChallenges.includes(challengeId)) {
        u.doneChallenges.push(challengeId);
        u.challengesDone += 1;
      }
      shootForDay(u, today);
      applyReward(u, ch.pts || 20, ch.dim || "goal", 2);
    });
    return { user };
  },

  chooseCase: async (index, optionIndex) => {
    const c = needClient();
    const au = await sessionUser();
    const caseData = CASES[index % CASES.length];
    const opt = caseData.options[optionIndex % caseData.options.length];
    const user = await mutateUser(au.id, (u) => applyReward(u, opt.pts, opt.dim, opt.d));
    return { user };
  },

  completeMission: async (id) => {
    const c = needClient();
    const au = await sessionUser();
    const current = await loadProfile(au.id);
    if (current.doneMissions.includes(id)) return { already: true, user: current };
    const m = MISSIONS.find((x) => x.id === id) || {};
    const user = await mutateUser(au.id, (u) => {
      u.doneMissions.push(id);
      applyReward(u, m.pts || 40, m.dim || "goal", 2);
    });
    return { user };
  },

  leaderboard: async () => {
    const c = needClient();
    const au = await sessionUser();
    const { data, error } = await c
      .from("leaderboard")
      .select("id, name, points, streak, badges")
      .limit(100);
    if (error) throw new ApiError(500, error.message);
    return {
      rows: (data || []).map((r) => ({
        id: r.id,
        name: r.name,
        points: Number(r.points),
        streak: Number(r.streak),
        badges: r.badges || []
      })),
      meId: au.id
    };
  },

  adminStats: async () => {
    const c = needClient();
    await sessionUser();
    const { data, error } = await c.rpc("admin_stats");
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(403, "Akses admin ditolak");
    return data;
  },

  adminUsers: async () => {
    const c = needClient();
    await sessionUser();
    const { data, error } = await c
      .from("profiles")
      .select("id, name, points, streak, challenges_done, badges, role, banned")
      .order("points", { ascending: false });
    if (error) throw new ApiError(500, error.message);
    return (data || []).map((r) => ({
      id: r.id,
      name: r.name,
      points: Number(r.points),
      streak: Number(r.streak),
      challengesDone: Number(r.challenges_done),
      badges: r.badges || [],
      role: r.role || "user",
      banned: !!r.banned
    }));
  },

  adminExpenses: async () => {
    const c = needClient();
    await sessionUser();
    const { data, error } = await c
      .from("expenses")
      .select("id, amount, category, date, user_id")
      .order("date", { ascending: false })
      .limit(50);
    if (error) throw new ApiError(500, error.message);
    return (data || []).map((e) => ({
      id: e.id,
      amount: Number(e.amount),
      category: e.category,
      date: e.date,
      userId: e.user_id
    }));
  },

  adminSetRole: async ({ id, role }) => {
    const c = needClient();
    await sessionUser();
    const { error } = await c.from("profiles").update({ role }).eq("id", id);
    if (error) throw new ApiError(500, error.message);
    return { ok: true };
  },

  adminSetBanned: async ({ id, banned }) => {
    const c = needClient();
    await sessionUser();
    const { error } = await c.from("profiles").update({ banned }).eq("id", id);
    if (error) throw new ApiError(500, error.message);
    return { ok: true };
  },

  adminLeaderboard: async () => {
    const c = needClient();
    await sessionUser();
    const data = await c.rpc("admin_leaderboard");
    if (data.error) throw new ApiError(500, data.error.message);
    if (!data.data) throw new ApiError(403, "Akses admin ditolak");
    return (data.data || []).map((u) => ({
      id: u.id,
      name: u.name,
      points: Number(u.points),
      streak: Number(u.streak),
      badges: u.badges || [],
      role: u.role || "user",
      banned: !!u.banned,
      rank: Number(u.rank)
    }));
  },

  adminProfile: async ({ id }) => {
    const c = needClient();
    await sessionUser();
    const { data, error } = await c.rpc("admin_profile", { p_user: id });
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(403, "Akses admin ditolak");
    return {
      id: data.id,
      name: data.name,
      points: Number(data.points),
      streak: Number(data.streak),
      challengesDone: Number(data.challenges_done),
      badges: data.badges || [],
      dims: data.dims || {},
      weekly: data.weekly || [],
      savingGoal: Number(data.saving_goal),
      savingCurrent: Number(data.saving_current),
      monthlyBudget: Number(data.monthly_budget),
      lastActiveDay: data.last_active_day,
      createdAt: data.created_at,
      role: data.role || "user",
      banned: !!data.banned,
      spendByCat: (data.spend_by_cat || []).map((x) => ({
        category: x.category,
        total: Number(x.total),
        count: Number(x.n)
      }))
    };
  }
};