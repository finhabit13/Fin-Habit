import { useEffect, useState } from "react";

import BackLink from "../components/BackLink";
import AmountInput from "../components/AmountInput";
import SavingRing from "../components/SavingRing";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";
import { parseThousands } from "../lib/money";
import { summarize } from "../lib/savings";
import { rupiah } from "../lib/util";

const PACE_TONE = { ahead: "green", onTrack: "amber", late: "red", done: "green", unknown: "muted" };
const PACE_LABEL = {
  ahead: "g.paceAhead",
  onTrack: "g.paceOnTrack",
  late: "g.paceLate",
  done: "g.paceDone",
  unknown: "g.paceUnknown"
};

export default function SavingGoal() {
  const { run, showToast, showSuccess, openModal, closeModal, goalId, openGoal } = useApp();
  const { t } = useI18n();
  const [goal, setGoal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const res = await run((s) => s.savingGoals());
    if (!res.ok) return;
    const found = res.data.find((g) => g.id === goalId) || null;
    setGoal(found);
    if (!found && goalId) openGoal(null);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalId]);

  if (!goal) {
    return (
      <>
<BackLink label={t("g.title")} target="saving" />
        <p className="muted">{t("g.notFound")}</p>
      </>
    );
  }

  const s = summarize(goal, goal.transactions);

  // --- tambah transaksi
  const tambahTx = () => {
    openModal(
      t("g.txTitle"),
      <TxForm
        submitLabel={t("g.txSave")}
        onSubmit={async (input) => {
          setBusy(true);
          const res = await run((svc) => svc.addSavingTx({ ...input, goalId: goal.id }));
          setBusy(false);
          if (!res.ok) return;
          closeModal();
          await load();
          showSuccess(t("g.txSaved"), rupiah(input.amount));
        }}
      />
    );
  };

  const gantiGambar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const url = await run((svc) => svc.uploadSavingCover(file));
    setUploading(false);
    if (!url || !url.ok) return;
    const res = await run((svc) => svc.updateSavingGoal(goal.id, { coverUrl: url.data }));
    if (!res.ok) return;
    await load();
  };

  const hapusRiwayat = (tx) => {
    openModal(
      t("g.deleteTitle"),
      <div className="stack">
        <p className="muted">{t("g.deleteBody", { amount: rupiah(tx.amount) })}</p>
        <div className="row-gap">
          <button className="btn btn-outline" onClick={closeModal}>
            {t("g.cancel")}
          </button>
          <button
            className="btn btn-danger"
            onClick={async () => {
              const res = await run((svc) => svc.deleteSavingTx(tx.id));
              if (!res.ok) return;
              closeModal();
              await load();
              showToast(t("g.deleted"));
            }}
          >
            {t("g.deleteConfirm")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <BackLink label={t("g.title")} target="saving" />

      <div className="goal-hero">
        {goal.coverUrl ? (
          <img className="goal-hero-img" src={goal.coverUrl} alt="" />
        ) : (
          <div className="goal-hero-img goal-hero-empty">
            <span>{goal.name.slice(0, 1).toUpperCase()}</span>
          </div>
        )}
        <div className="goal-hero-actions">
          <label className={"btn btn-outline small-btn" + (uploading ? " is-busy" : "")}>
            {uploading ? t("g.uploading") : t("g.changePhoto")}
            <input type="file" accept="image/*" onChange={gantiGambar} hidden />
          </label>
        </div>
      </div>

      <h1 className="page-title">{goal.name}</h1>

      {/* Dua ring: uang terkumpul dan kecepatan versus rencana. */}
      <div className="goal-rings">
        <div className="goal-ring-block">
          <SavingRing value={s.percent} tone={s.percent >= 100 ? "green" : "amber"} label={t("g.ringMoney")}>
            <span className="goal-ring-label">{t("g.collected")}</span>
            <span className="goal-ring-money">{rupiah(s.balance)}</span>
            <span className="goal-ring-sub">/ {rupiah(s.target)}</span>
          </SavingRing>
        </div>

        <div className="goal-ring-block">
          <SavingRing
            value={s.pace.fill}
            tone={PACE_TONE[s.pace.status]}
            label={t("g.ringDays")}
          >
            <span className="goal-ring-label">{t("g.daysLabel")}</span>
            {s.daysLeft === null ? (
              <span className="goal-ring-days">-</span>
            ) : (
              <span className="goal-ring-days">{s.daysLeft}</span>
            )}
            <span className="goal-ring-sub">{t(PACE_LABEL[s.pace.status])}</span>
          </SavingRing>
        </div>
      </div>

      {s.daysLeft !== null && s.pace.status !== "done" && (
        <div className="card soft-blue">
          <p className="muted small">{t("g.planNote", { remain: rupiah(s.remaining) })}</p>
        </div>
      )}

      <div className="row-between">
        <h3 className="section-title">{t("g.history")}</h3>
        <button className="btn btn-primary round-btn" onClick={tambahTx} aria-label={t("g.txTitle")}>
          +
        </button>
      </div>

      {goal.transactions.length === 0 ? (
        <div className="card soft-blue">
          <p className="muted">{t("g.txEmpty")}</p>
        </div>
      ) : (
        <ul className="tx-list">
          {goal.transactions.map((tx) => (
            <li key={tx.id} className="tx-row">
              <span className={"tx-dot " + tx.kind} aria-hidden="true" />
              <div className="tx-main">
                <span className="tx-amount">
                  {tx.kind === "expense" ? "-" : "+"}
                  {rupiah(tx.amount)}
                </span>
                {tx.note && <span className="tx-note">{tx.note}</span>}
              </div>
              <span className="muted small">{tx.occurredOn}</span>
              <button
                className="tx-del"
                onClick={() => hapusRiwayat(tx)}
                aria-label={t("g.delete")}
              >
                x
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** Isi modal tambah riwayat: jenis, nominal, catatan opsional. */
function TxForm({ onSubmit, submitLabel, busy }) {
  const { t } = useI18n();
  const [kind, setKind] = useState("income");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({
          kind,
          amount: parseThousands(amount),
          note: note.trim()
        });
      }}
    >
      <div className="tx-kind" role="group" aria-label={t("g.txTitle")}>
        <button
          type="button"
          className={"tx-kind-btn" + (kind === "income" ? " is-active" : "")}
          onClick={() => setKind("income")}
        >
          {t("g.income")}
        </button>
        <button
          type="button"
          className={"tx-kind-btn" + (kind === "expense" ? " is-active" : "")}
          onClick={() => setKind("expense")}
        >
          {t("g.expense")}
        </button>
      </div>

      <label className="field">
        <span>{t("g.amount")}</span>
        <AmountInput value={amount} onChange={setAmount} placeholder={t("g.phAmount")} required />
      </label>

      <label className="field">
        <span>{t("g.note")}</span>
        <input
          type="text"
          value={note}
          maxLength={120}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("g.phNote")}
        />
      </label>

      <button className="btn btn-primary" type="submit" disabled={busy}>
        {submitLabel}
      </button>
    </form>
  );
}