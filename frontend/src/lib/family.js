/**
 * Aturan mainan family group yang dipakai bersama oleh adapter live (api.js),
 * adapter demo (store.js), dan halaman Family.
 *
 * Semua angka batas di sini punya pasangan di sisi database: MAX_MISSION_TARGET
 * ada sebagai check constraint di migration 15, MAX_DAILY_CONTRIBUTIONS ada
 * sebagai syarat di policy insert family_mission_contributions. Yang ditulis di
 * lib ini bukan untuk dipercaya database, tapi supaya klien bisa menolak input
 * buruk dengan pesan yang jelas sebelum call-nya diteruskan, dan supaya batas
 * yang sama berlaku di mode demo yang tidak punya RLS sama sekali.
 */

export const MAX_DAILY_CONTRIBUTIONS = 5;
export const MAX_MISSION_TARGET = 200;
export const MAX_MISSION_TITLE = 120;
export const MAX_FAMILY_NAME = 64;

// Poin per satu baris kontribusi. Nilainya tetap dan tidak mengikuti nilai
// kontribusi: kalau ikut nilai, owner bisa menaikkan poinnya sendiri dengan
// membuat target besar lalu mengisinya sendiri.
export const CONTRIB_PTS = 5;

// Alfabet kode undangan harus sama dengan generate_invite_code() di SQL yang
// memakai md5, jadi di demo cukup 0-9 dan A-F.
const CODE_ALPHABET = "0123456789ABCDEF";
const CODE_LENGTH = 6;

const ok = (value) => ({ ok: true, value });
const no = (key) => ({ ok: false, key });

export function cleanFamilyName(raw) {
  const value = String(raw ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (value.length < 1 || value.length > MAX_FAMILY_NAME) return no("fa.errName");
  return ok(value);
}

export function cleanInviteCode(raw) {
  const value = String(raw ?? "")
    .trim()
    .toUpperCase();
  if (value.length !== CODE_LENGTH) return no("fa.errCode");
  for (const ch of value) if (!CODE_ALPHABET.includes(ch)) return no("fa.errCode");
  return ok(value);
}

export function cleanMissionTitle(raw) {
  const value = String(raw ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (value.length < 1 || value.length > MAX_MISSION_TITLE) return no("fa.errTitle");
  return ok(value);
}

export function cleanMissionTarget(raw) {
  // Spasi dibuang dulu karena orang mengetik "1 000", tapi karakter lain tidak:
  // "12abc" harus ditolak, bukan diam-diam jadi 12.
  const digits = String(raw ?? "")
    .replace(/\s/g, "");
  if (!/^\d+$/.test(digits)) return no("fa.errTarget");
  const value = Math.round(Number(digits));
  if (!Number.isFinite(value) || value < 1 || value > MAX_MISSION_TARGET) return no("fa.errTarget");
  return ok(value);
}

export function cleanDescription(raw) {
  return String(raw ?? "")
    .trim()
    .slice(0, 400);
}

/** Kode undangan acak untuk mode demo. */
export function newInviteCode(rand = Math.random) {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    out += CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length)];
  }
  return out;
}

/** "2026-10-04" dari timestamp apa pun yang bisa dibaca Date. */
export function dayKey(value) {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function contributionsToday(contributions, userId, today) {
  if (!Array.isArray(contributions) || !today) return 0;
  return contributions.filter((c) => c.userId === userId && dayKey(c.createdAt) === today).length;
}

/**
 * Apakah user masih boleh menambah satu kontribusi ke misi ini.
 * Mengembalikan { ok: true } atau { ok: false, key } dengan key locale yang
 * bisa langsung dipakai showToast.
 */
export function canContribute({ mission, contributions, userId, today }) {
  if (!mission) return no("fa.errNoMission");
  if (mission.status === "cancelled") return no("fa.errCancelled");
  if (mission.status === "completed" || mission.current >= mission.target) {
    return no("fa.errMissionDone");
  }
  if (contributionsToday(contributions, userId, today) >= MAX_DAILY_CONTRIBUTIONS) {
    return no("fa.errQuota");
  }
  return { ok: true };
}

/** Progress misi untuk bar: persen selalu 0-100 dan tidak pernah NaN. */
export function missionProgress(mission) {
  const target = Math.max(1, Number(mission?.target) || 1);
  const current = Math.max(0, Number(mission?.current) || 0);
  const pct = Math.max(0, Math.min(100, Math.round((current / target) * 100)));
  const done = mission?.status === "completed" || current >= target;
  return { current, target, pct, done, left: Math.max(0, target - current) };
}

/** Siapa saja yang sudah berkontribusi, untuk chip di kartu misi. */
export function contributorTally(contributions, missionId) {
  const tally = new Map();
  (contributions || [])
    .filter((c) => c.missionId === missionId)
    .forEach((c) => tally.set(c.userId, (tally.get(c.userId) || 0) + Number(c.value || 0)));
  return [...tally.entries()]
    .map(([userId, value]) => ({ userId, value }))
    .sort((a, b) => b.value - a.value);
}
