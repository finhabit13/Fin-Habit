import { useCallback, useEffect, useRef, useState } from "react";

const AUTOPLAY_MS = 5200;
const RESUME_MS = 9000;

/** Kalau pengguna minta reduced motion, lompat langsung tanpa animasi. */
function prefersReducedMotion() {
  return (
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Carousel banner.
 *
 * Geserannya pakai scroll horizontal native + scroll-snap, bukan
 * transform: translateX(). Alasannya, transform di dalam track yang memuat
 * semua slide membuat translateX(-100%) dihitung dari lebar SELURUH track,
 * bukan satu slide, jadi meloncat dan terasa kaku. Scroll native memakai
 * scroll compositor milik platform, jadi swipe dapat momentum dan snap-nya
 * gratis di HP.
 */
export default function BannerCarousel({ banners, onTap }) {
  const [i, setI] = useState(0);
  const count = banners.length;
  const trackRef = useRef(null);
  const pausedRef = useRef(false);
  const resumeTimer = useRef(null);
  // Indeks aktif disimpan di ref juga supaya autoplay bisa memindahkannya
  // tanpa memanggil scrollTo di dalam updater setState.
  const indexRef = useRef(0);

  const showIndex = useCallback((idx) => {
    indexRef.current = idx;
    setI(idx);
  }, []);

  const scrollToIndex = useCallback((idx, smooth = true) => {
    const track = trackRef.current;
    const target = track && track.children[idx];
    if (!target) return;
    const instant = !smooth || prefersReducedMotion();
    track.scrollTo({ left: target.offsetLeft, behavior: instant ? "auto" : "smooth" });
  }, []);

  // Ikuti posisi scroll supaya dots ikut berubah saat user swipe manual.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const w = track.clientWidth || 1;
        const idx = Math.round(track.scrollLeft / w);
        if (idx !== indexRef.current) showIndex(Math.min(count - 1, Math.max(0, idx)));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, [count, showIndex]);

  // Autoplay berhenti saat user menyentuh carousel, dan lanjut lagi setelah
  // jeda supaya tidak berlompat tepat setelah orang selesai menggeser.
  const hold = useCallback(() => {
    pausedRef.current = true;
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_MS);
  }, []);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      if (document.hidden) return;
      const next = (indexRef.current + 1) % count;
      showIndex(next);
      scrollToIndex(next);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, scrollToIndex, showIndex]);

  // Jangan autoplay carousel yang sedang di luar layar, tapi tetap nyalakan
  // lagi setelah kembali terlihat, kalau tidak autoplay mati permanen.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof IntersectionObserver === "undefined") return;
    let resume = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(resume);
        if (entry.isIntersecting) {
          resume = setTimeout(() => {
            pausedRef.current = false;
          }, RESUME_MS);
        } else {
          pausedRef.current = true;
        }
      },
      { threshold: 0.25 }
    );
    io.observe(track);
    return () => {
      clearTimeout(resume);
      io.disconnect();
    };
  }, []);

  // Banner bisa berubah jumlahnya (mis. setelah admin menambah/menghapus),
  // jadi indeks aktif harus ikut dijepit agar tidak menunjuk slide yang
  // sudah tidak ada.
  useEffect(() => {
    if (indexRef.current < count) return;
    const next = Math.max(0, count - 1);
    showIndex(next);
    scrollToIndex(next, false);
  }, [count, showIndex, scrollToIndex]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  if (count === 0) return <div className="banner-carousel banner-empty">—</div>;

  const open = (b) => {
    if (b.link) window.open(b.link, "_blank", "noopener,noreferrer");
    else if (onTap) onTap(b);
  };

  const jump = (idx) => {
    hold();
    showIndex(idx);
    scrollToIndex(idx);
  };

  return (
    <div
      className="banner-carousel"
      role="region"
      aria-label="Promosi"
      onPointerDown={hold}
      onFocus={hold}
    >
      <div className="banner-slide" ref={trackRef} tabIndex={0}>
        {banners.map((b, idx) => (
          <button
            key={b.id}
            className={"banner-item" + (idx === i ? " is-active" : "")}
            onClick={() => open(b)}
            aria-hidden={idx !== i}
            tabIndex={idx === i ? 0 : -1}
          >
            <img src={b.image} alt={b.caption || "Banner"} loading="lazy" decoding="async" />
            {b.caption && <span className="banner-caption">{b.caption}</span>}
          </button>
        ))}
      </div>

      {count > 1 && (
        <div className="banner-dots">
          {banners.map((b, idx) => (
            <button
              key={b.id}
              className={"banner-dot" + (idx === i ? " is-active" : "")}
              aria-label={`Banner ${idx + 1}`}
              aria-current={idx === i}
              onClick={() => jump(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
