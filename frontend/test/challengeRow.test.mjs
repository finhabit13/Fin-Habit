// Menguji fungsi ASLI dari src/lib/challengeRow.js, bukan replikanya. Kalau
// import gagal, test ini berhenti dengan jelas dan tidak boleh dianggap lulus.
import { fromChallengeRow, toChallengeRow } from "../src/lib/challengeRow.js";

const dariDB = {
  id: "c1", kind: "video", title: "Menabung", desc: "deskripsi",
  source: "Kanal", url: "https://x.com/a", steps: ["a", "b"],
  min: 15, pts: 50, dim: "saving", active: true, position: 3
};

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

// Perbaikan utama: toggle hanya mengirim id dan active.
cek("toggle hanya menulis active", toChallengeRow({ id: "c1", active: false }), { active: false });

// Form admin (bentuk minutes/points) tidak boleh ikut rusak.
cek(
  "form admin tetap dipetakan penuh",
  toChallengeRow({
    kind: "read", title: "  Baca  ", desc: "  isi  ", source: " S ",
    url: " https://y.com/b ", steps: [" s1 ", "", "s2"],
    minutes: 12, points: 30, dim: "goal", active: true, position: 0
  }),
  {
    kind: "read", title: "Baca", description: "isi", source: "S",
    url: "https://y.com/b", steps: ["s1", "s2"], dim: "goal",
    active: true, position: 0, minutes: 12, points: 30
  }
);

// Patch parsial tidak boleh mengosongkan kolom yang tidak dikirim.
cek("patch parsial tidak mengosongkan kolom lain", toChallengeRow({ active: true }), { active: true });

// Bentuk description juga diterima.
cek("menerima description", toChallengeRow({ description: "x" }), { description: "x" });

// min/pts dari objek DB harus terbaca, bukan jatuh ke 5/20.
const utuh = toChallengeRow(dariDB);
cek("min/pts dipetakan", [utuh.minutes, utuh.points], [15, 50]);

// Payload kosong tidak boleh menghasilkan kolom kosong.
cek("payload kosong tetap kosong", toChallengeRow({}), {});
cek("tanpa argumen tidak error", toChallengeRow(), {});

// Bolak-balik DB → app → DB harus menjaga semua nilai untuk challenge utuh.
const bolak = toChallengeRow(fromChallengeRow({
  id: "c1", kind: "video", title: "Menabung", description: "d", source: "S",
  url: "https://x.com/a", steps: ["a"], minutes: 15, points: 50, dim: "saving",
  active: true, position: 3
}));
cek("bolak-balik tidak mengubah nilai apa pun", bolak, {
  kind: "video", title: "Menabung", description: "d", source: "S",
  url: "https://x.com/a", steps: ["a"], dim: "saving", active: true,
  position: 3, minutes: 15, points: 50
});

console.log(gagal ? "\n" + gagal + " TEST GAGAL" : "\nSEMUA TEST LULUS");
process.exit(gagal ? 1 : 0);
