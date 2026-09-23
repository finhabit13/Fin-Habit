import Glyph from "../lib/glyphs";
import BackLink from "../components/BackLink";
import { useApp } from "../context/AppContext";
import { MISSIONS } from "../lib/data";

export default function Family() {
  const { user, run, showSuccess } = useApp();
  if (!user) return null;

  const doneIds = new Set(user.doneMissions || []);

  const complete = async (m) => {
    if (doneIds.has(m.id)) return;
    const res = await run((s) => s.completeMission(m.id));
    if (!res.ok || res.data.already) return;
    showSuccess("Misi keluarga selesai!", "+" + m.pts + " poin");
  };

  return (
    <>
      <BackLink />
      <h1 className="page-title">Family Mission</h1>
      <p className="muted">Misi yang dikerjakan bersama keluarga di rumah.</p>

      <div className="grid-2">
        {MISSIONS.map((m) => {
          const done = doneIds.has(m.id);
          return (
            <div key={m.id} className="card mission-card">
              <span className="tag family-tag">
                <Glyph name={m.icon} size={15} /> Family
              </span>
              <p className="mission-title">{m.title}</p>
              <p className="muted">{m.desc}</p>
              <div className="mission-meta">
                <div>
                  <span className="k">Budget</span>
                  <span className="v">{m.budget}</span>
                </div>
                <div>
                  <span className="k">Durasi</span>
                  <span className="v">{m.time}</span>
                </div>
                <div>
                  <span className="k">Status</span>
                  <span className="v">{done ? "Selesai" : "Berjalan"}</span>
                </div>
              </div>
              <div className="bar">
                <span className="bar-fill green" style={{ width: (done ? 100 : 35) + "%" }} />
              </div>
              <span className="reward">{m.reward}</span>
              {done ? (
                <span className="done-label">Misi selesai ✓</span>
              ) : (
                <button className="btn btn-primary" onClick={() => complete(m)}>
                  Complete Mission
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}