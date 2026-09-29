import { useState } from "react";

import BackLink from "../components/BackLink";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";
import { QUIZ_CONFIG } from "../lib/rewards";
import { todayKey } from "../lib/util";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Decision() {
  const { user, run, showToast, go } = useApp();
  const { t, content } = useI18n();
  const cases = content.CASES || [];
  const [hard, setHard] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [lastMeta, setLastMeta] = useState(null);
  const [answered, setAnswered] = useState(null);
  const [qIndex, setQIndex] = useState(null);

  if (!user) return null;

  const today = todayKey();
  const qs = user.quizState && user.quizState.date === today ? user.quizState : null;
  const phase = qs?.phase || "intro";
  const done = qs?.done || [];
  const wrong = qs?.wrong || 0;
  const earned = qs?.earned || 0;

  const pickCase = (avoid = null) => {
    if (!cases.length) return null;
    let pool = cases.map((c, i) => ({ c, i }));
    if (hard) pool = pool.filter((x) => x.c.hard);
    if (!pool.length) pool = cases.map((c, i) => ({ c, i }));
    if (phase === "paid" && done.length && done.length < cases.length) {
      const unused = pool.filter((x) => !done.includes(x.i));
      if (unused.length) pool = unused;
    }
    const opts = pool.filter((x) => x.i !== avoid);
    const src = opts.length ? opts : pool;
    return src[Math.floor(Math.random() * src.length)].i;
  };

  const start = async () => {
    await run((s) => s.startQuiz());
    setChosen(null);
    setLastMeta(null);
    setAnswered(null);
    setQIndex(pickCase());
  };

  const choose = async (optI) => {
    if (chosen !== null || qIndex === null || qIndex === undefined) return;
    const c = cases[qIndex];
    setAnswered(c);
    setChosen(optI);
    const res = await run((s) => s.chooseCase(qIndex, optI, { hard }));
    if (res.ok && res.data.meta) {
      const m = res.data.meta;
      setLastMeta(m);
      if (!m.free) {
        if (m.correct) showToast(t("de.correctToast", { n: m.gained }));
        else if (m.lost > 0) showToast(t("de.wrongToast", { n: m.lost }));
      }
    }
  };

  const next = () => {
    setChosen(null);
    setLastMeta(null);
    setAnswered(null);
    setQIndex(pickCase(qIndex));
  };

  const continueToFree = async () => {
    await run((s) => s.continueFree());
    setChosen(null);
    setLastMeta(null);
    setAnswered(null);
    setQIndex(pickCase());
  };

  const finish = async () => {
    await run((s) => s.finishQuiz());
  };

  const toggleHard = (v) => {
    setHard(v);
    setChosen(null);
    setLastMeta(null);
    setAnswered(null);
    setQIndex(pickCase(qIndex));
  };

  const showResult = chosen !== null && lastMeta && answered;
  const currentCase = qIndex === null || qIndex === undefined ? null : cases[qIndex];
  const shown = answered || currentCase;
  const caseData = shown || {};
  const correctIdx = caseData.correct;
  const isFree = phase === "free";
  const optClass = (i) => {
    if (chosen === null) return "option";
    if (i === chosen) return i === correctIdx ? "option is-correct" : "option is-wrong";
    if (i === correctIdx) return "option is-reveal";
    return "option is-dim";
  };
  const showWarn = lastMeta?.paidOver && phase === "paid";
  const letters = ["A", "B", "C", "D"];

  if (phase === "done") {
    return (
      <>
        <BackLink />
        <h1 className="page-title">{t("de.title")}</h1>
        <div className="card done-card">
          <h3 className="card-title">{t("de.allDoneTitle")}</h3>
          <p className="muted">{t("de.allDoneSub")}</p>
          <p className="tag">{t("de.doneEarned", { earned })}</p>
          {qs?.lastBonus > 0 && (
            <p className="tag warn-tag">{t("de.hiddenBonus", { n: qs.lastBonus })}</p>
          )}
          <button
            className="btn btn-primary"
            onClick={async () => {
              await run((s) => s.patchUser({ caseIndex: 0 }));
              go("home");
            }}
          >
            {t("de.next")}
          </button>
        </div>
      </>
    );
  }

  if (phase === "intro") {
    return (
      <>
        <BackLink />
        <h1 className="page-title">{t("de.title")}</h1>
        <div className="card done-card">
          <h3 className="card-title">{t("de.startTitle")}</h3>
          <p className="muted">{t("de.startSub")}</p>
          <button className="btn btn-primary" onClick={start}>
            {t("de.startBtn")}
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
        <div className="quiz-top-row">
          {isFree ? (
            <span className="tag free-tag">{t("de.freeTag")}</span>
          ) : (
            <span className="tag">{t("de.wrongCount", { n: wrong, max: QUIZ_CONFIG.wrongMax })}</span>
          )}
          <label className="switch-label">
            <input
              type="checkbox"
              checked={hard}
              onChange={(e) => toggleHard(e.target.checked)}
            />
            <span>{t("de.hardMode")}</span>
          </label>
        </div>
      </div>

      {isFree && (
        <button className="btn btn-outline finish-btn" onClick={finish}>
          {t("de.finishBtn")}
        </button>
      )}

      {showWarn ? (
        <div className="card warn-card">
          <h3 className="card-title">{t("de.warnTitle")}</h3>
          <p className="muted">{t("de.warnSub")}</p>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={continueToFree}>
              {t("de.warnContinue")}
            </button>
            <button className="btn btn-light" onClick={finish}>
              {t("de.warnEnd")}
            </button>
          </div>
        </div>
      ) : (
        currentCase && (
          <div className="card case-card">
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
        )
      )}

      {showResult && (
        <div
          className={"card result-card " + (lastMeta.correct ? "is-right" : "is-wrong")}
          id="caseResult"
        >
          <h3 className="card-title">
            {isFree
              ? lastMeta.correct
                ? t("de.freeGood")
                : t("de.freeBad")
              : lastMeta.correct
                ? t("de.resultCorrect", { pts: lastMeta.gained })
                : t("de.resultWrong", { pts: lastMeta.lost })}
          </h3>
          <p className="muted">{caseData.options[chosen].consequence}</p>
          <div className="impact">{caseData.options[chosen].impact}</div>
          <p className="muted small">{caseData.options[chosen].lesson}</p>
          {!showWarn && (
            <button className="btn btn-primary" onClick={next}>
              {t("de.next")}
            </button>
          )}
        </div>
      )}
    </>
  );
}