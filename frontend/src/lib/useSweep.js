import { useEffect, useState } from "react";

import useRevealReady from "./useRevealReady";

/** Ease-out: cepat di awal, melambat halus di akhir. Untuk progress ini yang
 *  terasa nyaman; ease-in yang lambat di awal justru terbaca macet. */
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);

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
export default function useSweep(duration = 900, delay = 0) {
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
      setProgress(easeOut(q));
      if (q < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [ready, duration, delay]);

  return progress;
}
