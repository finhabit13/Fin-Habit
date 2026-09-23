import { useEffect, useState } from "react";

import ScoreRing from "../components/ScoreRing";
import { useApp } from "../context/AppContext";
import Glyph from "../lib/glyphs";
import { useI18n } from "../lib/i18n";
import { challengeOfTheDay, greeting, overallScore, rupiah, scoreTitle, todayKey } from "../lib/util";

export default function Home() {
  const { user, go, run } = useApp();
  const { t, content } = useI18n();
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    run(async (s) => {
      setBudget(await s.budget());
      return null;
    });
  }, []);

  if (!user) return null;

  const s = overallScore(user.dims);
  const diff = s - user.lastWeek;
  const pct = user.todayTotal ? Math.round((user.todayDone / user.todayTotal) * 100) : 0;
  const challenge = challengeOfTheDay(content.CHALLENGES);
  const doneToday = (user.challengeDate || {})[challenge.id] === todayKey();
  const warn = budget && (budget.status === "warn" || budget.status === "over");

  return (
    <>
      <p className="greet-small">
        {t("home.greet." + greeting())}, {user.name}!
      </p>
      <h1 className="greet-big">{t("home.headline")}</h1>

      {warn && (
        <button className={"card limit-card " + budget.status} onClick={() => go("budget")}>
          <div className="limit-head">
            <span className="limit-ico">
              <Glyph name="warn" size={18} />
            </span>
            <span className="tag">{budget.status === "over" ? t("home.limitOver") : t("home.limitNear")}</span>
          </div>
          <p className="limit-title">
            {t("home.limitBody", {
              spent: rupiah(budget.spent),
              budget: rupiah(budget.budget),
              pct: budget.pct
            })}
          </p>
          <p className="limit-hint">
            {budget.status === "over" ? t("home.limitHintOver") : t("home.limitHintWarn")}
          </p>
        </button>
      )}

      <div className="card score-card">
        <ScoreRing value={s} />
        <div className="score-info">
          <p className="score-label">{t("home.scoreLabel")}</p>
          <p className="score-title">{t(scoreTitle(s))}</p>
          <p className="score-hint">
            {diff >= 0
              ? t("home.scoreUp", { n: diff })
              : t("home.scoreDown", { n: Math.abs(diff) })}{" "}
            {t("home.scoreWeek")}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="row-between">
          <h3 className="card-title">{t("home.progressTitle")}</h3>
          <span className="pill">{pct}%</span>
        </div>
        <div className="bar">
          <span className="bar-fill" style={{ width: pct + "%" }} />
        </div>
        <p className="muted small">
          {t("home.progressSub", { done: user.todayDone, total: user.todayTotal })}
        </p>
      </div>

      <div className={"card challenge-card" + (doneToday ? " is-done" : "")}>
        <span className="tag">{t("home.dailyLabel")}</span>
        <h3 className="challenge-title">{challenge.title}</h3>
        <p className="challenge-meta">
          {challenge.min} {t("common.minutes")} · +{challenge.pts} {t("common.points")}
        </p>
        <button className="btn btn-light" onClick={() => go("challenge")}>
          {doneToday ? t("home.challengeDone") : t("home.challengeStart")}
        </button>
      </div>

      <h3 className="section-title">{t("home.quickTitle")}</h3>
      <div className="quick-grid">
        <button className="quick" onClick={() => go("expenses")}>
          <span className="q-ico">
            <Glyph name="receipt" size={20} />
          </span>
          {t("home.quickExpenses")}
        </button>
        <button className="quick" onClick={() => go("budget")}>
          <span className="q-ico">
            <Glyph name="warn" size={20} />
          </span>
          {t("home.quickBudget")}
        </button>
        <button className="quick" onClick={() => go("saving")}>
          <span className="q-ico">
            <Glyph name="piggy" size={20} />
          </span>
          {t("home.quickSaving")}
        </button>
        <button className="quick" onClick={() => go("decide")}>
          <span className="q-ico">
            <Glyph name="scale" size={20} />
          </span>
          {t("home.quickDecide")}
        </button>
        <button className="quick" onClick={() => go("learn")}>
          <span className="q-ico">
            <Glyph name="book" size={20} />
          </span>
          {t("home.quickLearn")}
        </button>
        <button className="quick" onClick={() => go("family")}>
          <span className="q-ico">
            <Glyph name="users" size={20} />
          </span>
          {t("home.quickFamily")}
        </button>
        <button className="quick" onClick={() => go("leaderboard")}>
          <span className="q-ico">
            <Glyph name="crown" size={20} />
          </span>
          {t("home.quickLeaderboard")}
        </button>
        {user.role === "admin" && (
          <button className="quick" onClick={() => go("admin")}>
            <span className="q-ico">
              <Glyph name="shieldCheck" size={20} />
            </span>
            {t("home.quickAdmin")}
          </button>
        )}
      </div>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-num">{user.streak}</span>
          <span className="stat-lab">{t("home.statStreak")}</span>
        </div>
        <div className="stat">
          <span className="stat-num">{user.points}</span>
          <span className="stat-lab">{t("home.statPoints")}</span>
        </div>
        <div className="stat">
          <span className="stat-num">{user.challengesDone || 0}</span>
          <span className="stat-lab">{t("home.statChallenge")}</span>
        </div>
      </div>
    </>
  );
}