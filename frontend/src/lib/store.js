/**
 * Demo store: implementasi lokal (localStorage) yang bentuk responsnya sama
 * persis dengan backend. Dipakai otomatis saat backend tidak terjangkau agar
 * aplikasi tetap bisa dipakai untuk demo/kompetisi.
 */

import { CASES, CHALLENGES, DEFAULT_DATA, MISSIONS } from "./data";
import { monthKey, todayKey, uid } from "./util";
import { applyReward, dimOf, shootForDay, unlockBadges } from "./rewards";

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
  d.caseIndex = 0;
  d.lastActiveDay = null;
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
      return { user: parsed.user, expenses: parsed.expenses, challengeCategories: {} };
    }
  } catch {
    /* abaikan */
  }
  const fresh = { user: seed(), expenses: seedExpenses(), challengeCategories: {} };
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

  async completeChallenge({ challengeId, chips }) {
    await delay();
    const u = db.user;
    const today = todayKey();
    if (u.challengeDate[challengeId] === today) return { already: true, user: userView() };
    const ch = CHALLENGES.find((c) => c.id === challengeId) || {};
    if (chips && chips.length) {
      u.challengeCategories = [...(u.challengeCategories || []), ...chips.filter((c) => !u.challengeCategories.includes(c))];
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

  async chooseCase(index, optionIndex) {
    await delay();
    const caseData = CASES[index % CASES.length];
    const opt = caseData.options[optionIndex % caseData.options.length];
    grant(opt.pts, opt.dim, opt.d);
    return { user: userView() };
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
  }
};

function summary(mk, spent) {
  const budget = db.user.monthlyBudget;
  const pct = budget > 0 ? Math.round((spent / budget) * 1000) / 10 : 0;
  const status = budget <= 0 ? "none" : spent >= budget ? "over" : pct >= 80 ? "warn" : "safe";
  return { month: mk, spent: Math.round(spent * 100) / 100, budget: Number(budget), pct, status };
}