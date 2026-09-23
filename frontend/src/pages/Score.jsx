import ScoreRing from "../components/ScoreRing";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";
import { overallScore, scoreTitle } from "../lib/util";

export default function Score() {
  const { user } = useApp();
  const { t, content } = useI18n();
  if (!user) return null;

  const s = overallScore(user.dims);
  const diff = s - user.lastWeek;

  return (
    <>
      <h1 className="page-title">{t("score.title")}</h1>

      <div className="card score-hero">
        <ScoreRing value={s} big />
        <p className="score-title center">{t(scoreTitle(s))}</p>
        <p className="muted small center">
          {t("score.week", { last: user.lastWeek, now: s, diff: (diff >= 0 ? "+" : "") + diff })}
        </p>
      </div>

      <h3 className="section-title">{t("score.breakdown")}</h3>
      <div className="card">
        {Object.keys(content.DIM_LABELS).map((key) => {
          const v = user.dims[key] || 0;
          return (
            <div key={key} className="break-row">
              <div className="break-head">
                <span>{content.DIM_LABELS[key]}</span>
                <b>{v}</b>
              </div>
              <div className="bar">
                <span className="bar-fill" style={{ width: v + "%" }} />
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="section-title">{t("score.progress")}</h3>
      <div className="card">
        <div className="chart">
          {(user.weekly || []).map((v, i) => (
            <div
              key={i}
              className={"chart-col" + (i === user.weekly.length - 1 ? " today" : "")}
            >
              <div className="chart-bar" style={{ height: Math.max(8, Math.min(100, v)) + "%" }} />
              <span className="chart-lab">{content.DAY_LABELS[i]}</span>
            </div>
          ))}
        </div>
        <p className="muted small">{t("score.weekHint")}</p>
      </div>
    </>
  );
}