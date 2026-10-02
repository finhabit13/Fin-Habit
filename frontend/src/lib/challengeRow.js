/**
 * Pemetaan baris tabel `challenges` ke bentuk yang dipakai app, dan
 * sebaliknya.
 *
 * Dipisah dari api.js karena keduanya fungsi murni tanpa dependency apa pun,
 * dan justru bagian ini yang pernah merusak data: bentuk yang dipakai form
 * admin (minutes/points/description) berbeda dari bentuk yang dipakai objek
 * challenge di memori (min/pts/desc). Waktu keduanya masuk ke satu mapper
 * yang hanya mengenali salah satu, kolom yang tidak dikenali diam-diam jatuh
 * ke nilai default dan menimpa data yang ada.
 */

/** Baris database → objek challenge di memori. */
export const fromChallengeRow = (r) => ({
  id: r.id,
  cat: r.kind,
  kind: r.kind,
  title: r.title,
  desc: r.description || "",
  source: r.source || "",
  url: r.url || "",
  steps: Array.isArray(r.steps) ? r.steps : [],
  min: Number(r.minutes) || 5,
  pts: Number(r.points) || 20,
  dim: r.dim || "goal",
  active: r.active !== false,
  position: Number(r.position) || 0,
  createdAt: r.created_at
});

/**
 * Objek challenge → baris database, untuk insert dan update.
 *
 * Dua sifat yang disengaja:
 *
 * 1. Menerima kedua nama field. Bentuk form memakai minutes/points/desc,
 *    bentuk objek dari database memakai min/pts. Menolak salah satu berarti
 *    pemanggil yang lupa akan otomatis merusak barisnya.
 *
 * 2. Hanya menulis kolom yang benar-benar ada di payload. Ini yang mencegah
 *    toggle satu flag menimpa kolom lain. Dulu mapper ini selalu membangun
 *    baris utuh, jadi `update { active: false }` diam-diam menulis ulang
 *    minutes dan points menjadi 5 dan 20.
 */
export const toChallengeRow = (b = {}) => {
  const row = {};

  // Kolom teks hanya ditulis kalau kuncinya ada di payload. (b.title || "")
  // tidak bisa dipakai karena hasilnya tidak pernah undefined, jadi kolom
  // tetap ikut terkosongkan pada patch parsial.
  const putText = (col, val) => {
    if (val !== undefined) row[col] = (val || "").trim();
  };
  const put = (col, val) => {
    if (val !== undefined) row[col] = val;
  };

  put("kind", b.kind);
  putText("title", b.title);
  putText("description", b.desc ?? b.description);
  putText("source", b.source);
  putText("url", b.url);
  put("steps", Array.isArray(b.steps) ? b.steps.map((s) => String(s).trim()).filter(Boolean) : b.steps);
  put("dim", b.dim);
  put("active", b.active === undefined ? undefined : b.active !== false);
  put("position", b.position === undefined ? undefined : Number(b.position) || 0);

  const minutes = b.minutes ?? b.min;
  if (minutes !== undefined) row.minutes = Number(minutes) || 5;

  const points = b.points ?? b.pts;
  if (points !== undefined) row.points = Number(points) || 20;

  return row;
};
