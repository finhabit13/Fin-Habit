export const rupiah = (n) => "Rp" + Math.round(Number(n) || 0).toLocaleString("id-ID");

export const overallScore = (dims) =>
  Math.round((dims.saving + dims.spending + dims.decision + dims.goal + dims.risk) / 5);

export const scoreTitle = (s) => {
  if (s >= 90) return "score.tMaster";
  if (s >= 80) return "score.tSmart";
  if (s >= 65) return "score.tSteady";
  return "score.tStarter";
};

export const levelName = (points) => {
  if (points >= 2000) return "level.master";
  if (points >= 1200) return "level.achiever";
  if (points >= 600) return "level.explorer";
  return "level.beginner";
};

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const monthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const dayLabel = (dateStr, lang = "id") => {
  const today = todayKey();
  if (dateStr === today) return lang === "en" ? "Today" : "Hari ini";
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
  if (dateStr === yesterday) return lang === "en" ? "Yesterday" : "Kemarin";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(lang === "en" ? "en-US" : "id-ID", { weekday: "short", day: "numeric", month: "short" });
};

export const budgetStatus = (spent, budget) => {
  if (!budget || budget <= 0) return "none";
  const pct = spent / budget;
  if (pct >= 1) return "over";
  if (pct >= 0.8) return "warn";
  return "safe";
};

export const budgetInfo = (spent, budget) => {
  const status = budgetStatus(spent, budget);
  const pct = budget > 0 ? Math.min(150, Math.round((spent / budget) * 100)) : 0;
  return { status, pct };
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return "morning";
  if (h < 15) return "afternoon";
  if (h < 19) return "evening";
  return "night";
};

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const dayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
};

export const challengeOfTheDay = (challenges) => {
  const idx = Math.max(0, dayOfYear()) % challenges.length;
  return challenges[idx];
};

/** Hash string 32-bit, supaya urutan pilihan challenge stabil untuk satu tanggal. */
const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/**
 * Tiga challenge untuk satu hari. Urutannya ditentukan tanggal, jadi semua
 * orang yang membuka aplikasi di hari yang sama mendapat challenge yang sama.
 * Satu challenge dari tiap jenis diambil lebih dulu supaya hari itu beragam.
 * Urutan jenisnya diputar per tanggal, kalau tidak satu jenis tidak akan
 * pernah muncul karena selalu kalah oleh tiga jenis lain.
 */
export const dailyChallenges = (challenges, count = 3, day = todayKey()) => {
  if (!challenges || !challenges.length) return [];
  const ranked = challenges
    .map((c) => ({ c, k: hash(day + ":" + c.id) }))
    .sort((a, b) => a.k - b.k);

  const picked = [];
  const kinds = [...new Set(challenges.map((c) => c.kind || "practice"))];
  const off = hash("kinds:" + day) % kinds.length;
  const order = kinds.slice(off).concat(kinds.slice(0, off));
  for (const kind of order) {
    if (picked.length >= count) break;
    const next = ranked.find((x) => (x.c.kind || "practice") === kind && !picked.includes(x));
    if (next) picked.push(next);
  }
  for (const x of ranked) {
    if (picked.length >= count) break;
    if (!picked.includes(x)) picked.push(x);
  }
  return picked.slice(0, count).map((x) => x.c);
};
