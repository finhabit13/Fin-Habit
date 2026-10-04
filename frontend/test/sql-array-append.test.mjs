/**
 * Penjaga pola append array di PL/pgSQL.
 *
 * Bug ini nyata dan sudah pernah terpakai di MIGRASI 11:
 *
 *   c_fields := c_fields || 'lessons_done';
 *
 * c_fields bertipe text[]. Postgres membaca operand kanan sebagai array
 * literal, bukan sebagai satu elemen, jadi setiap append melempar
 *
 *   ERROR: 22P02: malformed array literal
 *
 * Yang paling menyebalkan, error itu hanya muncul saat clamp benar-benar
 * memotong nilai. Kalau tidak ada yang dipotong, clamp tidak pernah dijalankan
 * dan semuanya terlihat sehat. Saat berhasil bekerja, seluruh UPDATE profil
 * justru ditolak, jadi progres pengguna hilang.
 *
 * Test ini membaca semua file SQL di supabase/ dan gagal kalau pola itu muncul
 * lagi. Murah, dan tidak perlu menjalankan database.
 */

import { readdirSync, readFileSync } from "node:fs";

const DIR = "supabase";

const files = readdirSync(DIR).filter((f) => f.endsWith(".sql"));

// Variabel yang dideklarasikan bertipe array di dalam PL/pgSQL.
const deklarasiArray = /^\s*(\w+)\s+\w+\[\]\s*:?=/gm;

// Baris yang menambahkan satu string polos ke sebuah array.
const appendPolos = /^\s*(\w+)\s*:=\s*\1\s*\|\|\s*'([^']*)'\s*;/;

const masalah = [];

for (const file of files) {
  const baris = readFileSync(`${DIR}/${file}`, "utf8").split(/\r?\n/);

  const array = new Set();
  for (const m of baris.join("\n").matchAll(deklarasiArray)) array.add(m[1]);

  baris.forEach((l, i) => {
    const m = l.match(appendPolos);
    if (!m) return;
    if (!array.has(m[1])) return;
    masalah.push({
      file,
      baris: i + 1,
      variabel: m[1],
      nilai: m[2],
      teks: l.trim()
    });
  });
}

console.log("file SQL diperiksa : " + files.length);
console.log("variabel array     : " + files.length + " file");

if (masalah.length) {
  console.error("\nappend string polos ke array, akan melempar 22P02:");
  for (const p of masalah) {
    console.error(`  ${p.file}:${p.baris}  ${p.variabel}  nilai '${p.nilai}'`);
    console.error(`      ${p.teks}`);
    console.error(`      harus: ${p.variabel} := ${p.variabel} || ARRAY['${p.nilai}'];`);
  }
  process.exit(1);
}

console.log("\nSEMUA APPEND ARRAY AMAN");