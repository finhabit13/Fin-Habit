import { useState } from "react";

import { useApp } from "../context/AppContext";
import { CHALLENGES } from "../lib/data";
import { challengeOfTheDay, todayKey } from "../lib/util";

export default function Challenge() {
  const { user, run, showSuccess, showToast } = useApp();
  const [currentId, setCurrentId] = useState(null);
  const [chips, setChips] = useState([]);

  if (!user) return null;

  const defaultCh = challengeOfTheDay(CHALLENGES);
  const current = CHALLENGES.find((c) => c.id === currentId) || defaultCh;
  const doneToday = (user.challengeDate || {})[current.id] === todayKey();

  const pick = (id) => {
    setCurrentId(id);
    setChips([]);
  };

  const toggleChip = (name) =>
    setChips((prev) => (prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]));

  const complete = async () => {
    if (doneToday) return;
    if (chips.length === 0) {
      showToast("Pilih minimal 1 kategori yang kamu lakukan");
      return;
    }
    const res = await run((s) => s.completeChallenge({ challengeId: current.id, chips }));
    if (!res.ok) return;
    if (res.data.already) return;
    setChips([]);
    showSuccess("Challenge selesai!", "+" + current.pts + " poin");
  };

  const shuffle = () => {
    const pool = CHALLENGES.filter((c) => c.id !== current.id);
    pick(pool[Math.floor(Math.random() * pool.length)].id);
    showToast("Tantangan baru dipilih");
  };

  const others = CHALLENGES.filter((c) => c.id !== current.id).slice(0, 5);

  return (
    <>
      <h1 className="page-title">Daily Challenge</h1>
      <p className="muted">Satu tantangan kecil setiap hari membentuk kebiasaan.</p>

      <div className="card challenge-hero">
        <span className="tag">{current.cat}</span>
        <h2 className="challenge-hero-title">{current.title}</h2>
        <p className="muted">{current.desc}</p>
        <div className="chip-row">
          {current.chips.map((name) => (
            <button
              key={name}
              className={"chip" + (chips.includes(name) ? " on" : "")}
              onClick={() => toggleChip(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="row-between challenge-foot">
          <span className="muted small">
            {current.min} menit · +{current.pts} poin
          </span>
          <button className="btn-ghost" onClick={shuffle}>
            Ganti tantangan
          </button>
        </div>
        <button className="btn btn-primary" disabled={doneToday} onClick={complete}>
          {doneToday ? "Sudah selesai hari ini ✓" : "Selesaikan Challenge"}
        </button>
      </div>

      <h3 className="section-title">Tantangan lain</h3>
      <div className="grid-2">
        {others.map((c) => {
          const done = (user.challengeDate || {})[c.id] === todayKey();
          return (
            <button key={c.id} className="mini-card" onClick={() => pick(c.id)}>
              <div>
                <p className="mini-title">{c.title}</p>
                <p className="mini-meta">
                  {c.cat} · {c.min} menit · +{c.pts} poin
                  {done ? " · selesai ✓" : ""}
                </p>
              </div>
              <span aria-hidden="true">›</span>
            </button>
          );
        })}
      </div>
    </>
  );
}