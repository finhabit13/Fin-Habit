import Glyph from "../../lib/glyphs";
import { useI18n } from "../../lib/i18n";

/**
 * Sidebar admin. Dipakai AdminShell, jadi tiap halaman admin tidak perlu
 * tahu soal navigasi atau pathname.
 */
export default function AdminNav({ path, go }) {
  const { t } = useI18n();

  const items = [
    { path: "/admin", key: "ad.overview", icon: "chart" },
    { path: "/admin/users", key: "ad.users", icon: "users" },
    { path: "/admin/activity", key: "ad.activity", icon: "receipt" },
    { path: "/admin/leaderboard", key: "ad.leaderboard", icon: "medal" },
    { path: "/admin/challenges", key: "ad.challenges", icon: "target" },
    { path: "/admin/banners", key: "ad.banners", icon: "bag" }
  ];

  return (
    <nav className="admin-nav" aria-label={t("ad.subtitle")}>
      {items.map((it) => {
        const active = path === it.path || (it.path !== "/admin" && path.startsWith(it.path));
        return (
          <button
            key={it.path}
            className={"admin-nav-item" + (active ? " is-active" : "")}
            onClick={() => go(it.path)}
            aria-current={active ? "page" : undefined}
          >
            <Glyph name={it.icon} size={18} />
            <span>{t(it.key)}</span>
          </button>
        );
      })}
    </nav>
  );
}
