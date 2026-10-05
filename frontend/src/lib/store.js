/**
 * Demo store: implementasi lokal (localStorage) yang bentuk responsnya sama
 * persis dengan backend. Dipakai otomatis saat backend tidak terjangkau agar
 * aplikasi tetap bisa dipakai untuk demo/kompetisi.
 */

import { CASES, DEFAULT_DATA, MISSIONS, MISSIONS_PER_DAY } from "./data";
import { challengeById, setRemoteChallenges } from "./challenges";
import { dailyMissions, monthKey, todayKey, uid } from "./util";
import { toAmount } from "./money";
import { balanceOf } from "./savings";
import {
  CONTRIB_PTS,
  canContribute,
  cleanDescription,
  cleanFamilyName,
  cleanInviteCode,
  cleanMissionTarget,
  cleanMissionTitle,
  newInviteCode
} from "./family";
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
  d.missionLog = {};
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

/**
 * Data demo untuk tabungan. Dua goal supaya halaman Saving tidak terlihat
 * kosong, dan goal pertama dibuat 6 hari lalu supaya ring "sisa hari" punya
 * bahan untuk diukur. Saldo sengaja tidak disimpan: semuanya diturunkan dari
 * daftar transaksi.
 *
 * Fungsi transaksi menerima daftar goal sebagai argumen, bukan membaca db.
 * Saat load() berjalan, variabel db belum selesai diinisialisasi, jadi
 * membacanya dari sini akan melempar ReferenceError.
 */
function seedSavingGoals() {
  return [
    {
      id: uid(),
      name: "Laptop baru",
      targetAmount: 6000000,
      cadenceAmount: 100000,
      cadenceUnit: "day",
      coverUrl: null,
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
    },
    {
      id: uid(),
      name: "Dana darurat",
      targetAmount: 3000000,
      cadenceAmount: 150000,
      cadenceUnit: "week",
      coverUrl: null,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ];
}

function seedSavingTransactions(goals) {
  if (!Array.isArray(goals) || goals.length < 2) return [];
  const hariLalu = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const buat = (goalId, kind, amount, note, hari) => ({
    id: uid(),
    goalId,
    kind,
    amount,
    note,
    occurredOn: hariLalu(hari),
    createdAt: new Date(Date.now() - hari * 86400000).toISOString()
  });
  return [
    buat(goals[0].id, "income", 100000, "", 6),
    buat(goals[0].id, "income", 100000, "", 5),
    buat(goals[0].id, "income", 100000, "", 4),
    buat(goals[0].id, "income", 100000, "", 3),
    buat(goals[0].id, "income", 100000, "", 2),
    buat(goals[0].id, "income", 100000, "", 1),
    buat(goals[0].id, "expense", 50000, "Beli tas", 1),
    buat(goals[1].id, "income", 150000, "Mingguan", 2),
    buat(goals[1].id, "income", 150000, "", 1)
  ];
}

/**
 * Family demo yang sudah terisi, supaya halaman tidak pernah tampil kosong saat
 * demo dipakai untuk presentasi. Satu user demo tidak punya akun teammates, jadi
 * roster disimpan denormalisasi (nama, avatar, poin) di dalam family itu
 * sendiri, bukan seperti tabel profiles di Supabase.
 *
 * Kontribusi suspect sengaja dikasih tanggal beberapa hari lalu: kalau satu
 * baris memakai userId "me" dan tanggal hari ini, kuota harian langsung
 * berkurang sebelum user menyentuh apa pun.
 */
// User untuk baris "me" di roster sengaja jadi argumen, bukan dibaca dari db.
// seedFamily() dipanggil dari dalam load(), sementara db diassign dari hasil
// load() itu sendiri: "let db = load()". Membaca db di sini membuat baris itu
// masuk dead zone dan melempar "Cannot access 'db' before initialization" tepat
// untuk pengguna yang pertama kali membuka aplikasi, yaitu saat tidak ada
// state tersimpan dan seedFamily() baru dipanggil. Di bundle produksi ini jadi
// ReferenceError yang halaman putihnya tanpa jejak di console.
function seedFamily(name, user) {
  const lalu = (hari) => new Date(Date.now() - hari * 86400000).toISOString();
  const familyId = uid();
  const misiId = [uid(), uid()];
  const roster = [
    { userId: "me", role: "owner", joinedAt: lalu(12), name: name || "Bailey", avatarUrl: null, points: user?.points ?? 0, streak: user?.streak ?? 0 },
    { userId: uid(), role: "member", joinedAt: lalu(11), name: "Ibu Rina", avatarUrl: null, points: 1240, streak: 12 },
    { userId: uid(), role: "member", joinedAt: lalu(9), name: "Adik Fajar", avatarUrl: null, points: 430, streak: 4 }
  ];
  const members = clone(roster);
  const contributedBy = (mission, pairs) =>
    pairs.map(([memberIndex, hari]) => ({
      id: uid(),
      missionId: mission,
      userId: members[memberIndex].userId,
      value: 1,
      createdAt: lalu(hari)
    }));

  return {
    id: familyId,
    name: "Keluarga Pintar",
    ownerId: "me",
    inviteCode: newInviteCode(),
    createdAt: lalu(12),
    members,
    missions: [
      {
        id: misiId[0],
        familyId,
        title: "Belanja bulanan bareng",
        description: "Susun daftar belanja bulanan bersama, lalu jalankan sesuai daftar.",
        target: 8,
        current: 3,
        status: "active",
        createdBy: "me",
        createdAt: lalu(10),
        completedAt: null
      },
      {
        id: misiId[1],
        familyId,
        title: "Menu makan seminggu",
        description: "Tetapkan menu makan untuk seminggu, lalu sesuaikan belanja.",
        target: 5,
        current: 5,
        status: "completed",
        createdBy: "me",
        createdAt: lalu(14),
        completedAt: lalu(2)
      }
    ],
    contributions: [
      ...contributedBy(misiId[0], [[0, 8], [1, 6], [2, 3]]),
      ...contributedBy(misiId[1], [[1, 13], [0, 12], [2, 11], [1, 8], [0, 5]])
    ]
  };
}

function load() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Default wajib: localStorage sudah ada milik versi lama yang tidak punya
      // key tabungan. Tanpa ini db.savingGoals undefined dan halaman Saving
      // gagal tepat di demo yang paling sering dipakai.
      if (parsed.savingGoals) {
        return {
          ...parsed,
          savingTransactions: parsed.savingTransactions || seedSavingTransactions(parsed.savingGoals),
          // "family" sengaja tidak ||= seed: null berarti pengguna memang sudah
          // keluar atau menghapus family-nya, dan itu harus dihormati.
          family: parsed.family === undefined ? null : parsed.family
        };
      }
      const goals = seedSavingGoals();
      const migrated = {
        ...parsed,
        savingGoals: goals,
        savingTransactions: seedSavingTransactions(goals),
        family: parsed.family === undefined ? null : parsed.family
      };
      persist(migrated);
      return migrated;
    }
  } catch {
    /* abaikan */
  }
  const goals = seedSavingGoals();
  const user = seed();
  const fresh = {
    user,
    expenses: seedExpenses(),
    challenges: [],
    savingGoals: goals,
    savingTransactions: seedSavingTransactions(goals),
    family: null
  };
  persist(fresh);
  return fresh;
}

let db = load();

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

// Id user demo. Sama dengan meId di leaderboard() supaya baris "kamu" bisa
// dikenali tanpa session sungguhan.
const ME = "me";

// run() membaca err.key untuk diterjemahkan, jadi demo cukup melempar Error
// dengan key locale dan tanpa pesan. Melempar, bukan mengembalikan { key }:
// kalau dikembalikan, run() akan menganggap aksi itu berhasil.
function stop(key) {
  const err = new Error(key);
  err.key = key;
  throw err;
}

/** Baris roster untuk user demo, disalin dari profil supaya selalu sinkron. */
function meAsMember(role) {
  return {
    userId: ME,
    role,
    joinedAt: new Date().toISOString(),
    name: db.user.name,
    avatarUrl: db.user.avatarUrl || null,
    points: db.user.points,
    streak: db.user.streak
  };
}

/** Bentuk respons yang sama dengan api.family(). */
function familyBoard() {
  const f = db.family;
  if (!f) return { family: null, role: null, meId: null, members: [], missions: [], contributions: [] };
  const saya = f.members.find((m) => m.userId === ME);
  // Baris "me" disalin ulang tiap load. Kalau tidak, kartu roster menampilkan
  // poin dari saat family dibuat, padahal poin user sudah berubah karena
  // pengeluaran, lesson, atau kontribusi misi keluarga.
  const members = clone(f.members).map((m) => (m.userId === ME ? { ...m, ...meAsMember(m.role) } : m));
  return {
    family: { id: f.id, name: f.name, ownerId: f.ownerId, inviteCode: f.inviteCode },
    role: saya?.role || null,
    meId: ME,
    members,
    missions: clone(f.missions),
    contributions: clone(f.contributions)
  };
}

/**
 * Hitung ulang current dan status tiap misi, meniru trigger
 * update_family_mission_progress di migration 15: total kontribusi, lunas saat
 * total >= target, dan kembali aktif kalau totalnya turun lagi.
 */
function syncProgress() {
  if (!db.family) return;
  db.family.missions.forEach((m) => {
    const total = db.family.contributions
      .filter((c) => c.missionId === m.id)
      .reduce((sum, c) => sum + (Number(c.value) || 0), 0);
    m.current = total;
    if (m.status === "cancelled") return;
    if (total >= m.target) {
      if (m.status !== "completed") {
        m.status = "completed";
        m.completedAt = new Date().toISOString();
      }
    } else if (m.status === "completed") {
      m.status = "active";
      m.completedAt = null;
    }
  });
}

/* ---------- API identik dengan backend ---------- */

async function delay() {
  return new Promise((r) => setTimeout(r, 60));
}

/**
 * Ubah file gambar menjadi data URL, diperkecil dulu lewat canvas.
 *
 * Demo tidak punya Supabase Storage, jadi hasilnya disimpan langsung di
 * localStorage sebagai data URL. Foto HP berukuran penuh bisa mencapai
 * beberapa megabyte dan langsung menghabiskan kuota localStorage, jadi
 * gambar diperkecil ke sisi terpanjang 900px dan dikompres ulang sebagai
 * JPEG sebelum disimpan.
 */
function imageFileToDataUrl(file, maxEdge = 900) {
  return new Promise((resolve, reject) => {
    // err.key dibaca run() untuk diterjemahkan, jadi pesan error di sini
    // cukup Bahasa Indonesia sebagai nilai cadangan.
    const fail = (fallback) => {
      const err = new Error(fallback);
      err.key = "err.notImage";
      reject(err);
    };
    if (!/^image\/(jpeg|png|webp)$/.test(file.type || "")) {
      fail("Berkas harus berupa gambar JPG, PNG, atau WebP");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => fail("Gambar tidak bisa dibaca");
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => fail("Format gambar tidak didukung");
      img.onload = () => {
        const skala = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * skala));
        const h = Math.max(1, Math.round(img.height * skala));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
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
      // Dijumlahkan dari goal, bukan dari u.savingCurrent. Harus sama dengan
      // admin_overview() di SQL, kalau tidak angka di demo dan di backend
      // akan berbeda untuk input yang persis sama.
      saving_total: db.savingGoals.reduce((s, g) => {
        const txs = db.savingTransactions.filter((t) => t.goalId === g.id);
        return s + balanceOf(txs);
      }, 0),
      saving_goal_total: db.savingGoals.reduce((s, g) => s + g.targetAmount, 0),
      saving_goals: db.savingGoals.length,
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
    // Family ikut diseed ulang supaya demo yang sudah dikosongkan lewat "hapus
    // family" tidak terlihat rusak.
    db.family = seedFamily(db.user.name, db.user);
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
    const doc = { id: uid(), amount: toAmount(body.amount), category: body.category, note: body.note || "", date: body.date || todayKey() };
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

  /**
   * Tabungan goals. Bentuk responsnya sama dengan api.js supaya halaman
   * Saving tidak tahu sedang berjalan di demo atau backend sungguhan.
   * Saldo dihitung ulang dari transaksi, tidak disimpan terpisah, persis
   * seperti di backend.
   */
  async savingGoals() {
    await delay();
    return db.savingGoals.map((g) => {
      const transactions = db.savingTransactions.filter((t) => t.goalId === g.id);
      return { ...clone(g), transactions: clone(transactions), balance: balanceOf(transactions) };
    });
  },

  async createSavingGoal(input) {
    await delay();
    const goal = {
      id: uid(),
      name: String(input.name || "").trim(),
      targetAmount: toAmount(input.targetAmount),
      cadenceAmount: Math.max(0, toAmount(input.cadenceAmount)),
      cadenceUnit: input.cadenceUnit || "day",
      coverUrl: input.coverUrl || null,
      createdAt: new Date().toISOString()
    };
    if (!goal.name) throw new Error("Nama tujuan wajib diisi");
    if (!goal.targetAmount || goal.targetAmount <= 0) throw new Error("Target harus lebih dari 0");
    db.savingGoals.unshift(goal);
    persist();
    return clone(goal);
  },

  async updateSavingGoal(goalId, patch) {
    await delay();
    const g = db.savingGoals.find((x) => x.id === goalId);
    if (!g) return null;
    if (patch.name !== undefined) g.name = String(patch.name).trim();
    if (patch.targetAmount !== undefined) g.targetAmount = toAmount(patch.targetAmount);
    if (patch.cadenceAmount !== undefined) {
      g.cadenceAmount = Math.max(0, toAmount(patch.cadenceAmount));
    }
    if (patch.cadenceUnit !== undefined) g.cadenceUnit = patch.cadenceUnit;
    if (patch.coverUrl !== undefined) g.coverUrl = patch.coverUrl || null;
    persist();
    return clone(g);
  },

  async deleteSavingGoal(goalId) {
    await delay();
    db.savingGoals = db.savingGoals.filter((g) => g.id !== goalId);
    db.savingTransactions = db.savingTransactions.filter((t) => t.goalId !== goalId);
    persist();
    return true;
  },

  async addSavingTx(input) {
    await delay();
    const amount = toAmount(input.amount);
    if (!amount || amount <= 0) throw new Error("Nominal harus lebih dari 0");
    const tx = {
      id: uid(),
      goalId: input.goalId,
      kind: input.kind === "expense" ? "expense" : "income",
      amount,
      note: String(input.note || "").trim(),
      occurredOn: input.occurredOn || todayKey(),
      createdAt: new Date().toISOString()
    };
    db.savingTransactions.unshift(tx);
    persist();
    return clone(tx);
  },

  async deleteSavingTx(txId) {
    await delay();
    db.savingTransactions = db.savingTransactions.filter((t) => t.id !== txId);
    persist();
    return true;
  },

  // Demo tidak punya storage sungguhan, jadi "unggah" berarti perkecil gambar
  // lalu simpan sebagai data URL. Sebelumnya fungsi ini mengembalikan null,
  // sehingga memilih file di mode demo terlihat seperti tidak ada respons.
  async uploadSavingCover(file) {
    await delay();
    return imageFileToDataUrl(file);
  },

  // Data URL bisa langsung dipakai <img>, jadi tidak ada yang perlu ditandatangani.
  async signSavingCover(value) {
    return value || null;
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
    const hariIni = todayKey();
    const undian = dailyMissions(MISSIONS, MISSIONS_PER_DAY, hariIni);
    const misi = undian.find((x) => x.id === id);
    if (!misi) return { notToday: true, user: userView() };
    if ((u.missionLog || {})[id] === hariIni) {
      return { already: true, user: userView() };
    }
    if (!u.doneMissions.includes(id)) u.doneMissions.push(id);
    u.missionLog = { ...(u.missionLog || {}), [id]: hariIni };
    grant(misi.pts || 40, misi.dim || "goal", 2);
    return { user: userView() };
  },

  /* ---------- Family group ---------- */

  async family() {
    await delay();
    return familyBoard();
  },

  async createFamily({ name }) {
    await delay();
    if (db.family) stop("fa.errHasFamily");
    const cleaned = cleanFamilyName(name);
    if (!cleaned.ok) stop(cleaned.key);
    const familyId = uid();
    db.family = {
      id: familyId,
      name: cleaned.value,
      ownerId: ME,
      inviteCode: newInviteCode(),
      createdAt: new Date().toISOString(),
      members: [meAsMember("owner")],
      missions: [],
      contributions: []
    };
    persist();
    return { ok: true };
  },

  async joinFamily({ code }) {
    await delay();
    if (db.family) stop("fa.errHasFamily");
    const cleaned = cleanInviteCode(code);
    if (!cleaned.ok) stop(cleaned.key);
    // Demo tidak punya tabel families untuk dicari, jadi kode yang bentuknya
    // benar selalu diterima. Roster berisi beberapa nama supaya daftar anggota
    // tidak cuma menampilkan diri sendiri.
    const familyId = uid();
    const lain = [
      { name: "Ibu Rina", points: 1240, streak: 12 },
      { name: "Kakak Dimas", points: 980, streak: 6 },
      { name: "Adik Fajar", points: 430, streak: 4 }
    ];
    db.family = {
      id: familyId,
      name: "Keluarga Bersama",
      ownerId: uid(),
      inviteCode: cleaned.value,
      createdAt: new Date().toISOString(),
      members: [
        {
          userId: uid(),
          role: "owner",
          joinedAt: new Date().toISOString(),
          name: lain[0].name,
          avatarUrl: null,
          points: lain[0].points,
          streak: lain[0].streak
        },
        ...lain.slice(1).map((m) => ({
          userId: uid(),
          role: "member",
          joinedAt: new Date().toISOString(),
          name: m.name,
          avatarUrl: null,
          points: m.points,
          streak: m.streak
        })),
        meAsMember("member")
      ],
      missions: [],
      contributions: []
    };
    persist();
    return { ok: true };
  },

  async leaveFamily() {
    await delay();
    if (!db.family) return { ok: true };
    if (db.family.ownerId === ME) stop("fa.errOwnerLeave");
    db.family = null;
    persist();
    return { ok: true };
  },

  async deleteFamily() {
    await delay();
    if (!db.family) return { ok: true };
    if (db.family.ownerId !== ME) stop("fa.errOwnerOnly");
    db.family = null;
    persist();
    return { ok: true };
  },

  async kickMember({ userId }) {
    await delay();
    if (!db.family) stop("fa.errNoFamily");
    if (db.family.ownerId !== ME) stop("fa.errOwnerOnly");
    if (userId === ME) stop("fa.errOwnerLeave");
    db.family.members = db.family.members.filter((m) => m.userId !== userId);
    db.family.contributions = db.family.contributions.filter((c) => c.userId !== userId);
    syncProgress();
    persist();
    return { ok: true };
  },

  async createFamilyMission({ title, description, target }) {
    await delay();
    if (!db.family) stop("fa.errNoFamily");
    if (db.family.ownerId !== ME) stop("fa.errOwnerOnly");
    const judul = cleanMissionTitle(title);
    if (!judul.ok) stop(judul.key);
    const aim = cleanMissionTarget(target);
    if (!aim.ok) stop(aim.key);
    db.family.missions.push({
      id: uid(),
      familyId: db.family.id,
      title: judul.value,
      description: cleanDescription(description),
      target: aim.value,
      current: 0,
      status: "active",
      createdBy: ME,
      createdAt: new Date().toISOString(),
      completedAt: null
    });
    persist();
    return { ok: true };
  },

  async deleteFamilyMission({ id }) {
    await delay();
    if (!db.family) stop("fa.errNoFamily");
    if (db.family.ownerId !== ME) stop("fa.errOwnerOnly");
    db.family.missions = db.family.missions.filter((m) => m.id !== id);
    db.family.contributions = db.family.contributions.filter((c) => c.missionId !== id);
    persist();
    return { ok: true };
  },

  async contribute({ missionId }) {
    await delay();
    if (!db.family) stop("fa.errNoFamily");
    const mission = db.family.missions.find((m) => m.id === missionId);
    const gate = canContribute({
      mission,
      contributions: db.family.contributions,
      userId: ME,
      today: todayKey()
    });
    if (!gate.ok) stop(gate.key);
    db.family.contributions.push({
      id: uid(),
      missionId,
      userId: ME,
      value: 1,
      createdAt: new Date().toISOString()
    });
    syncProgress();
    const gained = CONTRIB_PTS;
    applyContribution(db.user, { hasExpenses: db.expenses.length > 0 });
    const roster = db.family.members.find((m) => m.userId === ME);
    if (roster) {
      roster.points = db.user.points;
      roster.streak = db.user.streak;
    }
    persist();
    return { ok: true, user: userView(), gained };
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

  // Mode demo tidak punya tabel banner, jadi carousel-nya tidak akan pernah
  // tampil. Buka /?banners=1 saat dev untuk melihatnya tanpa seeding database.
  async banners() {
    await delay();
    if (import.meta.env.DEV && new URLSearchParams(location.search).has("banners")) {
      const swatch = (c) =>
        `data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='750' height='280'><rect width='750' height='280' fill='${c}'/><text x='375' y='150' font-size='40' fill='#fff' text-anchor='middle' font-family='sans-serif'>BANNER</text></svg>`
        )}`;
      return [
        { id: "b1", image: swatch("#2563eb"), caption: "Belanja bulanan lebih tenang" },
        { id: "b2", image: swatch("#0d9488"), caption: "Tabung dan target menipis" },
        { id: "b3", image: swatch("#7c3aed"), caption: "Upgrade skill tiap minggu" }
      ];
    }
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