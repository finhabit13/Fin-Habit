/**
 * Demo store: implementasi lokal (localStorage) yang bentuk responsnya sama
 * persis dengan backend. Dipakai otomatis saat backend tidak terjangkau agar
 * aplikasi tetap bisa dipakai untuk demo/kompetisi.
 */

import { CASES, DEFAULT_DATA, MISSIONS } from "./data";
import { challengeById, setRemoteChallenges } from "./challenges";
import { monthKey, todayKey, uid } from "./util";
import { answerQuiz, applyReward, continueFree, dimOf, finishQuiz, shootForDay, startQuiz, unlockBadges } from "./rewards";

const KEY = "finhabit_demo_v1";

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function seed() {
  const d = clone(DEFAULT_DATA);
  const now = new Date();
  d.savingGoal = 300000;
  d.savingCurrent = 125000;
  d.monthlyBudget = 500000;
  d.challengeDate = {};
  d.doneChallenges = [];
  d.lessonsDone = [];
  d.doneMissions = [];
  d.challengeCategories = [];
  d.challengeReflections = [];
  d.avatarUrl = null;
  d.caseIndex = 0;
  d.lastActiveDay = null;
  d.quizState = {};
  d.role = "user";
  return d;
}

function seedExpenses() {
  const mk = (offset, amount, category, note) => {
    const day = new Date();
    day.setDate(day.getDate() - offset);
    return {
      id: uid(),
      amount,
      category,
      note,
      date: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`
    };
  };
  return [
    mk(0, 18000, "food", "Nasi goreng"),
    mk(0, 50000, "game", "Top-up game"),
    mk(0, 12000, "drink", "Es teh + batagor"),
    mk(1, 25000, "transport", "Ojek pulang sekolah"),
    mk(2, 80000, "shop", "Kaos baru"),
    mk(3, 22000, "food", "Makan siang"),
    mk(4, 65000, "shop", "Buku catatan")
  ];
}

let db = load();

function load() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { user: parsed.user, expenses: parsed.expenses, challenges: parsed.challenges || [] };
    }
  } catch {
    /* abaikan */
  }
  const fresh = { user: seed(), expenses: seedExpenses(), challenges: [] };
  persist(fresh);
  return fresh;
}

function persist(state = db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* abaikan */
  }
}

function userView() {
  const u = clone(db.user);
  delete u.password;
  return u;
}

function grant(points, dim = null, dimUp = 0) {
  applyReward(db.user, points, dim, dimUp, { hasExpenses: db.expenses.length > 0 });
  persist();
}

function shoot() {
  shootForDay(db.user, todayKey());
  persist();
}

/* ---------- API identik dengan backend ---------- */

async function delay() {
  return new Promise((r) => setTimeout(r, 60));
}

export const store = {
  async getSessionUser() {
    await delay();
    return userView();
  },

  // Mode demo: challenge admin disimpan di localStorage supaya tetap bisa
  // dicoba tanpa backend.
  async challenges() {
    await delay();
    const list = db.challenges || [];
    setRemoteChallenges(list);
    return list;
  },

  async adminOverview() {
    await delay();
    const u = db.user;
    const spent = db.expenses.reduce((s, e) => s + e.amount, 0);
    const today = todayKey();
    return {
      users: 1,
      users_student: 1,
      admins: 1,
      banned: 0,
      active_today: u.lastActiveDay === today ? 1 : 0,
      active_7d: 1,
      active_30d: 1,
      new_7d: 1,
      new_30d: 1,
      avg_points: u.points,
      avg_streak: u.streak,
      avg_challenges: u.challengesDone,
      total_expenses: db.expenses.length,
      total_spent: spent,
      spent_7d: spent,
      expenses_7d: db.expenses.length,
      with_avatar: u.avatarUrl ? 1 : 0,
      saving_total: u.savingCurrent,
      saving_goal_total: u.savingGoal,
      challenges: (db.challenges || []).length,
      dim_avg: { ...u.dims },
      score_bands: { starter: 0, steady: 0, smart: 0, master: 0 },
      literacy_good: 0,
      avg_score: 0,
      daily_expenses: [],
      top_users: [{ id: u.id, name: u.name, points: u.points, streak: u.streak, avatar_url: u.avatarUrl }],
      points_bands: { "0_99": 0, "100_299": 0, "300_599": 0, "600_1199": 0, "1200plus": 0 }
    };
  },

  async adminChallenges() {
    await delay();
    return db.challenges || [];
  },

  async adminAddChallenge(body) {
    await delay();
    const row = {
      id: uid(),
      cat: body.kind,
      kind: body.kind,
      title: (body.title || "").trim(),
      desc: (body.desc || "").trim(),
      source: (body.source || "").trim(),
      url: (body.url || "").trim(),
      steps: (body.steps || []).map((s) => String(s).trim()).filter(Boolean),
      min: Number(body.minutes) || 5,
      pts: Number(body.points) || 20,
      dim: body.dim || "goal",
      active: body.active !== false,
      position: Number(body.position) || 0,
      createdAt: new Date().toISOString()
    };
    db.challenges = [...(db.challenges || []), row];
    persist();
    setRemoteChallenges(db.challenges);
    return row;
  },

  async adminUpdateChallenge({ id, ...body }) {
    await delay();
    const list = db.challenges || [];
    const next = list.map((x) =>
      x.id === id
        ? {
            ...x,
            kind: body.kind,
            cat: body.kind,
            title: (body.title || "").trim(),
            desc: (body.desc || "").trim(),
            source: (body.source || "").trim(),
            url: (body.url || "").trim(),
            steps: (body.steps || []).map((s) => String(s).trim()).filter(Boolean),
            min: Number(body.minutes) || 5,
            pts: Number(body.points) || 20,
            dim: body.dim || "goal",
            active: body.active !== false,
            position: Number(body.position) || 0
          }
        : x
    );
    db.challenges = next;
    persist();
    setRemoteChallenges(next);
    return next.find((x) => x.id === id);
  },

  async adminDeleteChallenge({ id }) {
    await delay();
    db.challenges = (db.challenges || []).filter((x) => x.id !== id);
    persist();
    setRemoteChallenges(db.challenges);
    return { ok: true };
  },

  async register({ name, email }) {
    await delay();
    db.user.name = name || "Bailey";
    db.user.email = email;
    persist();
    return { token: "demo", user: userView() };
  },

  async login() {
    await delay();
    return { token: "demo", user: userView() };
  },

  async verifyMagicLink() {
    await delay();
    return { token: "demo", user: userView() };
  },

  async resetPassword({ email }) {
    await delay();
    return { ok: true, email };
  },

  async updatePassword() {
    await delay();
    return { ok: true };
  },

  async me() {
    await delay();
    return userView();
  },

  async patchUser(body) {
    await delay();
    if (body.name) db.user.name = body.name;
    if (body.caseIndex != null) db.user.caseIndex = body.caseIndex;
    persist();
    return userView();
  },

  // Di mode demo tidak ada Supabase Storage, jadi foto disimpan sebagai data URL.
  async uploadAvatar(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Gagal membaca file foto"));
      reader.readAsDataURL(file);
    });
  },

  async updateIdentity({ name, avatarUrl }) {
    await delay();
    if (name) db.user.name = name;
    if (avatarUrl !== undefined) db.user.avatarUrl = avatarUrl;
    persist();
    return { user: userView() };
  },

  async reset() {
    await delay();
    db.user = seed();
    db.expenses = seedExpenses();
    persist();
    return userView();
  },

  async expenses(month) {
    await delay();
    const mk = monthKey();
    const list = db.expenses
      .filter((e) => !month || e.date.startsWith(month))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    const spent = list.reduce((s, e) => s + e.amount, 0);
    return { expenses: list, month: month || mk, spent, budget: db.user.monthlyBudget };
  },

  async addExpense(body) {
    await delay();
    const doc = { id: uid(), amount: Number(body.amount), category: body.category, note: body.note || "", date: body.date || todayKey() };
    db.expenses.push(doc);
    shoot();
    grant(5, "spending", 1);
    return { expense: doc, user: userView() };
  },

  async deleteExpense(id) {
    await delay();
    db.expenses = db.expenses.filter((e) => e.id !== id);
    unlockBadges(db.user, { hasExpenses: db.expenses.length > 0 });
    persist();
    return { ok: true, user: userView() };
  },

  async saving() {
    await delay();
    return { goal: db.user.savingGoal, current: db.user.savingCurrent };
  },

  async addSaving(amount) {
    await delay();
    const n = Number(amount);
    if (db.user.savingGoal > 0) db.user.savingCurrent = Math.min(db.user.savingCurrent + n, db.user.savingGoal);
    else db.user.savingCurrent += n;
    grant(10, "saving", 1);
    return { goal: db.user.savingGoal, current: db.user.savingCurrent, user: userView() };
  },

  async setTarget(target) {
    await delay();
    db.user.savingGoal = Number(target);
    grant(5, "goal", 1);
    return { goal: db.user.savingGoal, current: db.user.savingCurrent, user: userView() };
  },

  async budget() {
    await delay();
    const mk = monthKey();
    const list = db.expenses.filter((e) => e.date.startsWith(mk));
    const spent = list.reduce((s, e) => s + e.amount, 0);
    return summary(mk, spent);
  },

  async setBudget(budget) {
    await delay();
    db.user.monthlyBudget = Number(budget);
    persist();
    const mk = monthKey();
    const list = db.expenses.filter((e) => e.date.startsWith(mk));
    const spent = list.reduce((s, e) => s + e.amount, 0);
    return { ...summary(mk, spent), user: userView() };
  },

  async completeLesson(id) {
    await delay();
    const u = db.user;
    if (u.lessonsDone.includes(id)) return { already: true, user: userView() };
    u.lessonsDone.push(id);
    shoot();
    grant(10, dimOf(id), 1);
    return { user: userView() };
  },

  async completeChallenge({ challengeId, kind, reflection }) {
    await delay();
    const u = db.user;
    const today = todayKey();
    if (u.challengeDate[challengeId] === today) return { already: true, user: userView() };
    const ch = challengeById(challengeId);
    if (kind && !u.challengeCategories.includes(kind)) {
      u.challengeCategories = [...(u.challengeCategories || []), kind];
    }
    if (reflection) {
      u.challengeReflections = [...(u.challengeReflections || []), { id: challengeId, date: today, text: reflection }];
    }
    u.challengeDate[challengeId] = today;
    if (!u.doneChallenges.includes(challengeId)) {
      u.doneChallenges.push(challengeId);
      u.challengesDone += 1;
    }
    shoot();
    grant(ch.pts || 20, ch.dim || "goal", 2);
    return { user: userView() };
  },

  async chooseCase(index, optionIndex, { hard = false } = {}) {
    await delay();
    const r = answerQuiz(db.user, todayKey(), index, optionIndex, hard);
    persist();
    return { user: userView(), meta: {
      correct: r.correct,
      gained: r.gained,
      lost: r.lost,
      free: r.free,
      paidOver: r.paidOver,
      wrong: r.wrong
    } };
  },

  async startQuiz() {
    await delay();
    startQuiz(db.user, todayKey());
    persist();
    return { user: userView() };
  },

  async continueFree() {
    await delay();
    continueFree(db.user, todayKey());
    persist();
    return { user: userView() };
  },

  async finishQuiz() {
    await delay();
    const r = finishQuiz(db.user, todayKey());
    persist();
    return { user: userView(), bonus: r.bonus };
  },

  async completeMission(id) {
    await delay();
    const u = db.user;
    if (u.doneMissions.includes(id)) return { already: true, user: userView() };
    const m = MISSIONS.find((x) => x.id === id) || {};
    u.doneMissions.push(id);
    grant(m.pts || 40, m.dim || "goal", 2);
    return { user: userView() };
  },

  async leaderboard() {
    await delay();
    return {
      rows: [
        {
          id: "me",
          name: db.user.name,
          points: db.user.points,
          streak: db.user.streak,
          badges: db.user.badges || []
        }
      ],
      meId: "me"
    };
  },

  async adminStats() {
    throw new Error("Akses admin ditolak");
  },

  async adminUsers() {
    throw new Error("Akses admin ditolak");
  },

  async adminExpenses() {
    throw new Error("Akses admin ditolak");
  },

  async adminSetRole() {
    throw new Error("Akses admin ditolak");
  },

  async adminSetBanned() {
    throw new Error("Akses admin ditolak");
  },

  async adminLeaderboard() {
    throw new Error("Akses admin ditolak");
  },

  async adminProfile() {
    throw new Error("Akses admin ditolak");
  },

  async banners() {
    await delay();
    return [];
  },

  async adminBanners() {
    throw new Error("Akses admin ditolak");
  },

  async adminAddBanner() {
    throw new Error("Akses admin ditolak");
  },

  async adminSetBanner() {
    throw new Error("Akses admin ditolak");
  },

  async adminDeleteBanner() {
    throw new Error("Akses admin ditolak");
  }
};

function summary(mk, spent) {
  const budget = db.user.monthlyBudget;
  const pct = budget > 0 ? Math.round((spent / budget) * 1000) / 10 : 0;
  const status = budget <= 0 ? "none" : spent >= budget ? "over" : pct >= 80 ? "warn" : "safe";
  return { month: mk, spent: Math.round(spent * 100) / 100, budget: Number(budget), pct, status };
}