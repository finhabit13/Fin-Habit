import { useState } from "react";

import BackLink from "../components/BackLink";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";

export default function Decision() {
  const { user, run, showToast } = useApp();
  const { t, content } = useI18n();
  const [chosen, setChosen] = useState(null);

  if (!user) return null;

  const cases = content.CASES;
  const idx = user.caseIndex % cases.length;
  const caseData = cases[idx];
  const letters = ["A", "B", "C", "D"];

  const choose = async (optI, letter) => {
    if (chosen !== null) return;
    setChosen(letter);
    const res = await run((s) => s.chooseCase(idx, optI));
    if (res.ok && res.data.user) {
      if (caseData.options[optI].pts > 0) showToast(`+${caseData.options[optI].pts} ${t("common.points")}`);
      else showToast(t("de.noPts"));
    }
  };

  const next = async () => {
    const nextIdx = (idx + 1) % cases.length;
    setChosen(null);
    await run((s) => s.patchUser({ caseIndex: nextIdx }));
  };

  const chosenOpt = chosen !== null ? caseData.options[letters.indexOf(chosen)] : null;

  return (
    <>
      <BackLink />
      <h1 className="page-title">{t("de.title")}</h1>
      <p className="muted">{t("de.sub")}</p>

      <div className="card case-card">
        <span className="tag">{t("de.caseOf", { n: idx + 1, total: cases.length })}</span>
        <p className="case-text">{caseData.text}</p>
        {caseData.options.map((opt, i) => (
          <button
            key={i}
            className={"option" + (chosen === letters[i] ? " is-chosen" : "")}
            onClick={() => choose(i, letters[i])}
          >
            <b>{letters[i]}.</b>
            {opt.label}
          </button>
        ))}
      </div>

      {chosenOpt && (
        <div className="card result-card" id="caseResult">
          <h3 className="card-title">{t("de.resultTitle", { choice: chosen })}</h3>
          <p className="muted">{chosenOpt.consequence}</p>
          <div className="impact">{chosenOpt.impact}</div>
          <p className="muted small">{chosenOpt.lesson}</p>
          <button className="btn btn-primary" onClick={next}>
            {t("de.next")}
          </button>
        </div>
      )}
    </>
  );
}