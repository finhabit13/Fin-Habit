/**
 * Misi keluarga harian.
 *
 * Yang diuji adalah fungsi asli dari src/lib, bukan replikanya, supaya test
 * ini ikut gagal kalau util.js atau data.js berubah.
 *
 * Fokusnya bukan apakah undiannya terasa acak, tapi tiga hal yang kalau rusak
 * akan diam-diam gagal di produksi:
 *   1. undian hari ini selalu MISSIONS_PER_DAY misi yang ada di pool,
 *   2. undian stabil di hari yang sama, dan berubah di hari berikutnya,
 *   3. locales.js punya terjemahan untuk setiap misi, dan nilai pts di data.js
 *      tidak menyimpang dari teks hadiah.
 */

import { MISSIONS, MISSIONS_PER_DAY } from "../src/lib/data.js";
import { dailyMissions } from "../src/lib/util.js";
import { readFileSync } from "node:fs";

let gagal = 0;
const cek = (nama, aktual, harus) => {
  const ok = JSON.stringify(aktual) === JSON.stringify(harus);
  if (!ok) {
    gagal++;
    console.error("GAGAL " + nama);
    console.error("  dapat: " + JSON.stringify(aktual));
    console.error("  harus: " + JSON.stringify(harus));
  } else {
    console.log("ok   " + nama);
  }
};
const cekBenar = (nama, nilai) => cek(nama, !!nilai, true);

// --- bentuk pool ------------------------------------------------------------

cek("jumlah misi di pool", MISSIONS.length, 12);
cek("misi per hari", MISSIONS_PER_DAY, 2);
cek("jumlah hari yang bisa dijamin", MISSIONS.length / MISSIONS_PER_DAY, 6);
cek(
  "id misi unik",
  MISSIONS.map((m) => m.id),
  MISSIONS.map((m) => m.id).filter((v, i, a) => a.indexOf(v) === i)
);
cekBenar("semua misi punya pts", MISSIONS.every((m) => m.pts > 0));
cekBenar("semua misi punya dim", MISSIONS.every((m) => !!m.dim));
cekBenar("semua misi punya icon", MISSIONS.every((m) => !!m.icon));

// Minimal tiga dimensi, karena dailyMissions() berusaha memilih dua misi
// dengan dimensi berbeda. Kalau pool cuma satu dimensi, diversifikasi diam-diam
// tidak terjadi dan test ini tidak akan menangkapnya.
cek(
  "jumlah dimensi berbeda",
  new Set(MISSIONS.map((m) => m.dim)).size >= 3,
  true
);

// Teks hadiah harus menyebut poin yang sama dengan pts. Kalau tidak, kartu
// menampilkan "+50 poin" padahal yang sebenarnya dapat 45.
cek(
  "poin di reward cocok dengan pts",
  MISSIONS.filter((m) => !m.reward.includes("+" + m.pts)),
  []
);

// --- undian -----------------------------------------------------------------

const hari = (n) => {
  const d = new Date(Date.UTC(2026, 0, 1 + n));
  return d.toISOString().slice(0, 10);
};

const ids = (tanggal) =>
  dailyMissions(MISSIONS, MISSIONS_PER_DAY, tanggal).map((m) => m.id);

// 1. Hari tetap menghasilkan undian yang sama.
cek("undian stabil dalam satu hari", ids(hari(0)), ids(hari(0)));

// 2. Tepat MISSIONS_PER_DAY misi, tanpa duplikat.
const hariIni = ids(hari(3));
cek("jumlah misi hari ini", hariIni.length, MISSIONS_PER_DAY);
cek("tidak ada misi ganda", hariIni.length, new Set(hariIni).size);

// 3. Semua id yang muncul benar-benar ada di pool.
cekBenar(
  "id undian ada di pool",
  hariIni.every((id) => MISSIONS.some((m) => m.id === id))
);

// 4. Dua dimensi berbeda per hari.
const dims = dailyMissions(MISSIONS, MISSIONS_PER_DAY, hari(3)).map((m) => m.dim);
cek("dua dimensi berbeda", dims.length, new Set(dims).size);

// 5. Undian tidak boleh membeku. Dua hari berturut-turut boleh kebetulan
//    sama, tapi mayoritas hari harus berbeda.
//
//    Dulu test ini menuntut 30 dari 30 pasang berbeda dan itu kelewatan.
//    Dari 12 misi yang diambil dua-dua, tabrakan berpasangan itu wajar dan
//    bukan bug. Yang dijaga hanya supaya variannya cukup.
const pasangan = new Set();
for (let i = 0; i < 30; i++) pasangan.add(ids(hari(i)).join(","));
cek("undian berubah antar hari", pasangan.size >= 24, true);

// 6. Setiap misi setidaknya muncul sekali dalam 30 hari. Kalau ada misi yang
//    tidak pernah muncul, menulisnya di data.js tidak ada gunanya.
const muncul = new Set();
for (let i = 0; i < 30; i++) ids(hari(i)).forEach((id) => muncul.add(id));
cek(
  "semua misi pernah muncul",
  [...muncul].sort(),
  MISSIONS.map((m) => m.id).sort()
);

// 7. Keadilan. Misi yang hampir tidak pernah muncul sama saja dengan misi
//    yang tidak ditulis sama sekali. Dulu pengundian selalu mengambil
//    peringkat teratas di dalam dimensinya, jadi misi yang rarer di dimensi
//    yang ramai hampir tidak pernah tampil. Ini alasan test ini ada.
const hitung = new Map(MISSIONS.map((m) => [m.id, 0]));
for (let i = 0; i < 365; i++) {
  for (const m of dailyMissions(MISSIONS, MISSIONS_PER_DAY, hari(i))) {
    hitung.set(m.id, hitung.get(m.id) + 1);
  }
}
const freq = [...hitung.values()];
const palingJarang = Math.min(...freq);
const palingSering = Math.max(...freq);
console.log("     frekuensi 365 hari: " + MISSIONS.map((m) => m.id + "=" + hitung.get(m.id)).join(" "));
cek("misi paling jarang tetap muncul", palingJarang >= 30, true);
cek("selisih frekuensi tidak terpisah jauh", palingSering / palingJarang <= 2.2, true);

// 8. Semua pasangan dimensi harus bisa muncul. Kalau cuma sebagian yang
//    tercapai, berarti urutan dimensinya tidak benar-benar diacak.
const pairDim = new Set();
for (let i = 0; i < 365; i++) {
  pairDim.add(
    dailyMissions(MISSIONS, MISSIONS_PER_DAY, hari(i)).map((m) => m.dim).join("+")
  );
}
const jumlahDim = new Set(MISSIONS.map((m) => m.dim)).size;
cek(
  "semua pasangan dimensi tercapai",
  pairDim.size,
  jumlahDim * (jumlahDim - 1)
);

// --- locales ----------------------------------------------------------------

const locales = readFileSync("src/lib/locales.js", "utf8");

const ambilId = (nama) => {
  const m = locales.match(new RegExp("const " + nama + " = \\[([\\s\\S]*?)\\n\\];"));
  if (!m) throw new Error("blok " + nama + " tidak ditemukan di locales.js");
  return [...m[1].matchAll(/id:\s*"([^"]+)"/g)].map((x) => x[1]);
};

const idId = ambilId("MISSIONS_ID");
const idEn = ambilId("MISSIONS_EN");

cek("terjemahan ID lengkap", idId, MISSIONS.map((m) => m.id));
cek("terjemahan EN lengkap", idEn, MISSIONS.map((m) => m.id));

console.log("");
if (gagal) {
  console.error(gagal + " pemeriksaan gagal");
  process.exit(1);
}
console.log("SEMUA TEST MISI LULUS");