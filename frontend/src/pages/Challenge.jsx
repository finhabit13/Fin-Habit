import { useMemo, useState } from "react";

import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";
import { dailyChallenges, todayKey } from "../lib/util";

const REFLECTION_MIN = 15;
const PER_DAY = 3;

export default function Challenge() {
  const { user, run, showSuccess, showToast, challenges } = useApp();
  const { t, content } = useI18n();
  const [currentId, setCurrentId] = useState(null);
  const [done, setDone] = useState([]);
  const [reflection, setReflection] = useState("");
  const [opened, setOpened] = useState(false);

  const day = todayKey();
  const pool = challenges?.length ? challenges : content.CHALLENGES;
  const todays = useMemo(() => dailyChallenges(pool, PER_DAY, day), [pool, day]);
  const current = useMemo(
    () => todays.find((c) => c.id === currentId) || todays[0],
    [todays, currentId]
  );

  if (!user || !current) return null;

  const dateMap = user.challengeDate || {};
  const doneToday = dateMap[current.id] === day;
  const steps = current.steps || [];
  const allTicked = steps.length > 0 && done.length === steps.length;
  const reflectionOk = reflection.trim().length >= REFLECTION_MIN;
  // Challenge yang punya link sumber harus benar-benar dibuka dulu. Tanpa ini
  // orang bisa centang semua langkah tanpa pernah menyentuh materinya.
  const hasLink = !!current.url;
  const sourceOk = !hasLink || opened;
  // Syarat yang belum terpenuhi. Tombol sengaja tidak memakai gabungan
  // syarat ini untuk status disabled: begitu tombolnya mati, klik tidak
  // melakukan apa-apa dan pengguna tidak tahu apa yang kurang. Daftar di bawah
  // ini yang memberi tahu, dan toast di complete() tetap jadi pengaman kalau
  // tombol diklik.
  const blockers = [];
  if (!allTicked) blockers.push(t("ch.checkAll"));
  if (!reflectionOk) blockers.push(t("ch.reflectionShort"));
  if (!sourceOk) blockers.push(t("ch.openFirst"));
  const progress = steps.length ? Math.round((done.length / steps.length) * 100) : 0;
  const finishedCount = todays.filter((c) => dateMap[c.id] === day).length;

  const pick = (id) => {
    setCurrentId(id);
    setDone([]);
    setReflection("");
    setOpened(false);
  };

  const toggleStep = (i) =>
    setDone((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const complete = async () => {
    if (doneToday) return;
    if (!allTicked) {
      showToast(t("ch.checkAll"));
      return;
    }
    if (!reflectionOk) {
      showToast(t("ch.reflectionShort"));
      return;
    }
    if (!sourceOk) {
      showToast(t("ch.openFirst"));
      return;
    }
    const res = await run((s) =>
      s.completeChallenge({ challengeId: current.id, kind: current.kind, reflection: reflection.trim() })
    );
    if (!res.ok) return;
    if (res.data.already) return;
    setDone([]);
    setReflection("");
    setOpened(false);
    showSuccess(t("ch.doneTitle"), "+" + current.pts + " " + t("common.points"));
  };

  return (
    <>
      <h1 className="page-title">{t("ch.title")}</h1>
      <p className="muted">{t("ch.sub")}</p>

      <div className="row-between day-strip">
        <span className="small muted">{t("ch.todayCount", { done: finishedCount, total: todays.length })}</span>
        <div className="day-pips" aria-hidden="true">
          {todays.map((c) => (
            <span key={c.id} className={"day-pip" + (dateMap[c.id] === day ? " on" : "")} />
          ))}
        </div>
      </div>

      <div className="card challenge-hero">
        <div className="row-between">
          <span className={"tag tag-" + current.kind}>{t("ch.kind." + current.kind)}</span>
          <span className="muted small">
            {current.min} {t("common.minutes")} · +{current.pts} {t("common.points")}
          </span>
        </div>

        <h2 className="challenge-hero-title">{current.title}</h2>
        <p className="muted">{current.desc}</p>

        {current.url ? (
          <div className="challenge-source">
            <span className="muted small">
              {t("ch.source")}: <strong>{current.source}</strong>
            </span>
            <a
              className={"btn-ghost" + (opened ? " is-done" : "")}
              href={current.url}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => setOpened(true)}
            >
              {opened ? t("ch.sourceOpened") : t("ch.openSource")}
            </a>
          </div>
        ) : (
          <p className="muted small">{t("ch.inApp")}</p>
        )}

        <div className="challenge-progress">
          <div className="challenge-progress-bar">
            <span style={{ width: progress + "%" }} />
          </div>
          <span className="muted small">{t("ch.stepCount", { done: done.length, total: steps.length })}</span>
        </div>

        <ol className="challenge-steps">
          {steps.map((step, i) => (
            <li key={i}>
              <label className="challenge-step">
                <input type="checkbox" checked={done.includes(i)} onChange={() => toggleStep(i)} />
                <span>{step}</span>
              </label>
            </li>
          ))}
        </ol>

        <label className="challenge-reflect">
          <span className="small">{t("ch.reflection")}</span>
          <textarea
            rows={3}
            value={reflection}
            placeholder={t("ch.reflectionHint")}
            onChange={(e) => setReflection(e.target.value)}
          />
        </label>

        {!doneToday && blockers.length > 0 && (
          <ul className="challenge-blockers muted small">
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}

        <button className="btn btn-primary btn-block" disabled={doneToday} onClick={complete}>
          {doneToday ? t("ch.doneToday") : t("ch.doIt")}
        </button>
      </div>

      <h3 className="section-title">{t("ch.todayList")}</h3>
      <div className="challenge-today-list">
        {todays.map((c) => {
          const isDone = dateMap[c.id] === day;
          return (
            <button
              key={c.id}
              className={"mini-card" + (c.id === current.id ? " is-current" : "")}
              onClick={() => pick(c.id)}
              aria-current={c.id === current.id}
            >
              <div>
                <p className="mini-title">{c.title}</p>
                <p className="mini-meta">
                  {t("ch.kind." + c.kind)} · {c.min} {t("common.minutes")} · +{c.pts} {t("common.points")}
                </p>
              </div>
              {isDone ? <span className="tag admin">{t("ch.doneMark")}</span> : <span aria-hidden="true">›</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}
