import Avatar from "../../components/Avatar";
import { useApp } from "../../context/AppContext";
import Glyph from "../../lib/glyphs";
import { useI18n } from "../../lib/i18n";
import AdminNav from "./AdminNav";

/**
 * Kerangka dashboard admin: header, navigasi, dan area konten. Pathname
 * datang dari App supaya shell dan router satu sumber kebenaran; kalau
 * shell punya state sendiri, klik navigasi tidak akan mengganti halaman.
 */
export default function AdminShell({ path, go, children }) {
  const { user, logout } = useApp();
  const { t } = useI18n();

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
