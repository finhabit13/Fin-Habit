import { useEffect, useState } from "react";

import Avatar from "../../components/Avatar";
import { useApp } from "../../context/AppContext";
import Glyph from "../../lib/glyphs";
import { useI18n } from "../../lib/i18n";
import AdminNav from "./AdminNav";

/**
 * Kerangka dashboard admin: header, navigasi, dan area konten. Halaman
 * decrypted lewat pathname supaya tiap halaman punya URL sendiri dan bisa
 * di-bookmark/di-share.
 */
export default function AdminShell({ children }) {
  const { user, logout } = useApp();
  const { t } = useI18n();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = (p) => {
    if (p === "/admin") window.history.pushState({}, "", "/admin");
    else window.history.pushState({}, "", p);
    setPath(p);
    window.scrollTo({ top: 0 });
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-forbidden">
        <Glyph name="shield" size={48} />
        <h1>{t("ad.forbidden")}</h1>
        <p className="muted">{t("ad.forbiddenDesc")}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-brand">
          <img className="brand-mark brand-mark-img" src="/finhabit-logo.jpeg" alt="" />
          <div>
            <h1 className="admin-title">FINHABIT Admin</h1>
            <p className="admin-subtitle">{t("ad.subtitle")}</p>
          </div>
        </div>
        <div className="admin-user-info">
          <span className="admin-badge">Admin</span>
          <button className="avatar-btn" onClick={() => (window.location.href = "/")} aria-label={t("ad.backToApp")}>
            <Avatar user={user} />
          </button>
          <button className="btn btn-light small-btn" onClick={logout}>
            {t("pf.logout")}
          </button>
        </div>
      </header>

      <AdminNav path={path} go={go} />

      <main className="admin-main">{children}</main>

      <footer className="admin-footer">
        <p className="small muted">FINHABIT Admin Dashboard v1.1</p>
      </footer>
    </div>
  );
}
