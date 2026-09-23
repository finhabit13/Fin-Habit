import { useEffect, useState } from "react";

import BackLink from "../components/BackLink";
import { useApp } from "../context/AppContext";
import { rupiah } from "../lib/util";

export default function Saving() {
  const { user, run, showSuccess, showToast } = useApp();
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
      showToast("Masukkan nominal lebih dari 0");
      return;
    }
    const res = await run((s) => s.addSaving(n));
    if (!res.ok) return;
    setGoal({ goal: res.data.goal, current: res.data.current });
    setAddVal("");
    showSuccess("Tabungan bertambah", "+" + rupiah(n));
  };

  const setTarget = async () => {
    const n = Number(targetVal);
    if (!n || n <= 0) {
      showToast("Masukkan target lebih dari 0");
      return;
    }
    const res = await run((s) => s.setTarget(n));
    if (!res.ok) return;
    setGoal({ goal: res.data.goal, current: res.data.current });
    setTargetVal("");
    showToast("Target disimpan: " + rupiah(n));
  };

  return (
    <>
      <BackLink label="Home" />
      <h1 className="page-title">Saving Goals</h1>
      <p className="muted">Atur tujuan, pantau kemajuan, dan tetap termotivasi menabung.</p>

      <div className="pair">
        <div className="card">
          <label className="field">
            <span>Uang ditabung per hari (Rp)</span>
            <input type="number" value={daily} min="0" step="1000" onChange={(e) => setDaily(e.target.value)} />
          </label>
          <label className="field">
            <span>Jumlah hari</span>
            <input type="number" value={days} min="1" onChange={(e) => setDays(e.target.value)} />
          </label>
          <button className="btn btn-primary" onClick={() => showToast("Simulasi diperbarui")}>
            Hitung simulasi
          </button>
        </div>

        <div className="pair-stack">
          <div className="result-grid">
            <div className="res">
              <span className="res-lab">1 hari</span>
              <span className="res-val">{rupiah(d)}</span>
            </div>
            <div className="res">
              <span className="res-lab">1 minggu</span>
              <span className="res-val">{rupiah(d * 7)}</span>
            </div>
            <div className="res">
              <span className="res-lab">1 bulan</span>
              <span className="res-val">{rupiah(d * 30)}</span>
            </div>
            <div className="res highlight">
              <span className="res-lab">1 tahun</span>
              <span className="res-val">{rupiah(d * 365)}</span>
            </div>
          </div>

          <div className="card soft-blue">
            <p className="muted small">
              {d === 0
                ? "Masukkan nominal tabungan harian untuk melihat hasilnya."
                : `Dalam ${nDays} hari kamu mengumpulkan ${rupiah(d * nDays)}.`
                + (goalObj.goal > 0 && goalObj.current < goalObj.goal
                    ? ` Sisa target ${rupiah(goalObj.goal - goalObj.current)} tercapai dalam sekitar ${
                        d > 0 ? Math.ceil((goalObj.goal - goalObj.current) / d) : 0
                      } hari.`
                    : "")}
            </p>
          </div>
        </div>
      </div>

      <h3 className="section-title">Saving Goal</h3>
      <div className="card">
        <div className="row-between">
          <div>
            <p className="muted small">Target</p>
            <p className="goal-num">{rupiah(goalObj.goal)}</p>
          </div>
          <div className="right">
            <p className="muted small">Terkumpul</p>
            <p className="goal-num green">{rupiah(goalObj.current)}</p>
          </div>
        </div>
        <div className="bar">
          <span className="bar-fill green" style={{ width: pct + "%" }} />
        </div>
        <p className="muted small">
          {pct >= 100
            ? "Target tercapai. Saatnya membuat target baru."
            : `${pct.toFixed(1)}% menuju target. Sisa ${rupiah(goalObj.goal - goalObj.current)}.`}
        </p>

        <div className="inline-form">
          <input
            type="number"
            placeholder="Tambah tabungan"
            step="5000"
            value={addVal}
            onChange={(e) => setAddVal(e.target.value)}
          />
          <button className="btn btn-primary small-btn" onClick={addSaving}>
            Tambah
          </button>
        </div>
        <div className="inline-form">
          <input
            type="number"
            placeholder="Ubah target"
            value={targetVal}
            onChange={(e) => setTargetVal(e.target.value)}
          />
          <button className="btn btn-outline small-btn" onClick={setTarget}>
            Simpan target
          </button>
        </div>
      </div>
    </>
  );
}