import { formatThousands, parseThousands, toAmount, digitsOnly, caretAfterDigits, nextCaret } from "../src/lib/money.js";

let lulus = 0;
let gagal = 0;

const eq = (nama, dapat, mau) => {
  const a = JSON.stringify(dapat);
  const b = JSON.stringify(mau);
  if (a === b) {
    lulus++;
  } else {
    gagal++;
    console.error(`  GAGAL ${nama}\n    dapat: ${a}\n    mau  : ${b}`);
  }
};

// --- formatThousands
eq("format 100000", formatThousands("100000"), "100.000");
eq("format 1000", formatThousands("1000"), "1.000");
eq("format 999", formatThousands("999"), "999");
eq("format 1234567", formatThousands("1234567"), "1.234.567");
eq("format 0", formatThousands("0"), "0");
eq("format 007", formatThousands("007"), "7");
eq("format 0007", formatThousands("0007"), "7");
eq("format 0 all", formatThousands("000"), "0");
eq("format empty", formatThousands(""), "");
eq("format null", formatThousands(null), "");
eq("format undefined", formatThousands(undefined), "");
eq("format Already", formatThousands("100.000"), "100.000");
eq("format number input", formatThousands(100000), "100.000");
eq("format negatif", formatThousands("-15000"), "-15.000");
eq("format desimal", formatThousands("1234,5"), "1.234,5");
eq("format desimal saja", formatThousands(",75"), ",75");
eq("format huruf dibuang", formatThousands("12a3b4"), "1.234");
eq("format dua desimal", formatThousands("12,345"), "12,345");

// Idempoten: format(format(x)) harus sama dengan format(x).
for (const s of ["100000", "1000", "999", "1", "123456789", "0", "007"]) {
  eq(`idempoten ${s}`, formatThousands(formatThousands(s)), formatThousands(s));
}

// --- parseThousands
eq("parse 100.000", parseThousands("100.000"), 100000);
eq("parse 1.234.567", parseThousands("1.234.567"), 1234567);
eq("parse 1.000", parseThousands("1.000"), 1000);
eq("parse 125.000", parseThousands("125.000"), 125000);
eq("parse 999", parseThousands("999"), 999);
eq("parse empty", parseThousands(""), 0);
eq("parse nol", parseThousands("0"), 0);
eq("parse apa saja", parseThousands("abc"), 0);
eq("parse negatif", parseThousands("-15.000"), -15000);
eq("parse desimal koma", parseThousands("1.234,5"), 1234.5);
eq("parse raw number string", parseThousands("6000000"), 6000000);

// Ini alasan fungsi ini ada: Number() membaca titik sebagai desimal.
eq("Number salah", Number("100.000"), 100);
eq("parseThousands benar", parseThousands("100.000"), 100000);

// --- toAmount
eq("toAmount number utuh", toAmount(100000), 100000);
eq("toAmount desimal number", toAmount(12.5), 12.5);
eq("toAmount string berformat", toAmount("100.000"), 100000);
eq("toAmount string mentah", toAmount("100000"), 100000);
eq("toAmount kosong", toAmount(""), 0);
eq("toAmount undefined", toAmount(undefined), 0);
eq("toAmount NaN", toAmount(NaN), 0);

// 12.5 tidak boleh jadi 125 hanya karena formatThousands dipakai untuk string.
eq("toAmount 12.5 tidak dikali 10", toAmount(12.5), 12.5);
eq("toAmount '12.5' dianggap ribuan", toAmount("12.5"), 125);

// --- digitsOnly
eq("digits 100.000", digitsOnly("100.000"), "100000");
eq("digits huruf", digitsOnly("12a3"), "123");
eq("digits kosong", digitsOnly(""), "");

// --- caretAfterDigits
// selectionStart adalah indeks ANTAR karakter: setelah digit ke-3 pada
// "100.000" berarti indeks 3, tepat sebelum pemisah ribuan.
eq("caret 0 digit", caretAfterDigits("100.000", 0), 0);
eq("caret 1 digit", caretAfterDigits("100.000", 1), 1);
eq("caret 2 digit", caretAfterDigits("100.000", 2), 2);
eq("caret 3 digit", caretAfterDigits("100.000", 3), 3);
eq("caret 4 digit", caretAfterDigits("100.000", 4), 5);
eq("caret 6 digit", caretAfterDigits("100.000", 6), 7);
eq("caret lebih dari panjang", caretAfterDigits("100", 99), 3);

// --- nextCaret: mengetik dan menghapus di tengah angka
// Ketik "5" setelah "100" -> "1.005.000", caret harus setelah digit "5".
eq("ketik di tengah", nextCaret("100.000", 3, 3, formatThousands("1005.000")), 5);
// Ketik di ujung -> caret di ujung.
eq("ketik di ujung", nextCaret("100.000", 7, 7, formatThousands("1000005")), 9);
// Ketik "5" di awal -> caret setelah digit pertama.
eq("ketik di awal", nextCaret("100", 0, 0, formatThousands("5100")), 1);
// Nol di depan dibuang, jadi tidak ada digit baru untuk dip/CBD kursor.
eq("nol di awal dibuang", nextCaret("100", 0, 0, formatThousands("0100")), 0);
// Backspace menghapus digit terakhir -> caret tetap di ujung.
eq("backspace di ujung", nextCaret("100.000", 7, 7, formatThousands("10000")), 6);
// Backspace menghapus pemisah -> jumlah digit tidak berubah, caret tidak bergeser.
eq("backspace pemisah", nextCaret("100.000", 4, 4, formatThousands("100000")), 3);
// Menghapus semua -> caret di 0.
eq("hapus semua", nextCaret("100", 3, 3, formatThousands("")), 0);
// Pilih semua lalu ketik: ini bukan penghapusan murni, caret harus ikut digit baru.
eq("pilih semua lalu ketik", nextCaret("100.000", 0, 7, formatThousands("7")), 1);
// Pilih sebagian ("100") lalu ketik "9" -> "9.000", caret setelah "9".
eq("pilih sebagian", nextCaret("100.000", 0, 3, formatThousands("9000")), 1);
// Menyalin lalu menempel di ujung -> caret tepat di ujung string baru.
eq("tempel di ujung", nextCaret("100", 3, 3, formatThousands("100200")), 7);

// --- pembulatan tampilan harus balik ke nilai yang sama
for (const s of ["100000", "1234567", "999", "5000", "123400"]) {
  eq(`roundtrip ${s}`, parseThousands(formatThousands(s)), Number(s));
}

console.log(`\n${lulus} lulus, ${gagal} gagal`);
if (gagal) {
  console.error("\nADA TEST YANG GAGAL");
  process.exit(1);
}
console.log("SEMUA TEST LULUS");