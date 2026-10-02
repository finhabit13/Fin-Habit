import { useEffect, useState } from "react";

import BackLink from "../components/BackLink";
import AmountInput from "../components/AmountInput";
import Meter from "../components/Meter";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";
import { parseThousands } from "../lib/money";
import { daysLeft, savedPercent } from "../lib/savings";
import { rupiah } from "../lib/util";

const G = "goals";

/** Form di dalam modal: dipakai untuk membuat dan untuk mengubah goal. */
export function GoalForm({ initial, submitLabel, onSubmit, busy, onPickCover }) {
  const { t } = useI18n();
  const [name, setName] = useState(initial?.name || "");
  const [target, setTarget] = useState(initial?.targetAmount ?? "");
  const [cadence, setCadence] = useState(initial?.cadenceAmount ?? "");
  const [unit, setUnit] = useState(initial?.cadenceUnit || "day");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl || "");

  const pilihCover = async (file) => {
    const up = await onPickCover(file);
    if (up) setCoverUrl(up);
  };

  const kirim = async (e) => {
    e.preventDefault();
    const targetAmount = parseThousands(target);
    const cadenceAmount = parseThousands(cadence);
    await onSubmit({
      name: name.trim(),
      targetAmount,
      // Dikirim sebagai 0 kalau kosong: "belum punya rencana" adalah keadaan
      // yang sah, bukan berarti plans-nya error.
      cadenceAmount: cadenceAmount > 0 ? cadenceAmount : 0,
      cadenceUnit: unit,
      coverUrl
    });
  };

  return (
    <form className="stack" onSubmit={kirim}>
      <label className="field">
        <span>{t("g.name")}</span>
        <input
          type="text"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("g.phName")}
          required
        />
      </label>

      <label className="field">
        <span>{t("g.target")}</span>
        <AmountInput
          value={target}
          onChange={setTarget}
          placeholder={t("g.phTarget")}
          required
        />
      </label>

      <div className="pair">
        <label className="field">
          <span>{t("g.cadence")}</span>
          <AmountInput value={cadence} onChange={setCadence} placeholder="0" />
        </label>
        <label className="field">
          <span>{t("g.cadenceUnit")}</span>
          <select value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="day">{t("g.unitDay")}</option>
            <option value="week">{t("g.unitWeek")}</option>
            <option value="month">{t("g.unitMonth")}</option>
          </select>
        </label>
      </div>
      <p className="muted small">{t("g.cadenceHint")}</p>

      {onPickCover ? (
        <div className="stack">
          <label className="field">
            <span>{t("g.changePhoto")}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                //nolint
                e.target.value = "";
                if (f) onPickCover(f);
              }}
            />
          </label>
          {coverUrl ? <img className="goal-cover-preview" src={coverUrl} alt="" /> : null}
        </div>
      ) : null}

      <button className="btn btn-primary" type="submit" disabled={busy}>
        {submitLabel}
      </button>
    </form>
  );
}

export default function Saving() {
  const { run, openModal, closeModal, openGoal } = useApp();
  const { t } = useI18n();
  const [goals, setGoals] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await run((s) => s.savingGoals());
    if (res.ok) setGoals(res.data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tambah = () => {
    openModal(
      t("g.newTitle"),
      <GoalForm
        submitLabel={t("g.create")}
        busy={busy}
        onSubmit={async (input) => {
          setBusy(true);
          const res = await run((s) => s.createSavingGoal(input));
          setBusy(false);
          if (!res.ok) return;
          closeModal();
          await load();
        }}
        onPickCover={async (file) => {
          const up = await run((s) => s.uploadSavingCover(file));
          return up.ok ? up.data : null;
        }}
      />
    );
  };

  return (
    <>
      <BackLink label={t("nav.home")} />
      <div className="row-between">
        <div>
          <h1 className="page-title">{t("g.title")}</h1>
          <p className="muted">{t("g.sub")}</p>
        </div>
        <button className="btn btn-primary round-btn" onClick={tambah} aria-label={t("g.newTitle")}>
          +
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card soft-blue">
          <p className="muted">{t("g.empty")}</p>
          <button className="btn btn-primary" onClick={tambah}>
            {t("g.createFirst")}
          </button>
        </div>
      ) : (
        <>
          {/* Goal utama ditampilkan sendirian di atas, sisanya dikelompokkan
              di bawah. Kalau semua goal dirender di daftar pertama lalu
              slice(1) dirender lagi, goal kedua ke-n akan muncul dua kali. */}
          <div className="goal-list goal-list-featured">
            <GoalCard goal={goals[0]} onOpen={() => openGoal(goals[0].id)} featured />
          </div>
          {goals.length > 1 && (
            <>
              <h3 className="section-title">{t("g.others")}</h3>
              <div className="goal-list">
                {goals.slice(1).map((g) => (
                  <GoalCard key={g.id} goal={g} onOpen={() => openGoal(g.id)} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

function GoalCard({ goal, onOpen, featured }) {
  const { t } = useI18n();
  const pct = savedPercent(goal.targetAmount, goal.balance);
  const sisa = daysLeft(goal.targetAmount, goal.balance, goal.cadenceAmount, goal.cadenceUnit);

  return (
    <button className={featured ? "goal-card is-featured" : "goal-card"} onClick={onOpen}>
      <div className="goal-card-cover">
        {goal.coverUrl ? (
          <img src={goal.coverUrl} alt="" />
        ) : (
          <span className="goal-card-cover-empty" aria-hidden="true">
            {goal.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <div className="goal-card-body">
        <p className="goal-card-name">{goal.name}</p>
        <p className="goal-card-amount">
          {rupiah(goal.balance)}
          <span className="muted"> / {rupiah(goal.targetAmount)}</span>
        </p>
        <div className="bar">
          <Meter value={pct} tone={pct >= 100 ? "green" : "amber"} />
        </div>
        <p className="muted small">
          {pct >= 100
            ? t("g.reached")
            : sisa === null
              ? t("g.noPlan")
              : t("g.daysLeft", { days: sisa })}
        </p>
      </div>
    </button>
  );
}