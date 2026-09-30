import useRevealReady from "../lib/useRevealReady";

/**
 * Progress bar yang tumbuh dari 0 lalu berhenti tepat di nilai sekarang.
 *
 * CSS `.bar-fill` sudah punya `width: 0` + transition, tapi kalau inline
 * style terpasang di frame yang sama dengan render pertama, browser tidak
 * pernah sempat melukis lebar 0 sehingga tidak ada yang di-transition dan
 * bar langsung muncul jadi. `useRevealReady` menahan satu frame supaya
 * lebar 0 benar-benar sempat dilukis dulu.
 */
export default function Meter({ value, tone = "", max = 100 }) {
  const ready = useRevealReady();
  const pct = Math.max(0, Math.min(100, (Number(value) || 0) * (100 / max)));
  return (
    <span
      className={"bar-fill " + tone}
      style={{ width: ready ? pct + "%" : "0%" }}
    />
  );
}
