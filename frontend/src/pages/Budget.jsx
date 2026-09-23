import { useEffect, useState } from "react";

import BackLink from "../components/BackLink";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";
import { rupiah } from "../lib/util";

const STATUS = ["safe", "warn", "over", "none"];

export default function Budget() {
  const { run, showSuccess, showToast } = useApp();
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [input, setInput] = useState("");

  const load = async () => {
    await run(async (s) => {
      setData(await s.budget());
      return null;
    });
  };

  useEffect(() => {
    load();
  }, []);

  if (!data)
    return (
      <>
        <BackLink />
        <h1 className="page-title">{t("bu.title")}</h1>
        <div className="card">
          <p className="muted">{t("bu.loading")}</p>
        </div>
      </>
    );

  const status = STATUS.includes(data.status) ? data.status : "safe";
  const pctWidth = Math.min(100, data.pct);

  const save = async () => {
    const n = Number(input);
    if (!n || n <= 0) {
      showToast(t("bu.err"));
      return;
    }
    const res = await run((s) => s.setBudget(n));
    if (!res.ok) return;
    setData(res.data);
    setInput("");
    showSuccess(t("bu.saved"), rupiah(n));
  };

  return (
    <>
      <BackLink />
      <h1 className="page-title">{t("bu.title")}</h1>
      <p className="muted">{t("bu.sub")}</p>

      <div className="pair">
        <div className={"card limiter " + status}>
          <span className="tag">{t("bu." + status + "Tag")}</span>
          <p className="limiter-title">{t("bu." + status + "Title")}</p>
          <p className="limiter-total">{rupiah(data.spent)}</p>
          <p className="limiter-sub">
            {t("bu.fromSpent", { budget: rupiah(data.budget), pct: data.pct })}
          </p>
          <div className="bar">
            <span
              className={"bar-fill " + (status === "over" ? "danger" : status === "warn" ? "warn" : "")}
              style={{ width: pctWidth + "%" }}
            />
          </div>
          <p className="muted small">{t("bu." + status + "Hint")}</p>
        </div>

        <div className="card">
          <h3 className="card-title">{t("bu.formTitle")}</h3>
          <label className="field">
            <span>{t("bu.fieldLabel")}</span>
            <input
              type="number"
              value={input}
              min="0"
              step="10000"
              placeholder={rupiah(data.budget || 0)}
              onChange={(e) => setInput(e.target.value)}
            />
          </label>
          <button className="btn btn-primary" onClick={save}>
            {t("bu.btnSave")}
          </button>
        </div>
      </div>

      <div className="card soft-blue">
        <p className="muted small">
          {t("bu.level", {
            a: t("bu.safeTag"),
            b: t("bu.warnTag"),
            c: t("bu.overTag")
          })}
        </p>
      </div>
    </>
  );
}