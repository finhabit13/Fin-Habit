import { useState } from "react";

import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";
import { challengeOfTheDay, todayKey } from "../lib/util";

export default function Challenge() {
  const { user, run, showSuccess, showToast } = useApp();
  const { t, content } = useI18n();
  const [currentId, setCurrentId] = useState(null);
  const [chips, setChips] = useState([]);

  if (!user) return null;

  const defaultCh = challengeOfTheDay(content.CHALLENGES);
  const current = content.CHALLENGES.find((c) => c.id === currentId) || defaultCh;
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
      showToast(t("ch.minChips"));
      return;
    }
    const res = await run((s) => s.completeChallenge({ challengeId: current.id, chips }));
    if (!res.ok) return;
    if (res.data.already) return;
    setChips([]);
    showSuccess(t("ch.doneTitle"), "+" + current.pts + " " + t("common.points"));
  };

  const shuffle = () => {
    const pool = content.CHALLENGES.filter((c) => c.id !== current.id);
    pick(pool[Math.floor(Math.random() * pool.length)].id);
    showToast(t("ch.newPicked"));
  };

  const others = content.CHALLENGES.filter((c) => c.id !== current.id).slice(0, 5);

  return (
    <>
      <h1 className="page-title">{t("ch.title")}</h1>
      <p className="muted">{t("ch.sub")}</p>

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
            {current.min} {t("common.minutes")} · +{current.pts} {t("common.points")}
          </span>
          <button className="btn-ghost" onClick={shuffle}>
            {t("ch.shuffle")}
          </button>
        </div>
        <button className="btn btn-primary" disabled={doneToday} onClick={complete}>
          {doneToday ? t("ch.doneToday") : t("ch.doIt")}
        </button>
      </div>

      <h3 className="section-title">{t("ch.other")}</h3>
      <div className="grid-2">
        {others.map((c) => {
          const done = (user.challengeDate || {})[c.id] === todayKey();
          return (
            <button key={c.id} className="mini-card" onClick={() => pick(c.id)}>
              <div>
                <p className="mini-title">{c.title}</p>
                <p className="mini-meta">
                  {c.cat} · {c.min} {t("common.minutes")} · +{c.pts} {t("common.points")}
                  {done ? t("ch.doneMark") : ""}
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