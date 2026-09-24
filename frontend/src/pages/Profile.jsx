import Glyph from "../lib/glyphs";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";
import { levelName } from "../lib/util";

export default function Profile() {
  const { user, demo, run, logout, showToast } = useApp();
  const { t, content, lang, setLang } = useI18n();
  if (!user) return null;

  const reset = async () => {
    if (!confirm(t("pf.resetConfirm"))) return;
    const res = await run((s) => s.reset());
    if (res.ok) showToast(t("toast.reset"));
  };

  const owned = new Set(user.badges || []);
  const initial = user.name.trim().charAt(0).toUpperCase();

  return (
    <>
      <h1 className="page-title">{t("nav.profile")}</h1>

      <div className="card profile-card">
        <div className="avatar-big">{initial}</div>
        <div>
          <p className="profile-name">{user.name}</p>
          <p className="muted small">{t(levelName(user.points))}</p>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-num">{user.streak}</span>
          <span className="stat-lab">{t("pf.streak")}</span>
        </div>
        <div className="stat">
          <span className="stat-num">{user.challengesDone || 0}</span>
          <span className="stat-lab">{t("pf.challenge")}</span>
        </div>
        <div className="stat">
          <span className="stat-num">{user.points}</span>
          <span className="stat-lab">{t("pf.points")}</span>
        </div>
      </div>

      <h3 className="section-title">{t("pf.badges")}</h3>
      <div className="badge-grid">
        {content.BADGES.map((b) => (
          <div key={b.id} className={"badge" + (owned.has(b.id) ? "" : " locked")}>
            <span className="badge-ico">
              <Glyph name={b.icon} size={20} />
            </span>
            {b.name}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card-title">{t("pf.data")}</h3>
        <p className="muted small">
          {demo ? t("pf.demoNote") : t("pf.liveNote")}
        </p>
        <div className="lang-row">
          <span>{t("pf.language")}</span>
          <div className="lang-switch inline">
            {(["id", "en"]).map((l) => (
              <button
                key={l}
                className={"lang-btn" + (lang === l ? " on" : "")}
                onClick={() => setLang(l)}
              >
                {l === "id" ? "ID" : "EN"}
              </button>
            ))}
          </div>
        </div>
        {demo && (
          <button className="btn btn-outline" onClick={reset}>
            {t("pf.resetBtn")}
          </button>
        )}
        <button className="btn btn-light" onClick={logout}>
          {t("pf.logout")}
        </button>
      </div>
    </>
  );
}