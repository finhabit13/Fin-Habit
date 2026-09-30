import { useEffect, useState } from "react";

/**
 * Menahan render pertama sampai browser sempat melukis nilai awal (0),
 * baru mengizinkan nilai sebenarnya masuk.
 *
 * Tanpa ini, nilai awal dari CSS dan nilai akhir dari inline style sama-sama
 * terpasang di frame yang sama, jadi browser tidak pernah melihat state 0
 * dan tidak ada yang di-transition: bar langsung melompat ke nilai akhir.
 *
 * rAF ganda dipakai karena satu frame belum tentu cukup untuk memastikan
 * paint pertama benar-benar terjadi.
 *
 * Hasilnya `true` setelah mount, jadi animasi hanya berjalan sekali saat
 * halaman dibuka, bukan setiap re-render.
 */
export default function useRevealReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  return ready;
}
