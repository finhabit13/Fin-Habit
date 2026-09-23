import Glyph from "../lib/glyphs";
import BackLink from "../components/BackLink";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";

export default function Family() {
  const { user, run, showSuccess } = useApp();
  const { t, content } = useI18n();
  if (!user) return null;

  const missions = content.MISSIONS;
  const doneIds = new Set(user.doneMissions || []);

  const complete = async (m) => {
    if (doneIds.has(m.id)) return;
    const res = await run((s) => s.completeMission(m.id));
    if (!res.ok || res.data.already) return;
    showSuccess(t("fa.success"), "+" + m.pts + " " + t("common.points"));
  };

  return (
    <>
      <BackLink />
      <h1 className="page-title">{t("fa.title")}</h1>
      <p className="muted">{t("fa.sub")}</p>

      <div className="grid-2">
        {missions.map((m) => {
          const done = doneIds.has(m.id);
          return (
            <div key={m.id} className="card mission-card">
              <span className="tag family-tag">
                <Glyph name={m.icon} size={15} /> {t("nav.family")}
              </span>
              <p className="mission-title">{m.title}</p>
              <p className="muted">{m.desc}</p>
              <div className="mission-meta">
                <div>
                  <span className="k">{t("fa.budget")}</span>
                  <span className="v">{m.budget}</span>
                </div>
                <div>
                  <span className="k">{t("fa.duration")}</span>
                  <span className="v">{m.time}</span>
                </div>
                <div>
                  <span className="k">{t("fa.status")}</span>
                  <span className="v">{done ? t("fa.done") : t("fa.running")}</span>
                </div>
              </div>
              <div className="bar">
                <span className="bar-fill green" style={{ width: (done ? 100 : 35) + "%" }} />
              </div>
              <span className="reward">{m.reward}</span>
              {done ? (
                <span className="done-label">{t("fa.doneLabel")}</span>
              ) : (
                <button className="btn btn-primary" onClick={() => complete(m)}>
                  {t("fa.complete")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}