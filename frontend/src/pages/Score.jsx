import ScoreRing from "../components/ScoreRing";
import { useApp } from "../context/AppContext";
import { DIM_LABELS, DAY_LABELS } from "../lib/data";
import { overallScore, scoreTitle } from "../lib/util";

export default function Score() {
  const { user } = useApp();
  if (!user) return null;

  const s = overallScore(user.dims);
  const diff = s - user.lastWeek;

  return (
    <>
      <h1 className="page-title">Financial Habit Score</h1>

      <div className="card score-hero">
        <ScoreRing value={s} big />
        <p className="score-title center">{scoreTitle(s)}</p>
        <p className="muted small center">
          Minggu lalu {user.lastWeek} → minggu ini {s} ({diff >= 0 ? "+" : ""}
          {diff})
        </p>
      </div>

      <h3 className="section-title">Breakdown</h3>
      <div className="card">
        {Object.keys(DIM_LABELS).map((key) => {
          const v = user.dims[key] || 0;
          return (
            <div key={key} className="break-row">
              <div className="break-head">
                <span>{DIM_LABELS[key]}</span>
                <b>{v}</b>
              </div>
              <div className="bar">
                <span className="bar-fill" style={{ width: v + "%" }} />
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="section-title">Your Progress</h3>
      <div className="card">
        <div className="chart">
          {(user.weekly || []).map((v, i) => (
            <div
              key={i}
              className={"chart-col" + (i === user.weekly.length - 1 ? " today" : "")}
            >
              <div className="chart-bar" style={{ height: Math.max(8, Math.min(100, v)) + "%" }} />
              <span className="chart-lab">{DAY_LABELS[i]}</span>
            </div>
          ))}
        </div>
        <p className="muted small">Score 7 hari terakhir.</p>
      </div>
    </>
  );
}