import Glyph from "../lib/glyphs";
import { useApp } from "../context/AppContext";
import { BADGES } from "../lib/data";
import { levelName } from "../lib/util";

export default function Profile() {
  const { user, demo, run, logout, showToast } = useApp();
  if (!user) return null;

  const reset = async () => {
    if (!confirm("Kembalikan semua data ke kondisi awal?")) return;
    const res = await run((s) => s.reset());
    if (res.ok) showToast("Data dikembalikan");
  };

  const owned = new Set(user.badges || []);
  const initial = user.name.trim().charAt(0).toUpperCase();

  return (
    <>
      <h1 className="page-title">Profile</h1>

      <div className="card profile-card">
        <div className="avatar-big">{initial}</div>
        <div>
          <p className="profile-name">{user.name}</p>
          <p className="muted small">{levelName(user.points)}</p>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-num">{user.streak}</span>
          <span className="stat-lab">Streak</span>
        </div>
        <div className="stat">
          <span className="stat-num">{user.challengesDone || 0}</span>
          <span className="stat-lab">Challenge</span>
        </div>
        <div className="stat">
          <span className="stat-num">{user.points}</span>
          <span className="stat-lab">Poin</span>
        </div>
      </div>

      <h3 className="section-title">Badges</h3>
      <div className="badge-grid">
        {BADGES.map((b) => (
          <div key={b.id} className={"badge" + (owned.has(b.id) ? "" : " locked")}>
            <span className="badge-ico">
              <Glyph name={b.icon} size={20} />
            </span>
            {b.name}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card-title">Data</h3>
        <p className="muted small">
          {demo
            ? "Mode demo. Data disimpan di browser ini saja."
            : "Data tersinkron ke backend (MongoDB)."}
        </p>
        <button className="btn btn-outline" onClick={reset}>
          Reset Demo Data
        </button>
        <button className="btn btn-light" onClick={logout}>
          Keluar
        </button>
      </div>
    </>
  );
}