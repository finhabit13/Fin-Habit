import { useEffect, useState } from "react";

import { useApp } from "../context/AppContext";

// Nilai cover_url bisa berupa tiga bentuk, dan hanya yang ketiga perlu kerja
// tambahan:
//   - "<user-id>/1712...-ab12cd.jpg"  path di bucket privat saving-covers
//   - "data:image/jpeg;base64,..."    mode demo, hasil imageFileToDataUrl()
//   - "https://..."                   URL lama sebelum MIGRASI 12, atau
//                                     gambar yang dihosting di luar
const LANGSUNG = /^(data:|https?:\/\/)/i;

export function perluTandatangan(value) {
  return !!value && !LANGSUNG.test(value);
}

/**
 * Tanda tangani beberapa nilai cover sekaligus dan kembalikan peta
 * nilai-asli -> URL siap pakai.
 *
 * Dipakai sekali per daftar goal, bukan per kartu, supaya satu goal dengan
 * cover tidak memicu banyak permintaan.
 */
export function useCoverMap(values) {
  const { service } = useApp();
  const [map, setMap] = useState({});

  // Nilai dirangkai jadi string supaya dependensi useEffect tidak berubah
  // setiap render.
  const kunci = JSON.stringify((values || []).filter(perluTandatangan));

  useEffect(() => {
    let hidup = true;
    const daftar = JSON.parse(kunci);

    if (daftar.length === 0) {
      setMap({});
      return undefined;
    }

    (async () => {
      const out = {};
      for (const v of daftar) {
        try {
          out[v] = await service.signSavingCover(v);
        } catch {
          out[v] = null;
        }
      }
      if (hidup) setMap(out);
    })();

    return () => {
      hidup = false;
    };
  }, [kunci, service]);

  return map;
}

/**
 * Satu nilai cover. Lebih sederhana untuk satu goal (halaman detail) atau
 * untuk pratinjau di dalam modal.
 */
export function useCoverUrl(value) {
  const { service } = useApp();
  const [url, setUrl] = useState(() => (perluTandatangan(value) ? null : value || null));

  useEffect(() => {
    let hidup = true;
    if (!perluTandatangan(value)) {
      setUrl(value || null);
      return undefined;
    }
    setUrl(null);
    (async () => {
      try {
        const ttd = await service.signSavingCover(value);
        if (hidup) setUrl(ttd);
      } catch {
        if (hidup) setUrl(null);
      }
    })();
    return () => {
      hidup = false;
    };
  }, [value, service]);

  return url;
}