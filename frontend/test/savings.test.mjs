import {
  balanceOf,
  dailyRate,
  daysLeft,
  elapsedDays,
  pace,
  plannedDays,
  remaining,
  savedPercent,
  summarize
} from "../src/lib/savings.js";

const HARI = 86400000;
const NOW = new Date("2026-06-15T12:00:00Z").getTime();
const lalu = (hari) => new Date(NOW - hari * HARI).toISOString();

let gagal = 0;
const cek = (nama, aktual, harus) => {
  const ok = JSON.stringify(aktual) === JSON.stringify(harus);
  if (!ok) gagal++;
  console.log((ok ? "LULUS  " : "GAGAL  ") + nama);
  if (!ok) {
    console.log("        dapat: " + JSON.stringify(aktual));
    console.log("        mau : " + JSON.stringify(harus));
  }
};

// --- dailyRate: konversi ke per hari
cek("harian tidak diubah", dailyRate(50000, "day"), 50000);
cek("mingguan dibagi 7", dailyRate(350000, "week"), 50000);
cek("bulanan dibagi 30", dailyRate(1500000, "month"), 50000);
cek("cadence 0 berarti tidak ada rencana", dailyRate(0, "day"), 0);
cek("cadence negatif diabaikan", dailyRate(-5, "day"), 0);
cek("unit ngaco tidak crash", dailyRate(50000, "abad"), 50000);

// --- remaining & daysLeft
cek("sisa tidak negatif", remaining(100, 150), 0);
cek("sisa biasa", remaining(1000, 250), 750);
cek("hari lagi dari plans harian", daysLeft(1000, 250, 250, "day"), 3);
cek("sudah tercapai berarti 0 hari", daysLeft(1000, 1000, 250, "day"), 0);
cek("tanpa plans menghasilkan null bukan 0", daysLeft(1000, 250, 0, "day"), null);
cek("pembulatan ke atas", daysLeft(1000, 0, 300, "day"), 4);

// --- plannedDays
cek("rencana harian", plannedDays(1000, 250, "day"), 4);
cek("tanpa cadence tidak ada rencana", plannedDays(1000, 0, "day"), null);

// --- elapsedDays
cek("nol hari untuk goal baru", elapsedDays(lalu(0), NOW), 0);
cek("lima hari lalu", elapsedDays(lalu(5), NOW), 5);
cek("tanggal rusak tidak jadi NaN", elapsedDays("bukan tanggal", NOW), 0);
cek("tanggal depan tidak negatif", elapsedDays(lalu(-3), NOW), 0);

// --- pace
cek("baru dibuat belum merah", pace(1000, 0, lalu(0), 250, "day", NOW).status, "onTrack");
cek("belum sehari lalu tidak assesses", pace(1000, 0, lalu(0.5), 250, "day", NOW).status, "onTrack");
cek("telat menabung", pace(1000, 100, lalu(4), 250, "day", NOW).status, "late");
// Rasio 1:1 dari rencana, tapi saldo belum sampai target.
cek("tepat sesuai rencana", pace(2000, 1000, lalu(4), 250, "day", NOW).status, "onTrack");
// Rencana 250/hari, baru 2 hari berjalan jadi harapan 500. Saldo 1000.
cek("lebih cepat dari rencana", pace(2000, 1000, lalu(2), 250, "day", NOW).status, "ahead");
cek("target tercapai selalu done", pace(1000, 5000, lalu(99), 1, "day", NOW).status, "done");
cek("tanpa cadence tidak bisa dinilai", pace(1000, 0, lalu(5), 0, "day", NOW).status, "unknown");
cek("fill tidak pernah di atas 100", pace(1000, 0, lalu(999), 250, "day", NOW).fill, 100);

// --- savedPercent
cek("persen dasar", savedPercent(1000, 250), 25);
cek("persen tidak melebihi 100", savedPercent(1000, 5000), 100);
cek("target 0 menghasilkan 0 bukan NaN", savedPercent(0, 500), 0);

// --- balanceOf: penghapusan riwayat otomatis mengurangi saldo
const riwayat = [
  { kind: "income", amount: 100000 },
  { kind: "income", amount: 50000 },
  { kind: "expense", amount: 30000 }
];
cek("saldo pemasukan dikurangi pengeluaran", balanceOf(riwayat), 120000);
cek("hapus satu pemasukan", balanceOf(riwayat.slice(1)), 20000);
cek("hapus semua", balanceOf([]), 0);
cek("riwayat bukan array", balanceOf(null), 0);
cek("baris rusak dilewati", balanceOf([{ kind: "income", amount: "x" }, { kind: "income", amount: 10 }]), 10);
cek("pengeluaran lebih besar dari pemasukan boleh negatif", balanceOf([{ kind: "expense", amount: 50 }]), -50);

// --- summarize: bentuk yang dipakai UI
const goal = {
  targetAmount: 1000,
  cadenceAmount: 250,
  cadenceUnit: "day",
  createdAt: lalu(4)
};
const ringkasan = summarize(goal, riwayat);
cek("ringkasan menyatukan semuanya", [ringkasan.balance, ringkasan.percent, ringkasan.daysLeft], [120000, 100, 0]);
cek("pace ikut terbawa", ringkasan.pace.status, "done");
cek("summarize tanpa transaksi", summarize({ targetAmount: 500, createdAt: lalu(1) }, undefined).balance, 0);

console.log(gagal ? "\n" + gagal + " TEST GAGAL" : "\nSEMUA TEST LULUS");
process.exit(gagal ? 1 : 0);