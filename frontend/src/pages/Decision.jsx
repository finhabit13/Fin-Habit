import { useState } from "react";

import BackLink from "../components/BackLink";
import { useApp } from "../context/AppContext";
import { CASES } from "../lib/data";

export default function Decision() {
  const { user, run, showToast } = useApp();
  const [chosen, setChosen] = useState(null);

  if (!user) return null;

  const idx = user.caseIndex % CASES.length;
  const caseData = CASES[idx];
  const letters = ["A", "B", "C", "D"];

  const choose = async (optI, letter) => {
    if (chosen !== null) return;
    setChosen(letter);
    const res = await run((s) => s.chooseCase(idx, optI));
    if (res.ok && res.data.user) {
      if (caseData.options[optI].pts > 0) showToast(`+${caseData.options[optI].pts} poin`);
      else showToast("Tidak ada poin untuk pilihan ini");
    }
  };

  const next = async () => {
    const nextIdx = (idx + 1) % CASES.length;
    setChosen(null);
    await run((s) => s.patchUser({ caseIndex: nextIdx }));
  };

  const chosenOpt = chosen !== null ? caseData.options[letters.indexOf(chosen)] : null;

  return (
    <>
      <BackLink />
      <h1 className="page-title">Decision Lab</h1>
      <p className="muted">Tidak ada jawaban "benar" tunggal. Lihat dampaknya.</p>

      <div className="card case-card">
        <span className="tag">
          Kasus {idx + 1} dari {CASES.length}
        </span>
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
          <h3 className="card-title">Kamu memilih {chosen}</h3>
          <p className="muted">{chosenOpt.consequence}</p>
          <div className="impact">{chosenOpt.impact}</div>
          <p className="muted small">{chosenOpt.lesson}</p>
          <button className="btn btn-primary" onClick={next}>
            Kasus berikutnya
          </button>
        </div>
      )}
    </>
  );
}