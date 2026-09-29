import { useEffect, useState } from "react";

export default function BannerCarousel({ banners, onTap }) {
  const [i, setI] = useState(0);
  const count = banners.length;

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => setI((prev) => (prev + 1) % count), 4500);
    return () => clearInterval(timer);
  }, [count]);

  if (count === 0) return <div className="banner-carousel banner-empty">—</div>;

  const open = (b) => {
    if (b.link) window.open(b.link, "_blank", "noopener,noreferrer");
    else if (onTap) onTap(b);
  };

  return (
    <div className="banner-carousel" role="region" aria-label="Promosi">
      <div className="banner-slide">
        <div className="banner-slide-inner" style={{ transform: `translateX(-${i * 100}%)` }}>
          {banners.map((b) => (
            <button key={b.id} className="banner-item" onClick={() => open(b)} tabIndex={0}>
              <img src={b.image} alt={b.caption || "Banner"} />
              {b.caption && <span className="banner-caption">{b.caption}</span>}
            </button>
          ))}
        </div>
      </div>
      {count > 1 && (
        <div className="banner-dots">
          {banners.map((b, idx) => (
            <button
              key={b.id}
              className={"banner-dot" + (idx === i ? " is-active" : "")}
              aria-label={`Banner ${idx + 1}`}
              onClick={() => setI(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}