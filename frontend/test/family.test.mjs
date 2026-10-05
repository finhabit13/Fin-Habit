/**
 * Family group (bukan misi keluarga harian, itu ada di missions.test.mjs).
 *
 * Yang diuji:
 *   1. fungsi asli dari src/lib/family.js, supaya test ikut gagal kalau
 *      validasinya berubah,
 *   2. angka batas di family.js masih sama dengan yang ada di migration 15,
 *      karena yang kedua tidak dibaca browser sama sekali,
 *   3. adapter live (api.js) dan adapter demo (store.js) punya nama fungsi
 *      yang sama, karena AppContext memanggil keduanya lewat service yang sama,
 *   4. trigger owner-leave tetap membolehkan cascade saat family dihapus,
 *   5. setiap kunci fa.* punya baris ID dan EN dengan teks yang tidak sama
 *      (kunci yang bocor ke satu bahasa akan tampil sebagai raw key).
 */

import {
  CONTRIB_PTS,
  MAX_DAILY_CONTRIBUTIONS,
  MAX_FAMILY_NAME,
  MAX_MISSION_TARGET,
  MAX_MISSION_TITLE,
  canContribute,
  cleanDescription,
  cleanFamilyName,
  cleanInviteCode,
  cleanMissionTarget,
  cleanMissionTitle,
  contributorTally,
  contributionsToday,
  dayKey,
  missionProgress,
  newInviteCode
} from "../src/lib/family.js";
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

// --- validasi input ----------------------------------------------------------

cek("nama family diterima", cleanFamilyName("  Keluarga   Pintar "), { ok: true, value: "Keluarga Pintar" });
cek("nama family kosong ditolak", cleanFamilyName("   ").ok, false);
cek("nama family terlalu panjang ditolak", cleanFamilyName("x".repeat(MAX_FAMILY_NAME + 1)).ok, false);
cek("kode undangan dinormalkan", cleanInviteCode(" ab1c2d "), { ok: true, value: "AB1C2D" });
cek("kode undangan 5 karakter ditolak", cleanInviteCode("AB1C2").ok, false);
cek("kode undangan 7 karakter ditolak", cleanInviteCode("AB1C2D3").ok, false);
// Alfabet kode harus sama dengan generate_invite_code() (md5 hex), jadi huruf
// di luar A-F tidak mungkin ada dan harus ditolak sebelum viagem ke database.
cek("kode undangan huruf di luar hex ditolak", cleanInviteCode("ZZZZZZ").ok, false);
cek("huruf kecil ditolak", cleanInviteCode("zzzzzz").key, "fa.errCode");

cek("judul misi dipangkas spasi", cleanMissionTitle("  Cuci   motor  "), { ok: true, value: "Cuci motor" });
cek("judul misi kosong ditolak", cleanMissionTitle("").ok, false);
cek("judul misi terlalu panjang ditolak", cleanMissionTitle("y".repeat(MAX_MISSION_TITLE + 1)).ok, false);

cek("target angka", cleanMissionTarget("12"), { ok: true, value: 12 });
cek("target dengan spasi", cleanMissionTarget(" 200 "), { ok: true, value: 200 });
cek("target nol ditolak", cleanMissionTarget("0").ok, false);
cek("target melebihi batas ditolak", cleanMissionTarget(String(MAX_MISSION_TARGET + 1)).ok, false);
// "12abc" tidak boleh diam-diam jadi 12.
cek("target huruf dicampur ditolak", cleanMissionTarget("12abc").ok, false);
cek("target kosong ditolak", cleanMissionTarget("").ok, false);
// "7.6" tidak boleh diam-diam jadi 8. Target itu jumlah centang, jadi
// pecahan tidak punya arti; membulatkan akan membuat target yang tidak pernah
// bisa dicentang pengguna.
cek("target desimal ditolak", cleanMissionTarget("7.6").ok, false);

cek("deskripsi dipangkas 400 karakter", cleanDescription("a".repeat(500)).length, 400);

// --- kuota harian ------------------------------------------------------------

const hariIni = "2026-10-04";
const kemarin = "2026-10-03";
const contribution = (userId, createdAt, value = 1, missionId = "m1") => ({
  missionId,
  userId,
  value,
  createdAt
});

cek("dayKey dari timestamp lokal", dayKey("2026-10-04T09:30:00"), hariIni);
cek("dayKey dari objek Date", dayKey(new Date(2026, 9, 4, 23, 59)), hariIni);
cek("dayKey tanggal rusak", dayKey("bukan tanggal"), null);

cek("kontribusi dihitung per hari", contributionsToday([contribution("a", `${hariIni}T08:00:00`)], "a", hariIni), 1);
cek(
  "kontribusi kemarin tidak dihitung",
  contributionsToday([contribution("a", `${kemarin}T08:00:00`)], "a", hariIni),
  0
);
cek(
  "kontribusi anggota lain tidak memotong kuota saya",
  contributionsToday(
    [contribution("a", `${hariIni}T08:00:00`), contribution("b", `${hariIni}T08:00:00`)],
    "a",
    hariIni
  ),
  1
);
cek("kontribusi null aman", contributionsToday(null, "a", hariIni), 0);

// --- boleh contribute atau tidak ---------------------------------------------

const misi = (over = {}) => ({ id: "m1", target: 10, current: 0, status: "active", ...over });
const sudahPenuh = Array.from({ length: MAX_DAILY_CONTRIBUTIONS }, (_, i) =>
  contribution("a", `${hariIni}T0${i}:00:00`)
);

cek("boleh contribute saat misi aktif", canContribute({ mission: misi(), contributions: [], userId: "a", today: hariIni }), {
  ok: true
});
cek(
  "misi lunas menutup Contribute",
  canContribute({ mission: misi({ status: "completed" }), contributions: [], userId: "a", today: hariIni }).key,
  "fa.errMissionDone"
);
// Statusnya masih active tapi current sudah lewat target: trigger sudah akan
// menuliskannya jadi completed, jadi guard di klien tetap harus menutup.
cek(
  "current >= target menutup meski status masih active",
  canContribute({ mission: misi({ current: 10 }), contributions: [], userId: "a", today: hariIni }).key,
  "fa.errMissionDone"
);
cek(
  "kuota habis menutup contribute",
  canContribute({ mission: misi(), contributions: sudahPenuh, userId: "a", today: hariIni }).key,
  "fa.errQuota"
);
cek(
  "kuota empat dari lima masih boleh",
  canContribute({
    mission: misi(),
    contributions: sudahPenuh.slice(0, MAX_DAILY_CONTRIBUTIONS - 1),
    userId: "a",
    today: hariIni
  }),
  { ok: true }
);
cek(
  "misi dibatalkan punya pesan sendiri",
  canContribute({ mission: misi({ status: "cancelled" }), contributions: [], userId: "a", today: hariIni }).key,
  "fa.errCancelled"
);
cek(
  "misi tidak ada ditolak",
  canContribute({ mission: null, contributions: [], userId: "a", today: hariIni }).key,
  "fa.errNoMission"
);

// --- progress & rekap --------------------------------------------------------

cek("progress 0 dari 10", missionProgress(misi()), { current: 0, target: 10, pct: 0, done: false, left: 10 });
cek("progress 3 dari 10", missionProgress(misi({ current: 3 })).pct, 30);
cek("progress tidak pernah melebihi 100", missionProgress(misi({ current: 99, target: 10 })).pct, 100);
cek("left tidak pernah negatif", missionProgress(misi({ current: 12 })).left, 0);
cek("target rusak tidak menghasilkan NaN", missionProgress({ current: 1, target: 0 }).pct, 100);
cek("misi null tidak menghasilkan NaN", missionProgress(undefined).pct, 0);
cek("status completed selalu done", missionProgress(misi({ status: "completed" })).done, true);

cek(
  "rekap kontributor diurutkan dari yang paling banyak",
  contributorTally(
    [
      contribution("a", `${hariIni}T08:00:00`, 1),
      contribution("b", `${hariIni}T08:00:00`, 1),
      contribution("b", `${hariIni}T09:00:00`, 1),
      contribution("c", `${hariIni}T08:00:00`, 1, "m2")
    ],
    "m1"
  ),
  [
    { userId: "b", value: 2 },
    { userId: "a", value: 1 }
  ]
);
cek("rekap tanpa kontribusi", contributorTally([], "m1"), []);
cek("rekap null aman", contributorTally(null, "m1"), []);

// --- kode undangan demo ------------------------------------------------------

const kode = newInviteCode(() => 0.999999);
cek("kode demo 6 karakter", kode.length, 6);
cek("kode demo uppercase", kode, kode.toUpperCase());
cekBenar("kode demo lolos validasi", cleanInviteCode(kode).ok);
cekBenar("kode demo memakai hex", /^[0-9A-F]{6}$/.test(kode));

// --- migration 15 harus punya batas yang sama ---------------------------------

const sql = readFileSync("supabase/migration-15-family-system.sql", "utf8");

cekBenar(
  "target maksimum di SQL sama dengan batas di family.js",
  sql.includes(`target > 0 and target <= ${MAX_MISSION_TARGET}`)
);
cekBenar("batas nilai kontribusi ada di SQL", /value > 0 and value <= \d+/.test(sql));
cekBenar(
  "kuota harian di SQL sama dengan batas di family.js",
  sql.includes(`c.user_id = auth.uid() and c.created_at >= date_trunc('day', now())) < ${MAX_DAILY_CONTRIBUTIONS}`)
);
cekBenar("batas anggota 8 ada di SQL", sql.includes("select 8"));
cekBenar("batas panjang nama ada di SQL", sql.includes(`length(trim(name))<=${MAX_FAMILY_NAME}`));

// Owner tidak boleh keluar sendiri, tapi cascade dari delete families harus
// tetap boleh. Tanpa penjaga exists() di sini, owner tidak akan pernah bisa
// menghapus family-nya sendiri.
cekBenar(
  "trigger owner-leave tetap meloloskan cascade",
  /old\.role = 'owner'\s+and exists \(select 1 from public\.families f where f\.id = old\.family_id\)/.test(sql)
);

// Klien tidak bisa membuat family atau gabung lewat insert biasa, jadi dua RPC
// ini wajib ada. Tanpa keduanya, seluruh UI family gagal di mode live.
cekBenar("RPC create_family ada", sql.includes("create or replace function public.create_family(p_name text)"));
cekBenar("RPC join_family ada", sql.includes("create or replace function public.join_family(p_code text)"));
cekBenar(
  "kedua RPC hanya untuk authenticated",
  (sql.match(/grant execute on function public\.\w+\(text\) to authenticated;/g) || []).length === 2
);
cekBenar("view family_roster ada", sql.includes("create or replace view public.family_roster"));

// --- RLS ---------------------------------------------------------------------

// RLS harus aktif di keempat tabel, dan tidak boleh dipaksa untuk owner
// (force row level security): kalau aktif, SQL Editor dan trigger yang
// menulis sebagai postgres ikut terkunci.
["families", "family_members", "family_missions", "family_mission_contributions"].forEach((tbl) => {
  cekBenar("RLS enabled di " + tbl, sql.includes("alter table public." + tbl + " enable row level security"));
});
cekBenar("tidak ada force row level security", !/force row level security/i.test(sql));
cekBenar("tidak ada disable row level security", !/disable row level security/i.test(sql));

// RLS menyaring baris, grant yang memberi hak akses tabel. Tanpa grant, tabel
// yang dibuat lewat SQL editor ditolak lebih dulu dengan "permission denied
// for table", dan gejalanya mirip dengan policy yang salah.
cekBenar("grant ke authenticated untuk families", /grant select, delete on public\.families to authenticated;/.test(sql));
cekBenar("grant ke authenticated untuk family_members", /grant select, delete on public\.family_members to authenticated;/.test(sql));
cekBenar("grant ke authenticated untuk family_missions", /grant select, insert, delete on public\.family_missions to authenticated;/.test(sql));
cekBenar(
  "grant ke authenticated untuk family_mission_contributions",
  /grant select, insert on public\.family_mission_contributions to authenticated;/.test(sql)
);
cekBenar("tidak ada grant untuk anon", !/grant[^;]*to anon/i.test(sql));

// Setiap badan fungsi harus diapit $$ ... $$. Postgres hanya menerima string
// literal sebagai badan fungsi, jadi "as select 8" atau "as begin ..." tanpa
// kutip ditolak dengan "syntax error at or near select" dan seluruh migrasi
// berhenti di baris itu. Baris komentar tidak ikut dihitung, karena penjelasan
// sengaja menyebut contoh sintaks yang salah.
const kodeSql = sql
  .split(/\r?\n/)
  .filter((b) => !b.trim().startsWith("--"))
  .join("\n");

const definisi = (kodeSql.match(/create or replace function/g) || []).length;
const kutipDolar = (kodeSql.match(/\$\$/g) || []).length;
cek("jumlah definisi fungsi", definisi, 7);
cek("setiap fungsi punya $$ pembuka dan penutup", kutipDolar, definisi * 2);
cekBenar(
  "tidak ada badan fungsi tanpa dollar-quoting",
  // Gap-nya hanya spasi/tab: "as\n select" milik CREATE VIEW, bukan badan
  // fungsi, jadi harus lolos.
  !/\bas[ \t]+(begin|select|declare|with)\b/i.test(kodeSql)
);

// Migrasi ini sudah pernah dicoba dan bisa dijalankan ulang, jadi setiap
// create policy harus didahului drop policy if exists dengan nama sama.
// Tanpa itu percobaan kedua berhenti di "policy ... already exists".
const namaPolicy = [...kodeSql.matchAll(/create policy "([^"]+)"/g)].map((m) => m[1]);
const tanpaDrop = namaPolicy.filter(
  (nama) => !new RegExp(`drop policy if exists "${nama}"`).test(kodeSql)
);
// families 4 + family_members 3 + family_missions 4 + kontribusi 3 = 14
cek("jumlah policy", namaPolicy.length, 14);
cek("tiada policy tanpa drop policy if exists", tanpaDrop.length, 0);

// Fungsi yang boleh menulis tabel lain harus mengunci search_path, supaya tidak
// bisa dialihkan lewat objek milik schema lain.
const blokFungsi = kodeSql.split("create or replace function").slice(1);
const tanpaSearchPath = blokFungsi.filter(
  (b) => /security definer/i.test(b) && !/set search_path = public/i.test(b)
);
cek("fungsi definer semuanya mengunci search_path", tanpaSearchPath.length, 0);

// Trigger harus security definer. Kalau tidak, UPDATE di dalam trigger kena
// filter RLS sebagai anggota biasa: 0 baris terupdate tanpa error, jadi
// current misi tidak pernah naik dan baris profile tidak pernah tersinkron.
cekBenar(
  "trigger progress jalan sebagai owner",
  /create or replace function public\.update_family_mission_progress\(\)[\s\S]*?security definer/.test(sql)
);
cekBenar(
  "trigger sync profile jalan sebagai owner",
  /create or replace function public\.sync_profile_family_id\(\)[\s\S]*?security definer/.test(sql)
);

// --- parity adapter ----------------------------------------------------------

const ADAPTER_METHODS = [
  "family",
  "createFamily",
  "joinFamily",
  "leaveFamily",
  "deleteFamily",
  "kickMember",
  "createFamilyMission",
  "deleteFamilyMission",
  "contribute"
];

const apiSrc = readFileSync("src/lib/api.js", "utf8");
const storeSrc = readFileSync("src/lib/store.js", "utf8");

// Bentuk penulisan tidak harus sama: api.js memakai property arrow function,
// store.js memakai method shorthand. Yang penting AppContext bisa memanggil
// service.createFamily(...) tanpa tahu mana yang sedang aktif.
const punyaMethod = (src, name) =>
  new RegExp("\\n  (?:" + name + ": async|async " + name + "\\()").test(src);

ADAPTER_METHODS.forEach((name) => {
  cekBenar("api.js punya " + name, punyaMethod(apiSrc, name));
  cekBenar("store.js punya " + name, punyaMethod(storeSrc, name));

// seedFamily() dipanggil dari dalam load(), jadi tidak boleh membaca state
// modul db: db diassign dari hasil load() itu sendiri ("let db = load()"),
// jadi baris yang membacanya ada di dead zone dan akan melempar ReferenceError
// tepat ketika localStorage masih kosong. Bundle produksi menutupinya jadi
// "Cannot access 'N' before initialization" dan seluruh aplikasi putih.
const isiSeedFamily = (storeSrc.match(/function seedFamily\([\s\S]*?\n\}/) || [""])[0];
cek("seedFamily ditemukan", isiSeedFamily.length > 0, true);
cekBenar("seedFamily tidak membaca state modul db", !/\bdb\b/.test(isiSeedFamily));
});

// Hadiah kontribusi harus tetap memakai konstanta yang sama, bukan angka yang
// diketik ulang: nilai ini menentukan berapa poin yang ditambahkan mutateUser.
const rewardsSrc = readFileSync("src/lib/rewards.js", "utf8");
cekBenar("rewards.js mengimpor CONTRIB_PTS dari family.js", /import \{ CONTRIB_PTS \} from "\.\/family"/.test(rewardsSrc));
cekBenar(
  "applyContribution memakai CONTRIB_PTS",
  /export function applyContribution\(user, opts = \{\}\) \{\s*return applyReward\(user, CONTRIB_PTS/.test(rewardsSrc)
);
cekBenar("poin per kontribusi bernilai positif", CONTRIB_PTS > 0);

// --- locales: ID dan EN harus lengkap dan tidak sama ----------------------------

const locales = readFileSync("src/lib/locales.js", "utf8");
const blok = (nama) => {
  const m = locales.match(new RegExp("const " + nama + " = \\{([\\s\\S]*?)\\n\\};"));
  if (!m) throw new Error("blok " + nama + " tidak ditemukan di locales.js");
  return m[1];
};
const faKeys = (teks) =>
  [...teks.matchAll(/"(fa\.[^"]+)":\s*"((?:[^"\\]|\\.)*)"/g)].map((x) => [x[1], x[2]]);

const idFa = faKeys(blok("UI_ID"));
const enFa = faKeys(blok("UI_EN"));
const idMap = new Map(idFa);
const enMap = new Map(enFa);

cek("jumlah kunci fa. sama di ID dan EN", enMap.size, idMap.size);
cek("kunci fa. di ID unik", idMap.size, idFa.length);
cek("kunci fa. di EN unik", enMap.size, enFa.length);
cek("kunci fa. ada di ID tapi tidak di EN", idFa.map((x) => x[0]).filter((k) => !enMap.has(k)), []);
cek("kunci fa. ada di EN tapi tidak di ID", enFa.map((x) => x[0]).filter((k) => !idMap.has(k)), []);

// Tidak semua kunci harus berbeda: "Budget", "Status", dan "Target" memang
// sama di dua bahasa, dan halaman misi keluarga lama juga memang memakai
// "Family Mission" di locale ID. Yang tidak boleh bocor adalah kalimat utuh:
// kalau salah salin, satu blok ID akan tampil persis seperti blok EN.
const HARUS_BERBEDA = [
  "fa.groupSub",
  "fa.noFamilyHint",
  "fa.inviteHint",
  "fa.noMissionsHint",
  "fa.noMissionsHintMember",
  "fa.confirmLeaveBody",
  "fa.confirmKickBody",
  "fa.confirmDeleteBody",
  "fa.confirmMissionBody",
  "fa.quotaToday",
  "fa.leftCount",
  "fa.contribDone",
  "fa.missionCreated",
  "fa.errName",
  "fa.errCode",
  "fa.errTarget",
  "fa.errQuota"
];
cek(
  "kalimat fa. tidak ada yang tertinggal Bahasa Indonesia",
  HARUS_BERBEDA.filter((k) => idMap.get(k) === enMap.get(k)),
  []
);
cek(
  "kalimat yang diuji memang ada di dua bahasa",
  HARUS_BERBEDA.filter((k) => !idMap.has(k) || !enMap.has(k)),
  []
);

// Kunci fa.* yang dipakai halaman Family dan GroupSection harus benar-benar
// ada di dua bahasa. locale-keys.test.mjs sudah cek keberadaan kuncinya, tapi
// hanya dari seluruh tabel, jadi tidak bisa membedakan ID vs EN.
const dipakai = [...readFileSync("src/pages/family/GroupSection.jsx", "utf8").matchAll(/t\("(fa\.[^"]+)"\)/g)]
  .map((x) => x[1])
  .concat([...readFileSync("src/pages/family/FamilyForm.jsx", "utf8").matchAll(/t\("(fa\.[^"]+)"\)/g)].map((x) => x[1]))
  .concat([...readFileSync("src/pages/family/MissionForm.jsx", "utf8").matchAll(/t\("(fa\.[^"]+)"\)/g)].map((x) => x[1]));
cek("halaman family memakai kunci yang ada", dipakai.filter((k) => !idMap.has(k)), []);

console.log("");
if (gagal) {
  console.error(gagal + " pemeriksaan gagal");
  process.exit(1);
}
console.log("SEMUA TEST FAMILY LULUS");
