import { useEffect, useState } from "react";

import BackLink from "../components/BackLink";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";
import { rupiah } from "../lib/util";

export default function Saving() {
  const { user, run, showSuccess, showToast } = useApp();
  const { t } = useI18n();
  const [daily, setDaily] = useState(5000);
  const [days, setDays] = useState(30);
  const [goal, setGoal] = useState(null);
  const [addVal, setAddVal] = useState("");
  const [targetVal, setTargetVal] = useState("");

  const load = async () => {
    await run(async (s) => {
      setGoal(await s.saving());
      return null;
    });
  };

  useEffect(() => {
    load();
  }, []);

  const d = Math.max(0, Number(daily) || 0);
  const nDays = Math.max(1, Number(days) || 1);

  const goalObj = goal || { goal: user?.savingGoal || 0, current: user?.savingCurrent || 0 };
  const pct = goalObj.goal > 0 ? Math.min(100, (goalObj.current / goalObj.goal) * 100) : 0;

  const addSaving = async () => {
    const n = Number(addVal);
    if (!n || n <= 0) {
      showToast(t("sv.err"));
      return;
    }
    const res = await run((s) => s.addSaving(n));
    if (!res.ok) return;
    setGoal({ goal: res.data.goal, current: res.data.current });
    setAddVal("");
    showSuccess(t("sv.added"), "+" + rupiah(n));
  };

  const setTarget = async () => {
    const n = Number(targetVal);
    if (!n || n <= 0) {
      showToast(t("sv.err"));
      return;
    }
    const res = await run((s) => s.setTarget(n));
    if (!res.ok) return;
    setGoal({ goal: res.data.goal, current: res.data.current });
    setTargetVal("");
    showToast(t("sv.targetSaved", { value: rupiah(n) }));
  };

  const remainDays = d > 0 ? Math.ceil(Math.max(0, goalObj.goal - goalObj.current) / d) : 0;

  return (
    <>
      <BackLink label={t("nav.home")} />
      <h1 className="page-title">{t("sv.title")}</h1>
      <p className="muted">{t("sv.sub")}</p>

      <div className="pair">
        <div className="card">
          <label className="field">
            <span>{t("sv.fieldDaily")}</span>
            <input type="number" value={daily} min="0" step="1000" onChange={(e) => setDaily(e.target.value)} />
          </label>
          <label className="field">
            <span>{t("sv.fieldDays")}</span>
            <input type="number" value={days} min="1" onChange={(e) => setDays(e.target.value)} />
          </label>
          <button className="btn btn-primary" onClick={() => showToast(t("sv.simUpdated"))}>
            {t("sv.btnSimulate")}
          </button>
        </div>

        <div className="pair-stack">
          <div className="result-grid">
            <div className="res">
              <span className="res-lab">{t("sv.res1day")}</span>
              <span className="res-val">{rupiah(d)}</span>
            </div>
            <div className="res">
              <span className="res-lab">{t("sv.res1week")}</span>
              <span className="res-val">{rupiah(d * 7)}</span>
            </div>
            <div className="res">
              <span className="res-lab">{t("sv.res1month")}</span>
              <span className="res-val">{rupiah(d * 30)}</span>
            </div>
            <div className="res highlight">
              <span className="res-lab">{t("sv.res1year")}</span>
              <span className="res-val">{rupiah(d * 365)}</span>
            </div>
          </div>

          <div className="card soft-blue">
            <p className="muted small">
              {d === 0
                ? t("sv.emptyHint")
                : t("sv.inDays", { days: nDays, total: rupiah(d * nDays) }) +
                  (goalObj.goal > 0 && goalObj.current < goalObj.goal
                    ? " " + t("sv.remaining", { remain: rupiah(goalObj.goal - goalObj.current), days: remainDays })
                    : "")}
            </p>
          </div>
        </div>
      </div>

      <h3 className="section-title">{t("sv.goalTitle")}</h3>
      <div className="card">
        <div className="row-between">
          <div>
            <p className="muted small">{t("sv.target")}</p>
            <p className="goal-num">{rupiah(goalObj.goal)}</p>
          </div>
          <div className="right">
            <p className="muted small">{t("sv.collected")}</p>
            <p className="goal-num green">{rupiah(goalObj.current)}</p>
          </div>
        </div>
        <div className="bar">
          <span className="bar-fill green" style={{ width: pct + "%" }} />
        </div>
        <p className="muted small">
          {pct >= 100
            ? t("sv.goalDone")
            : t("sv.pctToGoal", { pct: pct.toFixed(1), remain: rupiah(goalObj.goal - goalObj.current) })}
        </p>

        <div className="inline-form">
          <input
            type="number"
            placeholder={t("sv.phAdd")}
            step="5000"
            value={addVal}
            onChange={(e) => setAddVal(e.target.value)}
          />
          <button className="btn btn-primary small-btn" onClick={addSaving}>
            {t("sv.btnAdd")}
          </button>
        </div>
        <div className="inline-form">
          <input
            type="number"
            placeholder={t("sv.phTarget")}
            value={targetVal}
            onChange={(e) => setTargetVal(e.target.value)}
          />
          <button className="btn btn-outline small-btn" onClick={setTarget}>
            {t("sv.btnSaveTarget")}
          </button>
        </div>
      </div>
    </>
  );
}