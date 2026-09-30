import { useEffect, useState } from "react";

import useRevealReady from "./useRevealReady";

/** Kurva pertumbuhan. Pangkat 1, bukan 3: dengan 1-(1-t)^3 sudah 49% jarak
 *  tercapai di 20% waktu pertama, jadi yang terlihat cuma lompatan awal lalu
 *  diam. Pangkat 1,6 memberi sekitar 30% di 20% dan 92% di 80%, jadi
 *  pertumbuhannya terbaca dan baru menapak di nilai akhir. */
export const easeGrow = (t) => 1 - Math.pow(1 - t, 1.6);

function reducedMotion() {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Menghasilkan angka 0 → 1 yang dipakai untuk menghidupkan geometri chart
 * dari keadaan kosong.
 *
 * `useRevealReady` menahan satu frame supaya nilai 0 benar-benar sempat
 * dilukis; tanpa itu transisi CSS tidak punya state awal untuk dijalankan.
 * Setelah itu rAF yang meng-interpolate, sehingga garis dan labelnya bisa
 * jalan dari satu clock yang sama.
 */
export default function useSweep(duration = 1100, delay = 0) {
  const [progress, setProgress] = useState(0);
  const ready = useRevealReady();

  useEffect(() => {
    if (!ready) return;
    if (reducedMotion()) {
      setProgress(1);
      return;
    }
    let raf = 0;
    let start = null;
    const step = (now) => {
      if (start === null) start = now;
      const t = (now - start - delay) / duration;
      if (t < 0) {
        raf = requestAnimationFrame(step);
        return;
      }
      const q = Math.min(1, t);
      setProgress(easeGrow(q));
      if (q < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [ready, duration, delay]);

  return progress;
}
