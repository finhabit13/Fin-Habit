/**
 * Perhitungan untuk satu goal tabungan.
 *
 * Semua fungsi di sini murni: tidak menyentuh database, jaringan, atau
 * locale. Itu disengaja, karena angka-angka ini yang jadi dasar UX
 * (berapa hari lagi, merah atau hijau) dan lebih mudah dipercaya kalau
 * bisa diuji tanpa membuka browser.
 *
 * Istilah yang dipakai di bawah:
 *   balance  = total pemasukan dikurangi total pengeluaran
 *   cadence  = rencana menabung per hari/minggu/bulan
 *   pace     = Kenyataan dibandingkan rencana, bukan sekadar sisa target
 */

export const CADENCE_UNITS = ["day", "week", "month"];

/** Hari dalam satu bulan untuk konversi. 30, sama seperti halaman saving lama. */
const DAYS_PER_WEEK = 7;
const DAYS_PER_MONTH = 30;

const DAY_MS = 86400000;

/**
 * Ubah cadence jadi nominal per hari.
 *
 * Dikembalikan sebagai 0 kalau cadencenya 0, karena "0 per hari" bukan
 * berarti tak hingga hari, tapi berarti tidak ada rencana. Caller wajib
 * membedakan keduanya; di sini keduanya menjadi 0 supaya tidak ada
 * pembagian dengan nol yang lolos diam-diam.
 */
export function dailyRate(cadenceAmount, cadenceUnit) {
  const n = Number(cadenceAmount);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (cadenceUnit === "week") return n / DAYS_PER_WEEK;
  if (cadenceUnit === "month") return n / DAYS_PER_MONTH;
  return n;
}

/** Sisa uang yang perlu dikumpulkan. Tidak pernah negatif. */
export function remaining(target, balance) {
  return Math.max(0, (Number(target) || 0) - (Number(balance) || 0));
}

/**
 * Berapa hari lagi menurut rencana yang sedang berlaku.
 *
 * Mengembalikan null, bukan 0 atau Infinity, ketika tidak ada cadence.
 * "Tidak punya rencana" dan "sudah selesai" adalah dua keadaan yang
 * berbeda, dan menyatukannya jadi 0 akan menampilkan "tuntas" untuk
 * orang yang justru belum punya rencana.
 */
export function daysLeft(target, balance, cadenceAmount, cadenceUnit) {
  const need = remaining(target, balance);
  if (need <= 0) return 0;
  const rate = dailyRate(cadenceAmount, cadenceUnit);
  if (rate <= 0) return null;
  return Math.ceil(need / rate);
}

/** Berapa hari sejak goal dibuat. Dibatasi 0 agar jam yang lebih cepat tidak negatif. */
export function elapsedDays(createdAt, now = Date.now()) {
  const t = new Date(createdAt).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, Math.floor((now - t) / DAY_MS));
}

/**
 * Berapa lama rencana itu harus berjalan.
 *
 * Dihitung dari target penuh, bukan dari sisa sekarang, karena yang jadi
 * pembanding "terlambat atau tidak" adalah rencana awal.
 */
export function plannedDays(target, cadenceAmount, cadenceUnit) {
  const t = Number(target) || 0;
  const rate = dailyRate(cadenceAmount, cadenceUnit);
  if (t <= 0 || rate <= 0) return null;
  return Math.ceil(t / rate);
}

/**
 * Status kecepatan menabung dibanding rencana.
 *
 * `ahead` hijau, `onTrack` kuning, `late` merah, `done` kalau target sudah
 * tercapai, `unknown` kalau tidak ada rencana untuk dibandingkan.
 *
 * Dua hal yang sengaja dijaga di sini. Pertama, hari pertama tidak pernah
 * dihukur merah: dengan elapsed 0, expectedCollected 0, dan perbandingan
 * apa pun jadi tidak bermakna. Kedua, target yang sudah tercapai tidak
 * pernah merah walaupun waktunya panjang, karena orang yang berhenti
 * menabung setelah target tercapai bukan berarti gagal.
 */
export function pace(target, balance, createdAt, cadenceAmount, cadenceUnit, now = Date.now()) {
  const bal = Number(balance) || 0;
  const tgt = Number(target) || 0;

  if (tgt > 0 && bal >= tgt) return { status: "done", fill: 100 };
  if (dailyRate(cadenceAmount, cadenceUnit) <= 0 || tgt <= 0) return { status: "unknown", fill: 0 };

  const elapsed = elapsedDays(createdAt, now);
  const plan = plannedDays(tgt, cadenceAmount, cadenceUnit);
  const fill = plan && plan > 0 ? Math.min(100, (elapsed / plan) * 100) : 0;

  // Dengan baru satu hari yang lewat, belum ada cukup bahan untuk menyebut
  // seseorang kurang cepat.
  if (elapsed < 1) return { status: "onTrack", fill };

  const expected = dailyRate(cadenceAmount, cadenceUnit) * elapsed;
  if (expected <= 0) return { status: "onTrack", fill };

  const ratio = bal / expected;
  // Toleransinya longgar karena granularitas hari membuat rasio melonjak
  // dan turun pada tanggal yang sedikit. Tanpa ini orang yang menabung
  // dengan rapi akan flickering merah-hijau tiap kali refresh.
  if (ratio >= 1.1) return { status: "ahead", fill };
  if (ratio <= 0.9) return { status: "late", fill };
  return { status: "onTrack", fill };
}

/** Persen terkumpul, untuk progress bar. Dibatasi 100 supaya tidak meluber. */
export function savedPercent(target, balance) {
  const t = Number(target) || 0;
  if (t <= 0) return 0;
  return Math.max(0, Math.min(100, ((Number(balance) || 0) / t) * 100));
}

/**
 * Hitung saldo dari daftar transaksi.
 *
 * Transaksi yang dihapus tidak disimpan sebagai koreksi terpisah, jadi
 * saldo selalu dihitung ulang dari awal. Itu yang membuat penghapusan
 * riwayat otomatis mengurangi total, tanpa ada langkah pembatalan yang
 * bisa terlewat dan membuat saldo meleset.
 */
export function balanceOf(transactions) {
  if (!Array.isArray(transactions)) return 0;
  let total = 0;
  for (const tx of transactions) {
    const n = Number(tx?.amount) || 0;
    if (!Number.isFinite(n)) continue;
    total += tx.kind === "expense" ? -n : n;
  }
  return total;
}

/** Ringkasan satu goal untuk kartu dan header. */
export function summarize(goal, transactions) {
  const balance = balanceOf(transactions);
  const target = Number(goal?.targetAmount) || 0;
  const cadence = goal?.cadenceAmount;
  const unit = goal?.cadenceUnit;
  return {
    balance,
    target,
    remaining: remaining(target, balance),
    percent: savedPercent(target, balance),
    daysLeft: daysLeft(target, balance, cadence, unit),
    pace: pace(target, balance, goal?.createdAt, cadence, unit)
  };
}