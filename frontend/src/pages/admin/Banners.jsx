import { useEffect, useState } from "react";

import { useApp } from "../../context/AppContext";
import { useI18n } from "../../lib/i18n";

/** Kelola banner beranda: unggah gambar, aktif/nonaktif, hapus. */
export default function Banners() {
  const { run, showToast } = useApp();
  const { t } = useI18n();
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ image: "", caption: "", link: "", position: 0 });

  const load = () =>
    run(async (s) => {
      const r = await Promise.allSettled([s.adminBanners()]);
      setBanners(r[0].status === "fulfilled" ? r[0].value || [] : []);
      return null;
    });

  useEffect(() => {
    load();
  }, []);

  const onFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 750;
        canvas.height = 280;
        const ctx = canvas.getContext("2d");
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const sw = img.width * scale;
        const sh = img.height * scale;
        ctx.drawImage(img, (canvas.width - sw) / 2, (canvas.height - sh) / 2, sw, sh);
        setForm((f) => ({ ...f, image: canvas.toDataURL("image/jpeg", 0.85) }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const add = async () => {
    if (!form.image) {
      showToast(t("ad.bannerNoImage"));
      return;
    }
    const res = await run((s) =>
      s.adminAddBanner({ image: form.image, caption: form.caption, link: form.link, position: form.position })
    );
    if (res.ok) {
      showToast(t("ad.bannerAdded"));
      setForm({ image: "", caption: "", link: "", position: banners.length });
      await load();
    }
  };

  const toggle = async (b) => {
    const res = await run((s) => s.adminSetBanner({ id: b.id, active: !b.active }));
    if (res.ok) {
      showToast(t("ad.bannerUpdated"));
      await load();
    }
  };

  const remove = async (b) => {
    if (!confirm(t("ad.bannerDelete") + "?")) return;
    const res = await run((s) => s.adminDeleteBanner({ id: b.id }));
    if (res.ok) {
      showToast(t("ad.bannerDeleted"));
      await load();
    }
  };

  return (
    <section className="admin-section">
      <div className="row-between">
        <h2 className="section-title">{t("ad.banners")}</h2>
        <span className="small muted">{banners.length}</span>
      </div>
      <p className="muted small">{t("ad.bannerSub")}</p>

      <div className="card banner-editor">
        <div className="banner-row-info small-muted">{t("ad.bannerResize")}</div>

        {form.image && <img className="banner-preview" src={form.image} alt="" />}

        <div className="banner-form">
          <label className="field">
            <span>{t("ad.bannerImage")}</span>
            <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="admin-file-input" />
          </label>
          <label className="field">
            <span>{t("ad.bannerCaption")}</span>
            <input type="text" value={form.caption} onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))} />
          </label>
          <label className="field">
            <span>{t("ad.bannerLink")}</span>
            <input
              type="text"
              value={form.link}
              placeholder="https://..."
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            />
          </label>
          <label className="field field-inline">
            <span>{t("ad.bannerPosition")}</span>
            <input
              type="number"
              min="0"
              value={form.position}
              onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) || 0 }))}
            />
          </label>
          <button className="btn btn-primary" onClick={add} disabled={!form.image}>
            {t("ad.bannerAdd")}
          </button>
        </div>
      </div>

      {banners.length > 0 && (
        <div className="card banner-list">
          {banners.map((b) => (
            <div key={b.id} className="banner-row">
              <img className="banner-thumb" src={b.image} alt="" />
              <div className="banner-row-info">
                <p>
                  {b.caption || <span className="muted">—</span>}{" "}
                  <span className="muted small">({b.position})</span>
                </p>
                <span className={"tag" + (b.active ? " admin" : "")}>
                  {b.active ? t("ad.bannerActive") : t("ad.bannerInactive")}
                </span>
              </div>
              <div className="banner-row-actions">
                <button className="btn btn-outline small-btn" onClick={() => toggle(b)}>
                  {b.active ? t("ad.bannerInactive") : t("ad.bannerActive")}
                </button>
                <button className="btn btn-outline small-btn danger" onClick={() => remove(b)}>
                  {t("ad.bannerDelete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
