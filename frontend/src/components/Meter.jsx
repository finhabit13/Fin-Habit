import useRevealReady from "../lib/useRevealReady";

/**
 * Progress bar yang tumbuh dari 0 lalu berhenti tepat di nilai sekarang.
 *
 * CSS `.bar-fill` sudah punya `width: 0` + transition, tapi kalau inline
 * style terpasang di frame yang sama dengan render pertama, browser tidak
 * pernah sempat melukis lebar 0 sehingga tidak ada yang di-transition dan
 * bar langsung muncul jadi. `useRevealReady` menahan satu frame supaya
 * lebar 0 benar-benar sempat dilukis dulu.
 *
 * `vertical` dipakai bar mingguan di halaman Skor: tinggi, bukan lebar.
 * `minVisible` menaruh lantainya supaya batang dengan nilai 0 tetap kelihatan
 * sebagai kolom, bukan ruang kosong.
 */
export default function Meter({
  value,
  tone = "",
  max = 100,
  delay = 0,
  minVisible = 0,
  vertical = false,
}) {
  const ready = useRevealReady();
  const raw = Math.max(0, Math.min(100, (Number(value) || 0) * (100 / max)));
  const pct = ready ? Math.max(minVisible, raw) : 0;

  if (vertical) {
    return (
      <span
        className={"chart-bar " + tone}
        style={{ height: pct + "%", transitionDelay: delay + "ms" }}
      />
    );
  }

  return (
    <span
      className={"bar-fill " + tone}
      style={{ width: pct + "%", transitionDelay: delay + "ms" }}
    />
  );
}
