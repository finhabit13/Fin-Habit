import { useEffect, useState } from "react";

import Glyph from "../lib/glyphs";
import ScoreRing from "../components/ScoreRing";
import { useApp } from "../context/AppContext";
import { CHALLENGES } from "../lib/data";
import { challengeOfTheDay, greeting, overallScore, rupiah, scoreTitle, todayKey } from "../lib/util";

export default function Home() {
  const { user, go, run } = useApp();
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    run(async (s) => {
      setBudget(await s.budget());
      return null;
    });
  }, []);

  if (!user) return null;

  const s = overallScore(user.dims);
  const diff = s - user.lastWeek;
  const pct = user.todayTotal ? Math.round((user.todayDone / user.todayTotal) * 100) : 0;
  const challenge = challengeOfTheDay(CHALLENGES);
  const doneToday = (user.challengeDate || {})[challenge.id] === todayKey();
  const warn = budget && (budget.status === "warn" || budget.status === "over");

  return (
    <>
      <p className="greet-small">
        {greeting()}, {user.name}!
      </p>
      <h1 className="greet-big">Satu kebiasaan kecil hari ini.</h1>

      {warn && (
        <button className={"card limit-card " + budget.status} onClick={() => go("budget")}>
          <div className="limit-head">
            <span className="limit-ico">
              <Glyph name="warn" size={18} />
            </span>
            <span className="tag">{budget.status === "over" ? "Melebihi budget" : "Mendekati batas"}</span>
          </div>
          <p className="limit-title">
            Pengeluaran bulan ini {rupiah(budget.spent)} dari {rupiah(budget.budget)} ({budget.pct}%).
          </p>
          <p className="limit-hint">
            {budget.status === "over"
              ? "Budget harianmu kelewat. Lihat pola pengeluaranmu di Limit Warning."
              : "Jangan sampai kelewat: cek pola pengeluaranmu sekarang."}
          </p>
        </button>
      )}

      <div className="card score-card">
        <ScoreRing value={s} />
        <div className="score-info">
          <p className="score-label">Financial Habit Score</p>
          <p className="score-title">{scoreTitle(s)}</p>
          <p className="score-hint">
            {diff >= 0 ? `Naik ${diff} poin` : `Turun ${Math.abs(diff)} poin`} dari minggu lalu.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="row-between">
          <h3 className="card-title">Progress hari ini</h3>
          <span className="pill">{pct}%</span>
        </div>
        <div className="bar">
          <span className="bar-fill" style={{ width: pct + "%" }} />
        </div>
        <p className="muted small">
          {user.todayDone} dari {user.todayTotal} aktivitas harian selesai.
        </p>
      </div>

      <div className={"card challenge-card" + (doneToday ? " is-done" : "")}>
        <span className="tag">Daily Challenge</span>
        <h3 className="challenge-title">{challenge.title}</h3>
        <p className="challenge-meta">
          {challenge.min} menit · +{challenge.pts} poin
        </p>
        <button className="btn btn-light" onClick={() => go("challenge")}>
          {doneToday ? "Selesai hari ini ✓" : "Mulai Challenge"}
        </button>
      </div>

      <h3 className="section-title">Quick Actions</h3>
      <div className="quick-grid">
        <button className="quick" onClick={() => go("expenses")}>
          <span className="q-ico">
            <Glyph name="receipt" size={20} />
          </span>
          Track Spending
        </button>
        <button className="quick" onClick={() => go("budget")}>
          <span className="q-ico">
            <Glyph name="warn" size={20} />
          </span>
          Limit Warning
        </button>
        <button className="quick" onClick={() => go("saving")}>
          <span className="q-ico">
            <Glyph name="piggy" size={20} />
          </span>
          Saving Goals
        </button>
        <button className="quick" onClick={() => go("decide")}>
          <span className="q-ico">
            <Glyph name="scale" size={20} />
          </span>
          Decision Lab
        </button>
        <button className="quick" onClick={() => go("learn")}>
          <span className="q-ico">
            <Glyph name="book" size={20} />
          </span>
          Learn
        </button>
        <button className="quick" onClick={() => go("family")}>
          <span className="q-ico">
            <Glyph name="users" size={20} />
          </span>
          Family Mission
        </button>
      </div>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-num">{user.streak}</span>
          <span className="stat-lab">Hari beruntun</span>
        </div>
        <div className="stat">
          <span className="stat-num">{user.points}</span>
          <span className="stat-lab">Total poin</span>
        </div>
        <div className="stat">
          <span className="stat-num">{user.challengesDone || 0}</span>
          <span className="stat-lab">Challenge</span>
        </div>
      </div>
    </>
  );
}