/**
 * Format dan parse nominal dengan pemisah ribuan gaya Indonesia.
 *
 * Fungsi-fungsi ini murni (tanpa DOM) supaya bisa diuji langsung dengan node.
 */

/** Hanya digit, untuk menghitung posisi kursor. */
export const digitsOnly = (v) => String(v ?? "").replace(/\D/g, "");

/**
 * "1234567" -> "1.234.567", "1234,5" -> "1.234,5".
 *
 * Nol di depan dibuang supaya mengetik 007 tidak menghasilkan "007".
 * Bagian desimal (setelah koma) diteruskan tanpa dikelompokkan.
 */
export function formatThousands(raw) {
  const s = String(raw ?? "").trim().replace(/\s/g, "");
  if (!s) return "";

  const neg = s.startsWith("-");
  const body = neg ? s.slice(1) : s;
  const commaAt = body.indexOf(",");

  const rawInt = commaAt === -1 ? body : body.slice(0, commaAt);
  const rawDec = commaAt === -1 ? "" : body.slice(commaAt + 1);

  let intPart = rawInt.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  const decPart = rawDec.replace(/\D/g, "");

  if (!intPart && !decPart) return "";

  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const out = decPart ? grouped + "," + decPart : grouped;
  return neg ? "-" + out : out;
}

/**
 * "1.234.567" -> 1234567.
 *
 * Titik dianggap pemisah ribuan, koma dianggap desimal. Ini kebalikan dari
 * Number(), yang membaca "100.000" sebagai 100 dan membuat nominal salah
 * seratus kali lebih kecil tanpa error apa pun.
 */
export function parseThousands(raw) {
  const s = String(raw ?? "").trim().replace(/\s/g, "");
  if (!s) return 0;

  const neg = s.startsWith("-");
  const body = neg ? s.slice(1) : s;
  const commaAt = body.indexOf(",");

  const intPart = (commaAt === -1 ? body : body.slice(0, commaAt)).replace(/\D/g, "");
  const decPart = commaAt === -1 ? "" : body.slice(commaAt + 1).replace(/\D/g, "");

  if (!intPart && !decPart) return 0;

  const n = Number((intPart || "0") + (decPart ? "." + decPart : ""));
  if (!Number.isFinite(n)) return 0;
  return neg ? -n : n;
}

/**
 * Nominal dari sumber mana pun. String bergaya Indonesia diparse dengan
 * aturannya sendiri; angka sudah jadi angka dan tidak boleh disentuh,
 * karena parseThousands("12.5") akan menjadi 125.
 */
export function toAmount(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  return parseThousands(v);
}

/**
 * Posisi kursor setelah diformat ulang.
 *
 * Memformat ulang mengubah panjang string, jadi kursor yang tadinya di
 * indeks 5 bisa jatuh di tengah karakter lain. Solusinya: hitung berapa
 * digit yang ada sebelum kursor, lalu cari posisi setelah jumlah digit
 * yang sama di string baru. Dengan begitu mengetik di tengah angka tetap
 * terasa seperti mengetik di tengah angka.
 */
export function caretAfterDigits(formatted, digitsBefore) {
  if (digitsBefore <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (formatted[i] !== "." && formatted[i] !== ",") {
      seen++;
      if (seen === digitsBefore) return i + 1;
    }
  }
  return formatted.length;
}

/**
 * Posisi kursor setelah pengguna mengetik di dalam angka yang sudah diformat.
 *
 * Kursor tidak bisa memakai indeks yang sama karena pemisah ribuan menambah
 * karakter. Yang dijaga adalah banyaknya digit di sebelah kiri kursor.
 *
 * Yang complicating: nilai baru bisa menambah digit (ketik), mengurangi
 * (backspace), atau menggantinya sekaligus (pilih blok lalu ketik). Kalau
 * jumlah digit hanya dibandingkan dengan nilai lama, kasus terakhir salah
 * dibaca sebagai penghapusan dan kursor tertinggal di depan karakter baru.
 * Karena itu banyaknya digit yang dihapus dari rentang seleksi ikut dihitung,
 * lalu jumlah digit yang benar-benar disisipkan bisa diketahui.
 */
export function nextCaret(oldValue, start, end, newFormatted) {
  const before = digitsOnly(oldValue.slice(0, start)).length;
  const removed = digitsOnly(oldValue.slice(start, end)).length;
  const newTotal = digitsOnly(newFormatted).length;
  const inserted = Math.max(0, newTotal - (digitsOnly(oldValue).length - removed));
  return caretAfterDigits(newFormatted, before + inserted);
}