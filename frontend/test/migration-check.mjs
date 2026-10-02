import { readFileSync } from "node:fs";

// Bandingkan key yang ada di definisi LAMA dengan yang ada di hasil migrasi.
// Tujuannya satu: memastikan penggantian admin_overview() tidak diam-diam
// kehilangan key yang dipakai halaman admin.
const schema = readFileSync("supabase/schema.sql", "utf8");
const mig = readFileSync("supabase/migration-10-saving-goals.sql", "utf8");

const ambil = (teks) => {
  const m = teks.match(/create or replace function public\.admin_overview\(\)[\s\S]*?\r?\n\$\$;\r?\n/);
  return m ? m[0] : "";
};
const keys = (def) => {
  const found = new Set();
  // jsonb_build_object menulis 'key', value (dengan koma), bukan 'key': value.
  const re = /^\s*'([a-z0-9_]+)'\s*,/gim;
  let m;
  while ((m = re.exec(def))) found.add(m[1]);
  return found;
};

const lama = keys(ambil(schema));
const baru = keys(ambil(mig));

const hilang = [...lama].filter((k) => !baru.has(k));
const tambahan = [...baru].filter((k) => !lama.has(k));

console.log("key di schema.sql : " + lama.size);
console.log("key di migrasi    : " + baru.size);
console.log("hilang            : " + (hilang.length ? hilang.join(", ") : "tidak ada"));
console.log("ditambah          : " + (tambahan.length ? tambahan.join(", ") : "tidak ada"));

// Penjaga bahwa tabel baru benar-benar ikut(dirujuk).
for (const wajib of [
  "create table if not exists public.saving_goals",
  "create table if not exists public.saving_transactions",
  "saving-covers",
  "for update to authenticated using (false)",
  "from public.saving_transactions t",
  "from public.saving_goals"
]) {
  if (!mig.includes(wajib)) {
    console.log("HILANG: " + wajib);
    process.exit(1);
  }
}

// Cegah karakter CJK yang pernah muncul di file yang saya tulis.
const cjk = /[\u3000-\u303F\u4E00-\u9FFF\uAC00-\uD7AF]/;
const baris = mig.split(/\r?\n/);
let buruk = 0;
baris.forEach((b, i) => {
  if (cjk.test(b)) {
    console.log("CJK di baris " + (i + 1) + ": " + b.trim());
    buruk++;
  }
});

const gagal = hilang.length > 0 || buruk > 0;
console.log(gagal ? "\nPERIKSA ULANG" : "\nMIGRASI UTUH");
process.exit(gagal ? 1 : 0);