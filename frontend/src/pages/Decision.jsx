import { useState } from "react";

import BackLink from "../components/BackLink";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";
import { QUIZ_CONFIG } from "../lib/rewards";
import { todayKey } from "../lib/util";

export default function Decision() {
  const { user, run, showToast } = useApp();
  const { t, content } = useI18n();
  const cases = content.CASES || [];
  const [hard, setHard] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [lastMeta, setLastMeta] = useState(null);
  const [answered, setAnswered] = useState(null);

  if (!user) return null;

  const today = todayKey();
  const qs = (user.quizState && user.quizState.date === today ? user.quizState : null) || { count: 0, earned: 0, done: [] };
  const done = qs.done || [];
  const earned = qs.earned || 0;

  let pool = cases.map((c, i) => ({ c, i })).filter((x) => !done.includes(x.i));
  if (hard) pool = pool.filter((x) => x.c.hard);
  else pool = pool.sort((a, b) => (Number(a.c.hard) - Number(b.c.hard) || a.i - b.i));

  const nextCase = pool[0];
  const letters = ["A", "B", "C", "D"];

  const choose = async (optI) => {
    if (chosen !== null || !nextCase) return;
    setAnswered({ c: nextCase.c, i: nextCase.i });
    setChosen(optI);
    const res = await run((s) => s.chooseCase(nextCase.i, optI, { hard }));
    if (res.ok && res.data.meta) {
      const m = res.data.meta;
      setLastMeta(m);
      if (m.already) showToast(t("de.alreadyAnswered"));
      else if (m.correct) showToast(t("de.correctToast", { n: m.gained }));
      else if (m.lost > 0) showToast(t("de.wrongToast", { n: m.lost }));
    }
  };

  const next = () => {
    setChosen(null);
    setLastMeta(null);
    setAnswered(null);
  };

  const bonusLeft = Math.max(0, QUIZ_CONFIG.bonusCount - qs.count);
  const remaining = pool.length;
  const showResult = chosen !== null && lastMeta && answered;
  const shown = answered || nextCase;
  const caseData = shown?.c;
  const correctIdx = caseData?.correct;
  const optClass = (i) => {
    if (chosen === null) return "option";
    if (i === chosen) return i === correctIdx ? "option is-correct" : "option is-wrong";
    if (i === correctIdx) return "option is-reveal";
    return "option is-dim";
  };

  if (!nextCase && !showResult) {
    return (
      <>
        <BackLink />
        <h1 className="page-title">{t("de.title")}</h1>
        <div className="card done-card">
          <div className="quiz-progress">
            <div
              className="quiz-progress-fill"
              style={{ width: `${Math.min(100, (earned / QUIZ_CONFIG.maxDay) * 100)}%` }}
            />
          </div>
          <p className="tag">{t("de.dailyPts", { earned, max: QUIZ_CONFIG.maxDay })}</p>
          <h3 className="card-title">{t("de.allDoneTitle")}</h3>
          <p className="muted">{t("de.allDoneSub")}</p>
          <button
            className="btn btn-primary"
            onClick={async () => {
              await run((s) => s.patchUser({ caseIndex: 0 }));
            }}
          >
            {t("de.next")}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <BackLink />
      <h1 className="page-title">{t("de.title")}</h1>
      <p className="muted">{t("de.sub")}</p>

      <div className="quiz-top">
        <div className="quiz-progress">
          <div
            className="quiz-progress-fill"
            style={{ width: `${Math.min(100, (earned / QUIZ_CONFIG.maxDay) * 100)}%` }}
          />
        </div>
        <div className="quiz-top-row">
          <span className="tag">{t("de.dailyPts", { earned, max: QUIZ_CONFIG.maxDay })}</span>
          <span className="muted small">{t("de.bonusLeft", { n: bonusLeft })}</span>
        </div>
      </div>

      <div className="card case-card">
        <div className="case-head">
          <span className="tag">{t("de.leftCount", { n: remaining })}</span>
          <label className="switch-label">
            <input type="checkbox" checked={hard} onChange={(e) => { setHard(e.target.checked); setChosen(null); setLastMeta(null); setAnswered(null); }} />
            <span>{t("de.hardMode")}</span>
          </label>
        </div>
        <p className="case-text">{caseData.text}</p>
        {caseData.options.map((opt, i) => (
          <button key={i} className={optClass(i)} disabled={chosen !== null} onClick={() => choose(i)}>
            <b>{letters[i]}.</b>
            <span className="option-label-wrap">
              <span className="option-label">{opt.label}</span>
              {showResult && i === correctIdx && <span className="option-check">✓</span>}
              {showResult && i === chosen && i !== correctIdx && <span className="option-cross">✕</span>}
            </span>
          </button>
        ))}
      </div>

      {showResult && (
        <div className={"card result-card " + (lastMeta.correct ? "is-right" : "is-wrong")} id="caseResult">
          <h3 className="card-title">
            {lastMeta.correct
              ? t("de.resultCorrect", { pts: lastMeta.gained })
              : t("de.resultWrong", { pts: lastMeta.lost })}
          </h3>
          <p className="muted">{caseData.options[chosen].consequence}</p>
          <div className="impact">{caseData.options[chosen].impact}</div>
          <p className="muted small">{caseData.options[chosen].lesson}</p>
          {lastMeta.capped && <p className="tag warn-tag">{t("de.capReached")}</p>}
          <button className="btn btn-primary" onClick={next}>
            {t("de.next")}
          </button>
        </div>
      )}
    </>
  );
}