import { readFileSync, readdirSync } from "node:fs";

/**
 * Setiap kunci yang dipanggil sebagai t("kunci") harus benar-benar ada di
 * locales.js.
 *
 * Kenapa ini perlu test: i18n yang salah bukan error, bukan warning.
 * t("common.cancel") yang tidak ada akan dirender apa adanya sebagai teks
 * "common.cancel" di tombol, dan itu lolos build, lolos smoke test, baru
 * ketahuan setelah orang klik. Test ini gagal lebih cepat.
 *
 * Kunci dinamis (t("bu." + status)) dilewati, karena nilainya tidak bisa
 * diketahui tanpa menjalankan aplikasinya. Kunci itu dicek terpisah secara
 * manual saat ditambahkan.
 */

const SRC = "src";

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p, out);
    else if (/\.(jsx?|mjs)$/.test(e.name)) out.push(p);
  }
  return out;
};

const files = walk(SRC).filter((f) => !f.endsWith("locales.js"));
const locales = readFileSync(`${SRC}/lib/locales.js`, "utf8");

const defined = new Set(
  [...locales.matchAll(/"([a-zA-Z]+\.[A-Za-z0-9._]+)"\s*:/g)].map((m) => m[1])
);

// Tangkap t("kunci") dan t('kunci'). Kunci yang dirangkai operator +
// atau template literal ikut dicatat sebagai dinamis, lalu tidak diperiksa:
// nilainya baru diketahui saat aplikasi jalan.
const CALL = /\bt\(\s*(['"])([^'"]+)\1/g;
const DYNAMIC = /\bt\(\s*['"]([^'"]+)['"]\s*(?:\+|`)/g;

const used = new Map();
const dynamic = new Set();

for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(DYNAMIC)) dynamic.add(m[1]);
  for (const m of src.matchAll(CALL)) {
    if (!used.has(m[2])) used.set(m[2], f);
  }
}

// Buang yang sudah teridentifikasi dinamis dari daftar yang wajib ada.
for (const d of dynamic) used.delete(d);

const missing = [...used.entries()].filter(([k]) => !defined.has(k));

console.log(`kunci locale terpakai: ${used.size}`);
console.log(`kunci locale terdaftar: ${defined.size}`);
console.log(`kunci dinamis (dilewati): ${dynamic.size}`);

if (missing.length) {
  console.error(`\n${missing.length} kunci hilang:`);
  for (const [k, f] of missing) console.error(`  ${k}  <- ${f}`);
  process.exit(1);
}

// Kunci yang didaftarkan tapi tidak dipakai lagi bukan bug, jadi tidak
// digagalkan di sini. Hanya pemanggil yang hilang yang bahaya.

const cjk = /[\u3000-\u9fff\u0400-\u04ff\ufffd]/;
const dirty = [];
for (const f of [...files, "supabase/migration-10-saving-goals.sql"]) {
  let src;
  try {
    src = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  src.split("\n").forEach((line, i) => {
    if (cjk.test(line)) dirty.push(`${f}:${i + 1}`);
  });
}

if (dirty.length) {
  console.error(`\nkarakter asing (CJK/Cyrillic/replacement) di ${dirty.length} baris:`);
  for (const d of dirty) console.error(`  ${d}`);
  process.exit(1);
}

console.log("\nSEMUA TEST LULUS");