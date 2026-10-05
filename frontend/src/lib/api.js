// Klien Supabase. Bentuk respons sengaja menyamai store.js agar AppContext
// bisa memakai keduanya secara bergantian (demo vs live).

import { createClient } from "@supabase/supabase-js";
import { MISSIONS, MISSIONS_PER_DAY } from "./data";
import { challengeById, setRemoteChallenges } from "./challenges";
import { fromChallengeRow, toChallengeRow } from "./challengeRow";
import {
  CONTRIB_PTS,
  canContribute,
  cleanDescription,
  cleanFamilyName,
  cleanInviteCode,
  cleanMissionTarget,
  cleanMissionTitle
} from "./family";
import { toAmount } from "./money";
import {
  addTransaction,
  createGoal,
  deleteGoal,
  deleteTransaction,
  loadGoalsWithBalance,
  signCover,
  updateGoal,
  uploadCover
} from "./savingsApi";
import {
  answerQuiz,
  applyContribution,
  applyReward,
  continueFree,
  dimOf,
  finishQuiz,
  shootForDay,
  startQuiz,
  unlockBadges
} from "./rewards";
import { dailyMissions, monthKey, todayKey } from "./util";

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
    challengeReflections: row.challenge_reflections || [],
    avatarUrl: row.avatar_url || null,
    caseIndex: row.case_index,
    doneMissions: row.done_missions,
    missionLog: row.mission_log || {},
    badges: row.badges,
    savingGoal: Number(row.saving_goal),
    savingCurrent: Number(row.saving_current),
    monthlyBudget: Number(row.monthly_budget),
    lastActiveDay: row.last_active_day,
    quizState: row.quiz_state || {},
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
    challenge_reflections: user.challengeReflections || [],
    avatar_url: user.avatarUrl || null,
    case_index: user.caseIndex,
    done_missions: user.doneMissions,
    mission_log: user.missionLog || {},
    badges: user.badges,
    saving_goal: user.savingGoal,
    saving_current: user.savingCurrent,
    monthly_budget: user.monthlyBudget,
    last_active_day: user.lastActiveDay,
    quiz_state: user.quizState || {},
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

/* ---------- Family group ---------- */

// families, family_members, family_missions, family_mission_contributions
// tidak pernah bisa dibaca lewat kolom profiles milik teammates, jadi nama dan
// fotonya datang dari view family_roster (lihat migration 15).

// Pesan dari raise exception di SQL arrive apa adanya, jadi dipetakan ke kunci
// locale supaya toast tidak menampilkan kalimat teknis Postgres.
const FAMILY_ERROR_KEYS = [
  [/tidak ditemukan/i, "fa.errCode"],
  [/sudah punya family/i, "fa.errHasFamily"],
  [/sudah penuh/i, "fa.errFull"],
  [/tidak valid/i, "fa.errName"],
  [/Owner tidak dapat keluar/i, "fa.errOwnerLeave"],
  [/row-level security|check constraint|foreign key/i, "fa.errDenied"]
];

function familyError(err) {
  const raw = err?.message || "";
  const hit = FAMILY_ERROR_KEYS.find(([re]) => re.test(raw));
  return new ApiError(400, raw, hit ? hit[1] : "fa.errGeneric");
}

// Objek baru setiap panggilan: board kosong pernah ikut dikirim keluar dan
// bisa saja diubah pemanggil, jadi tidak boleh berbagi referensi.
const emptyBoard = () => ({
  family: null,
  role: null,
  meId: null,
  members: [],
  missions: [],
  contributions: []
});

async function membershipOf(c, authUserId) {
  const { data, error } = await c
    .from("family_members")
    .select("family_id, role")
    .eq("user_id", authUserId)
    .limit(1);
  if (error) throw new ApiError(500, error.message);
  return (data || [])[0] || null;
}

function toMember(row) {
  return {
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
    name: row.name || "?",
    avatarUrl: row.avatar_url || null,
    points: Number(row.points) || 0,
    streak: Number(row.streak) || 0
  };
}

function toFamilyMission(row) {
  return {
    id: row.id,
    familyId: row.family_id,
    title: row.title,
    description: row.description || "",
    target: Number(row.target) || 1,
    current: Number(row.current) || 0,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    completedAt: row.completed_at || null
  };
}

function toContribution(row) {
  return {
    id: row.id,
    missionId: row.mission_id,
    userId: row.user_id,
    value: Number(row.value) || 0,
    createdAt: row.created_at
  };
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
    challengeReflections: [],
    avatarUrl: null,
    caseIndex: 0,
    doneMissions: [],
    missionLog: {},
    badges: [],
    savingGoal: 300000,
    savingCurrent: 0,
    monthlyBudget: 500000,
    lastActiveDay: null,
    quizState: {},
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

  // Challenge aktif dari database. Kalau tabelnya belum ada, challenge bawaan
  // tetap dipakai supaya halaman Daily Challenge tidak pernah kosong.
  challenges: async () => {
    const c = needClient();
    await sessionUser();
    const { data, error } = await c
      .from("challenges")
      .select("id, kind, title, description, source, url, steps, minutes, points, dim, active, position, created_at")
      .eq("active", true)
      .order("position", { ascending: true });
    if (error) throw new ApiError(500, error.message);
    const list = (data || []).map(fromChallengeRow);
    setRemoteChallenges(list);
    return list;
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
    if (data?.session && data?.user?.email_confirmed_at) {
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

  signInWithOAuth: async (provider = "google") => {
    const c = needClient();
    const { error } = await c.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    });
    if (error) {
      const key = authErrorKey(error.message, "login");
      throw new ApiError(500, key, key);
    }
    return { ok: true };
  },

  // Sesi OAuth tersimpan di klien Supabase; dipakai boot() agar sesi Google
  // tetap dikenali walaupun finhabit_token belum diisi.
  resumeSession: async () => {
    if (!client) return null;
    try {
      const { data } = await client.auth.getSession();
      return data?.session || null;
    } catch {
      return null;
    }
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

  // Foto profil diunggah ke bucket "avatars" dengan path <user_id>/<file>,
  // lalu URL publiknya disimpan lewat RPC update_identity.
  uploadAvatar: async (file) => {
    const c = needClient();
    const au = await sessionUser();
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${au.id}/${Date.now()}.${ext}`;
    const { error } = await c.storage.from("avatars").upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });
    if (error) throw new ApiError(500, error.message);
    const { data } = c.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  },

  updateIdentity: async ({ name, avatarUrl }) => {
    const c = needClient();
    const au = await sessionUser();
    const { error } = await c.rpc("update_identity", {
      p_name: name,
      p_avatar_url: avatarUrl === undefined ? null : avatarUrl
    });
    if (error) throw new ApiError(400, error.message);
    return { user: await loadProfile(au.id) };
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
    const amount = Math.round(toAmount(body.amount) * 100) / 100;
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

  savingGoals: async () => {
    const c = needClient();
    const au = await sessionUser();
    return loadGoalsWithBalance(c, au.id);
  },

  createSavingGoal: async (input) => {
    const c = needClient();
    const au = await sessionUser();
    return createGoal(c, au.id, input);
  },

  updateSavingGoal: async (goalId, patch) => {
    const c = needClient();
    const au = await sessionUser();
    return updateGoal(c, au.id, goalId, patch);
  },

  deleteSavingGoal: async (goalId) => {
    const c = needClient();
    const au = await sessionUser();
    return deleteGoal(c, au.id, goalId);
  },

  addSavingTx: async (input) => {
    const c = needClient();
    const au = await sessionUser();
    return addTransaction(c, au.id, input);
  },

  deleteSavingTx: async (txId) => {
    const c = needClient();
    const au = await sessionUser();
    return deleteTransaction(c, au.id, txId);
  },

  uploadSavingCover: async (file) => {
    const c = needClient();
    const au = await sessionUser();
    return uploadCover(c, au.id, file);
  },

  // Nilai cover yang disimpan bisa berupa path Storage, data URL (mode demo),
  // atau URL http. Yang path perlu ditandatangani sebelum dipakai di <img>.
  signSavingCover: async (value) => {
    if (!value) return null;
    const c = needClient();
    return signCover(c, value);
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

  completeChallenge: async ({ challengeId, kind, reflection }) => {
    const c = needClient();
    const au = await sessionUser();
    const current = await loadProfile(au.id);
    const today = todayKey();
    if (current.challengeDate[challengeId] === today) return { already: true, user: current };
    const ch = challengeById(challengeId);
    const user = await mutateUser(au.id, (u) => {
      if (kind) {
        u.challengeCategories = [...new Set([...(u.challengeCategories || []), kind])];
      }
      if (reflection) {
        // Satu entri per challenge per tanggal, sama seperti mode demo.
        // Kalau challenge yang sama diulang besok, refleksinya tetap terpisah.
        const rest = (u.challengeReflections || []).filter(
          (r) => !(r.id === challengeId && r.date === today)
        );
        u.challengeReflections = [...rest, { id: challengeId, date: today, text: reflection }];
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

  chooseCase: async (index, optionIndex, { hard = false } = {}) => {
    const c = needClient();
    const au = await sessionUser();
    let meta = null;
    const user = await mutateUser(au.id, (u) => {
      const r = answerQuiz(u, todayKey(), index, optionIndex, hard);
      meta = {
        correct: r.correct,
        gained: r.gained,
        lost: r.lost,
        free: r.free,
        paidOver: r.paidOver,
        wrong: r.wrong
      };
    });
    return { user, meta };
  },

  startQuiz: async () => {
    const c = needClient();
    const au = await sessionUser();
    const user = await mutateUser(au.id, (u) => startQuiz(u, todayKey()));
    return { user };
  },

  continueFree: async () => {
    const c = needClient();
    const au = await sessionUser();
    const user = await mutateUser(au.id, (u) => continueFree(u, todayKey()));
    return { user };
  },

  finishQuiz: async () => {
    const c = needClient();
    const au = await sessionUser();
    let bonus = 0;
    const user = await mutateUser(au.id, (u) => {
      const r = finishQuiz(u, todayKey());
      bonus = r.bonus;
    });
    return { user, bonus };
  },

  completeMission: async (id) => {
    const c = needClient();
    const au = await sessionUser();
    const current = await loadProfile(au.id);

    // Id harus benar-benar misi yang diundi hari ini. Tanpa cek ini, klien
    // tinggal mengirim id apa pun dan mutateUser akan tetap memberikannya
    // hadiah, karena mutateUser tidak tahu misi mana yang sedang diundi.
    const hariIni = todayKey();
    const undian = dailyMissions(MISSIONS, MISSIONS_PER_DAY, hariIni);
    const misi = undian.find((x) => x.id === id);
    if (!misi) return { notToday: true, user: current };

    // Pengecekan per-hari, bukan selamanya. Misi boleh muncul lagi besok,
    // jadi yang dicek adalah tanggal selesai terakhir, bukan apakah id ini
    // pernah ada di done_missions.
    if ((current.missionLog || {})[id] === hariIni) {
      return { already: true, user: current };
    }

    const user = await mutateUser(au.id, (u) => {
      if (!u.doneMissions.includes(id)) u.doneMissions.push(id);
      u.missionLog = { ...(u.missionLog || {}), [id]: hariIni };
      applyReward(u, misi.pts || 40, misi.dim || "goal", 2);
    });
    return { user };
  },

  family: async () => {
    const c = needClient();
    const au = await sessionUser();
    const member = await membershipOf(c, au.id);
    if (!member) return emptyBoard();

    const [fam, roster, missions] = await Promise.all([
      c.from("families").select("id, name, owner_id, invite_code").eq("id", member.family_id).single(),
      c
        .from("family_roster")
        .select("user_id, role, joined_at, name, avatar_url, points, streak")
        .eq("family_id", member.family_id)
        .order("joined_at", { ascending: true }),
      c
        .from("family_missions")
        .select("id, family_id, title, description, target, current, status, created_by, created_at, completed_at")
        .eq("family_id", member.family_id)
        .order("created_at", { ascending: false })
    ]);
    if (fam.error) throw new ApiError(500, fam.error.message);
    if (roster.error) throw new ApiError(500, roster.error.message);
    if (missions.error) throw new ApiError(500, missions.error.message);

    // Kontribusi tidak punya kolom family_id, jadi satu-satunya cara menyaringnya
    // adalah lewat id misi. Family tanpa misi tidak perlu query sama sekali.
    const list = missions.data || [];
    let contributions = [];
    if (list.length) {
      const { data, error } = await c
        .from("family_mission_contributions")
        .select("id, mission_id, user_id, value, created_at")
        .in(
          "mission_id",
          list.map((m) => m.id)
        );
      if (error) throw new ApiError(500, error.message);
      contributions = data || [];
    }

    return {
      family: {
        id: fam.data.id,
        name: fam.data.name,
        ownerId: fam.data.owner_id,
        inviteCode: fam.data.invite_code
      },
      role: member.role,
      meId: au.id,
      members: (roster.data || []).map(toMember),
      missions: list.map(toFamilyMission),
      contributions: contributions.map(toContribution)
    };
  },

  createFamily: async ({ name }) => {
    const c = needClient();
    await sessionUser();
    const cleaned = cleanFamilyName(name);
    if (!cleaned.ok) throw new ApiError(400, "fa.errName", "fa.errName");
    const { error } = await c.rpc("create_family", { p_name: cleaned.value });
    if (error) throw familyError(error);
    return { ok: true };
  },

  joinFamily: async ({ code }) => {
    const c = needClient();
    await sessionUser();
    const cleaned = cleanInviteCode(code);
    if (!cleaned.ok) throw new ApiError(400, "fa.errCode", "fa.errCode");
    const { error } = await c.rpc("join_family", { p_code: cleaned.value });
    if (error) throw familyError(error);
    return { ok: true };
  },

  leaveFamily: async () => {
    const c = needClient();
    const au = await sessionUser();
    const member = await membershipOf(c, au.id);
    if (!member) return { ok: true };
    // Dicek di klien juga Though trigger SQL akan menolaknya: tanpa ini
    // owner akan melihat toast Postgres, bukan pesan yang dimengerti.
    if (member.role === "owner") throw new ApiError(400, "fa.errOwnerLeave", "fa.errOwnerLeave");
    const { error } = await c
      .from("family_members")
      .delete()
      .eq("family_id", member.family_id)
      .eq("user_id", au.id);
    if (error) throw familyError(error);
    return { ok: true };
  },

  deleteFamily: async () => {
    const c = needClient();
    const au = await sessionUser();
    const member = await membershipOf(c, au.id);
    if (!member) return { ok: true };
    if (member.role !== "owner") throw new ApiError(403, "fa.errOwnerOnly", "fa.errOwnerOnly");
    // Misi, kontribusi, dan baris anggota ikut terhapus lewat cascade.
    const { error } = await c.from("families").delete().eq("id", member.family_id).eq("owner_id", au.id);
    if (error) throw familyError(error);
    return { ok: true };
  },

  kickMember: async ({ userId }) => {
    const c = needClient();
    const au = await sessionUser();
    const member = await membershipOf(c, au.id);
    if (!member) throw new ApiError(404, "fa.errNoFamily", "fa.errNoFamily");
    if (member.role !== "owner") throw new ApiError(403, "fa.errOwnerOnly", "fa.errOwnerOnly");
    if (userId === au.id) throw new ApiError(400, "fa.errOwnerLeave", "fa.errOwnerLeave");
    const { error } = await c
      .from("family_members")
      .delete()
      .eq("family_id", member.family_id)
      .eq("user_id", userId);
    if (error) throw familyError(error);
    return { ok: true };
  },

  createFamilyMission: async ({ title, description, target }) => {
    const c = needClient();
    const au = await sessionUser();
    const member = await membershipOf(c, au.id);
    if (!member) throw new ApiError(404, "fa.errNoFamily", "fa.errNoFamily");
    if (member.role !== "owner") throw new ApiError(403, "fa.errOwnerOnly", "fa.errOwnerOnly");
    const judul = cleanMissionTitle(title);
    if (!judul.ok) throw new ApiError(400, judul.key, judul.key);
    const aim = cleanMissionTarget(target);
    if (!aim.ok) throw new ApiError(400, aim.key, aim.key);
    const { error } = await c.from("family_missions").insert({
      family_id: member.family_id,
      title: judul.value,
      description: cleanDescription(description),
      target: aim.value,
      created_by: au.id
    });
    if (error) throw familyError(error);
    return { ok: true };
  },

  deleteFamilyMission: async ({ id }) => {
    const c = needClient();
    const au = await sessionUser();
    const member = await membershipOf(c, au.id);
    if (!member) throw new ApiError(404, "fa.errNoFamily", "fa.errNoFamily");
    if (member.role !== "owner") throw new ApiError(403, "fa.errOwnerOnly", "fa.errOwnerOnly");
    const { error } = await c
      .from("family_missions")
      .delete()
      .eq("id", id)
      .eq("family_id", member.family_id);
    if (error) throw familyError(error);
    return { ok: true };
  },

  contribute: async ({ missionId }) => {
    const c = needClient();
    const au = await sessionUser();
    const member = await membershipOf(c, au.id);
    if (!member) throw new ApiError(404, "fa.errNoFamily", "fa.errNoFamily");
    const { data: row, error: readErr } = await c
      .from("family_missions")
      .select("id, family_id, title, target, current, status")
      .eq("id", missionId)
      .maybeSingle();
    if (readErr) throw new ApiError(500, readErr.message);
    if (!row || row.family_id !== member.family_id) throw new ApiError(404, "fa.errNoMission", "fa.errNoMission");

    // Kuota harian dicek ulang lewat canContribute supaya jawabannya konsisten
    // dengan yang tampil di tombol. Policy insert tetap yang terakhir
    // memutuskan, karena board yang sudah tampil di layar bisa saja basi.
    const { data: mine, error: mineErr } = await c
      .from("family_mission_contributions")
      .select("created_at")
      .eq("user_id", au.id)
      .gte("created_at", new Date().toISOString().slice(0, 10) + "T00:00:00Z");
    if (mineErr) throw new ApiError(500, mineErr.message);
    const gate = canContribute({
      mission: toFamilyMission(row),
      contributions: (mine || []).map((r) => ({ userId: au.id, createdAt: r.created_at })),
      userId: au.id,
      today: todayKey()
    });
    if (!gate.ok) throw new ApiError(400, gate.key, gate.key);

    const { error } = await c.from("family_mission_contributions").insert({
      mission_id: missionId,
      user_id: au.id,
      value: 1
    });
    if (error) throw familyError(error);
    const user = await mutateUser(au.id, (u) => {
      applyContribution(u);
    });
    return { ok: true, user, gained: CONTRIB_PTS };
  },

  leaderboard: async () => {
    const c = needClient();
    const au = await sessionUser();
    const { data, error } = await c
      .from("leaderboard")
      .select("id, name, points, streak, badges, avatar_url, challenges_done")
      .limit(100);
    if (error) throw new ApiError(500, error.message);
    return {
      rows: (data || []).map((r) => ({
        id: r.id,
        name: r.name,
        points: Number(r.points),
        streak: Number(r.streak),
        badges: r.badges || [],
        avatarUrl: r.avatar_url || null,
        challengesDone: Number(r.challenges_done) || 0
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

  adminOverview: async () => {
    const c = needClient();
    await sessionUser();
    const { data, error } = await c.rpc("admin_overview");
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(403, "Akses admin ditolak");
    return data;
  },

  adminChallenges: async () => {
    const c = needClient();
    await sessionUser();
    const { data, error } = await c
      .from("challenges")
      .select("id, kind, title, description, source, url, steps, minutes, points, dim, active, position, created_at")
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new ApiError(500, error.message);
    return (data || []).map(fromChallengeRow);
  },

  adminAddChallenge: async (body) => {
    const c = needClient();
    await sessionUser();
    const { data, error } = await c.from("challenges").insert(toChallengeRow(body)).select().single();
    if (error) throw new ApiError(500, error.message);
    return fromChallengeRow(data);
  },

  adminUpdateChallenge: async ({ id, ...body }) => {
    const c = needClient();
    await sessionUser();
    const { data, error } = await c
      .from("challenges")
      .update(toChallengeRow(body))
      .eq("id", id)
      .select()
      .single();
    if (error) throw new ApiError(500, error.message);
    return fromChallengeRow(data);
  },

  adminDeleteChallenge: async ({ id }) => {
    const c = needClient();
    await sessionUser();
    const { error } = await c.from("challenges").delete().eq("id", id);
    if (error) throw new ApiError(500, error.message);
    return { ok: true };
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
      avatarUrl: u.avatar_url || null,
      challengesDone: Number(u.challenges_done) || 0,
      lastActiveDay: u.last_active_day || null,
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
  },

  banners: async () => {
    const c = needClient();
    await sessionUser();
    const { data, error } = await c.rpc("get_banners");
    if (error) throw new ApiError(500, error.message);
    return (data || []).map((b) => ({
      id: b.id,
      image: b.image_data,
      caption: b.caption,
      link: b.link,
      position: Number(b.position)
    }));
  },

  adminBanners: async () => {
    const c = needClient();
    await sessionUser();
    const { data, error } = await c.rpc("admin_banners_all");
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(403, "Akses admin ditolak");
    return (data || []).map((b) => ({
      id: b.id,
      image: b.image_data,
      caption: b.caption,
      link: b.link,
      position: Number(b.position),
      active: !!b.active,
      createdAt: b.created_at
    }));
  },

  adminAddBanner: async ({ image, caption, link, position }) => {
    const c = needClient();
    await sessionUser();
    const { error } = await c.rpc("admin_add_banner", {
      p_image: image,
      p_caption: caption || "",
      p_link: link || "",
      p_position: Number(position) || 0
    });
    if (error) throw new ApiError(500, error.message);
    return { ok: true };
  },

  adminSetBanner: async ({ id, active }) => {
    const c = needClient();
    await sessionUser();
    const { error } = await c.rpc("admin_set_banner", { p_id: id, p_active: !!active });
    if (error) throw new ApiError(500, error.message);
    return { ok: true };
  },

  adminDeleteBanner: async ({ id }) => {
    const c = needClient();
    await sessionUser();
    const { error } = await c.rpc("admin_delete_banner", { p_id: id });
    if (error) throw new ApiError(500, error.message);
    return { ok: true };
  }
};
