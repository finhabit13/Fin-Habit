import { useEffect, useMemo, useState } from "react";

import Glyph from "../lib/glyphs";
import BackLink from "../components/BackLink";
import { useApp } from "../context/AppContext";
import { EXPENSE_CATEGORIES, categoryFor } from "../lib/data";
import { budgetInfo, dayLabel, monthKey, rupiah, todayKey } from "../lib/util";

export default function Expenses() {
  const { run, showSuccess, showToast } = useApp();
  const [items, setItems] = useState([]);
  const [budget, setBudget] = useState(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");

  const load = async () => {
    await run(async (s) => {
      const data = await s.expenses(monthKey());
      setItems(data.expenses || []);
      if (data.budget) setBudget(data.budget);
      else setBudget((await s.budget()).budget);
      return null;
    });
  };

  useEffect(() => {
    load();
  }, []);

  const spent = useMemo(() => items.reduce((n, e) => n + e.amount, 0), [items]);
  const info = budgetInfo(spent, budget || 0);

  const submit = async (e) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n <= 0) {
      showToast("Masukkan nominal lebih dari 0");
      return;
    }
    const res = await run((s) =>
      s.addExpense({ amount: n, category, note: note.trim(), date: todayKey() })
    );
    if (!res.ok) return;
    setAmount("");
    setNote("");
    showSuccess("Pengeluaran dicatat", "+" + rupiah(n));
    load();
  };

  const remove = async (id) => {
    await run((s) => s.deleteExpense(id));
    load();
  };

  const grouped = useMemo(() => {
    const map = new Map();
    items.forEach((e) => {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date).push(e);
    });
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [items]);

  return (
    <>
      <BackLink />
      <h1 className="page-title">Track Spending</h1>
      <p className="muted">Catat ke mana saja uangmu pergi: kopi, batagor, transport, top-up.</p>

      <div className="pair">
        <div className={"card meter-card " + info.status}>
          <div className="row-between">
            <span className="meter-title">Bulan ini</span>
            <span className="tag">{info.status === "safe" ? "Aman" : info.status === "warn" ? "Perhatian" : "Berlebihan"}</span>
          </div>
          <p className="meter-total">{rupiah(spent)}</p>
          <p className="meter-sub">dari budget {rupiah(budget || 0)}</p>
          <div className="bar">
            <span
              className={"bar-fill " + (info.status === "over" ? "danger" : info.status === "warn" ? "warn" : "")}
              style={{ width: Math.min(100, info.pct) + "%" }}
            />
          </div>
          <p className="meter-hint">{info.pct}% dari batas bulan ini.</p>
        </div>

        <form className="card" onSubmit={submit}>
          <h3 className="card-title">Catat pengeluaran</h3>
          <div className="exp-line">
            <input
              type="number"
              className="exp-amount"
              placeholder="Rp"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Catatan (opsional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button className="btn btn-primary">Tambah pengeluaran (+5 poin)</button>
        </form>
      </div>

      <h3 className="section-title">Riwayat</h3>
      {grouped.length === 0 && (
        <div className="card">
          <p className="muted small">Belum ada pengeluaran bulan ini.</p>
        </div>
      )}
      {grouped.map(([date, list]) => (
        <div key={date}>
          <p className="date-label">{dayLabel(date)}</p>
          {list.map((e) => {
            const cat = categoryFor(e.category);
            return (
              <div key={e.id} className="card expense-item">
                <div className="exp-ico">
                  <Glyph name={cat.icon} size={19} />
                </div>
                <div className="exp-body">
                  <p className="exp-title">{cat.label}</p>
                  {e.note && <p className="exp-note">{e.note}</p>}
                </div>
                <div className="right">
                  <p className="exp-amount-nowrap">−{rupiah(e.amount)}</p>
                  <button className="exp-del" onClick={() => remove(e.id)}>
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}