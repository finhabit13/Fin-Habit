import Glyph from "../lib/glyphs";
import Meter from "../components/Meter";
import BackLink from "../components/BackLink";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";
import { dailyMissions, todayKey } from "../lib/util";
import { MISSIONS, MISSIONS_PER_DAY } from "../lib/data";

export default function Family() {
  const { user, run, showSuccess } = useApp();
  const { t, content } = useI18n();
  if (!user) return null;

  // Undian dihitung ulang dari tanggal, bukan dibaca dari server. Setelah
  // tengah malam client yang terbuka otomatis ikut berubah ke misi hari baru.
  const hariIni = todayKey();
  const undian = dailyMissions(MISSIONS, MISSIONS_PER_DAY, hariIni);

  // Misi di data.js adalah sumber judul, terjemahan ada di locales.js. Kalau
  // ada id yang belum diterjemahkan, isi dari data.js tetap dipakai supaya
  // kartu tidak pernah kosong.
  const missions = undian.map((m) => {
    const l = content.MISSIONS.find((x) => x.id === m.id);
    return l ? { ...m, ...l, pts: m.pts, dim: m.dim, icon: m.icon } : m;
  });

  const missionLog = user.missionLog || {};
  const doneCount = undian.filter((m) => missionLog[m.id] === hariIni).length;
  const allDone = doneCount === undian.length;

  const complete = async (m) => {
    if (missionLog[m.id] === hariIni) return;
    const res = await run((s) => s.completeMission(m.id));
    if (!res.ok) return;
    if (res.data.already) return;
    if (res.data.notToday) {
      showSuccess(t("fa.todayGone"), "");
      return;
    }
    showSuccess(t("fa.success"), "+" + m.pts + " " + t("common.points"));
  };

  return (
    <>
      <BackLink />
      <h1 className="page-title">{t("fa.title")}</h1>
      <p className="muted">{t("fa.sub")}</p>

      <div className="mission-head">
        <p className="muted">{t("fa.today")}</p>
        {allDone ? (
          <span className="done-label">{t("fa.allDone")}</span>
        ) : (
          <span className="tag family-tag">
            {doneCount}/{undian.length} {t("fa.todayDone")}
          </span>
        )}
      </div>

      <div className="grid-2">
        {missions.map((m) => {
          const done = missionLog[m.id] === hariIni;
          return (
            <div key={m.id} className="card mission-card">
              <span className="tag family-tag">
                <Glyph name={m.icon} size={15} /> {t("nav.family")}
              </span>
              <p className="mission-title">{m.title}</p>
              <p className="muted">{m.desc}</p>
              <div className="mission-meta">
                <div>
                  <span className="k">{t("fa.budget")}</span>
                  <span className="v">{m.budget}</span>
                </div>
                <div>
                  <span className="k">{t("fa.duration")}</span>
                  <span className="v">{m.time}</span>
                </div>
                <div>
                  <span className="k">{t("fa.status")}</span>
                  <span className="v">{done ? t("fa.done") : t("fa.running")}</span>
                </div>
              </div>
              <div className="bar">
                <Meter value={done ? 100 : 35} tone="green" />
              </div>
              <span className="reward">{m.reward}</span>
              {done ? (
                <span className="done-label">{t("fa.doneLabel")}</span>
              ) : (
                <button className="btn btn-primary" onClick={() => complete(m)}>
                  {t("fa.complete")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}