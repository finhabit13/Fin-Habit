import { useEffect, useState } from "react";

import Avatar from "../../components/Avatar";
import { useApp } from "../../context/AppContext";
import Glyph from "../../lib/glyphs";
import { useI18n } from "../../lib/i18n";
import { dayLabel, rupiah } from "../../lib/util";

/** Tabel user: role, ban, dan pintu masuk ke detail. */
export default function Users() {
  const { user, run, showToast } = useApp();
  const { t } = useI18n();
  const [users, setUsers] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () =>
    run(async (s) => {
      const r = await Promise.allSettled([s.adminUsers(), s.adminLeaderboard()]);
      setUsers(r[0].status === "fulfilled" ? r[0].value || [] : []);
      setLoading(false);
      return null;
    });

  useEffect(() => {
    load();
  }, []);

  const toggleRole = async (u) => {
    const next = u.role === "admin" ? "user" : "admin";
    const key = next === "admin" ? "ad.confirmPromote" : "ad.confirmDemote";
    if (!confirm(t(key, { name: u.name }))) return;
    const res = await run((s) => s.adminSetRole({ id: u.id, role: next }));
    if (res.ok) {
      setUsers(users.map((x) => (x.id === u.id ? { ...x, role: next } : x)));
      if (u.id === user.id) showToast(t("ad.roleChanged"));
    }
  };

  const toggleBan = async (u) => {
    const next = !u.banned;
    if (!confirm(t(next ? "ad.confirmBan" : "ad.confirmUnban", { name: u.name }))) return;
    const res = await run((s) => s.adminSetBanned({ id: u.id, banned: next }));
    if (res.ok) {
      setUsers(users.map((x) => (x.id === u.id ? { ...x, banned: next } : x)));
      showToast(next ? t("ad.banned") : t("ad.unban"));
    }
  };

  return (
    <>
      <section className="admin-section">
        <div className="row-between">
          <h2 className="section-title">{t("ad.users")}</h2>
          <span className="small muted">
            {users.length} {t("ad.totalUsers")}
          </span>
        </div>

        <div className="card admin-users-table">
          <div className="admin-user-header admin-user-header-ext">
            <span>{t("ad.rank")}</span>
            <span>{t("ad.name")}</span>
            <span>{t("ad.role")}</span>
            <span>{t("ad.points")}</span>
            <span>{t("ad.streak")}</span>
            <span>{t("ad.badges")}</span>
            <span>{t("ad.challenges")}</span>
            <span>{t("ad.detail")}</span>
            <span></span>
            <span></span>
          </div>

          {loading && <p className="muted small empty-state">{t("common.loading")}</p>}

          {users.map((u, i) => (
            <div key={u.id} className={"admin-user-row admin-user-row-ext" + (u.banned ? " banned" : "")}>
              <span className="leader-rank">{i + 1}</span>
              <span className="admin-user-name">
                <Avatar user={u} size="sm" />
                {u.name}
                {u.banned && <span className="tag banned">{t("ad.banned")}</span>}
              </span>
              <span>
                <span className={"tag" + (u.role === "admin" ? " admin" : "")}>
                  {u.role === "admin" ? t("ad.adminRole") : t("ad.userRole")}
                </span>
              </span>
              <span>{u.points}</span>
              <span>{u.streak}</span>
              <span>{u.badges?.length ?? 0}</span>
              <span>{u.challengesDone ?? 0}</span>
              <button className="btn btn-outline small-btn" onClick={() => setDetailId(u.id)}>
                {t("ad.detail")}
              </button>
              <button className="btn btn-outline small-btn" onClick={() => toggleRole(u)} disabled={u.id === user.id}>
                {u.role === "admin" ? t("ad.demote") : t("ad.promote")}
              </button>
              <button
                className={"btn btn-outline small-btn" + (u.banned ? " danger" : "")}
                onClick={() => toggleBan(u)}
                disabled={u.id === user.id}
              >
                {u.banned ? t("ad.unban") : t("ad.ban")}
              </button>
            </div>
          ))}
        </div>
      </section>

      {detailId && <UserDetail id={detailId} onClose={() => setDetailId(null)} />}
    </>
  );
}

function UserDetail({ id, onClose }) {
  const { run } = useApp();
  const { t, categoryInfo, content, lang } = useI18n();
  const [p, setP] = useState(null);

  useEffect(() => {
    let alive = true;
    setP(null);
    run(async (s) => {
      try {
        const x = await s.adminProfile({ id });
        if (alive) setP(x || null);
      } catch {
        if (alive) setP(null);
      }
      return null;
    });
    return () => {
      alive = false;
    };
  }, [id]);

  const maxCat = Math.max(1, ...(p?.spendByCat || []).map((c) => c.total));

  return (
    <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal" role="dialog" aria-modal="true" aria-label={t("ad.profileDetail")}>
        <button className="modal-close" onClick={onClose} aria-label={t("common.close")}>
          ✕
        </button>
        <h2 className="modal-title">{t("ad.profileDetail")}</h2>

        {!p ? (
          <p className="muted">{t("common.loading")}</p>
        ) : (
          <>
            <div className="admin-profile-head">
              <Avatar user={p} size="lg" />
              <div className="admin-profile-meta">
                <p className="admin-profile-name">
                  {p.name}
                  {p.banned && <span className="tag banned">{t("ad.banned")}</span>}
                </p>
                <p className="muted small">
                  <span className={"tag" + (p.role === "admin" ? " admin" : "")}>
                    {p.role === "admin" ? t("ad.adminRole") : t("ad.userRole")}
                  </span>{" "}
                  {t("ad.joined")} {dayLabel(p.createdAt?.slice(0, 10), lang)}
                </p>
                <p className="muted small">
                  {t("ad.lastActive")}: {p.lastActiveDay ? dayLabel(p.lastActiveDay, lang) : "-"}
                </p>
              </div>
            </div>

            <div className="stat-row gain">
              <div className="stat">
                <span className="stat-num">{p.points}</span>
                <span className="stat-lab">{t("ad.points")}</span>
              </div>
              <div className="stat">
                <span className="stat-num">{p.streak}</span>
                <span className="stat-lab">{t("ad.streak")}</span>
              </div>
              <div className="stat">
                <span className="stat-num">{p.challengesDone}</span>
                <span className="stat-lab">{t("ad.challenges")}</span>
              </div>
              <div className="stat">
                <span className="stat-num">{p.badges?.length ?? 0}</span>
                <span className="stat-lab">{t("ad.badges")}</span>
              </div>
            </div>

            <h3 className="admin-detail-title">{t("ad.dims")}</h3>
            <div className="card admin-detail-card">
              {Object.keys(content.DIM_LABELS).map((key) => {
                const v = p.dims[key] || 0;
                return (
                  <div key={key} className="break-row">
                    <div className="break-head">
                      <span>{content.DIM_LABELS[key]}</span>
                      <b>{v}</b>
                    </div>
                    <div className="bar">
                      <span className="bar-fill" style={{ width: Math.min(100, v) + "%" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <h3 className="admin-detail-title">{t("ad.weekly")}</h3>
            <div className="card admin-detail-card">
              <div className="chart">
                {(p.weekly || []).map((v, i) => (
                  <div key={i} className="chart-col">
                    <div className="chart-bar" style={{ height: Math.max(8, Math.min(100, v)) + "%" }} />
                    <span className="chart-lab">{content.DAY_LABELS[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="admin-detail-title">{t("ad.spendByCat")}</h3>
            <div className="card admin-detail-card">
              {p.spendByCat.length ? (
                p.spendByCat.map((c) => {
                  const cat = categoryInfo(c.category);
                  return (
                    <div key={c.category} className="break-row">
                      <div className="break-head">
                        <span>
                          <Glyph name={cat.icon} size={14} /> {cat.label}{" "}
                          <span className="muted small">({c.count}×)</span>
                        </span>
                        <b>{rupiah(c.total)}</b>
                      </div>
                      <div className="bar">
                        <span
                          className="bar-fill amber"
                          style={{ width: Math.max(4, Math.round((c.total / maxCat) * 100)) + "%" }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="muted small">{t("ad.emptyChart")}</p>
              )}
            </div>

            <div className="stat-row gain">
              <div className="stat">
                <span className="stat-num">{rupiah(p.savingCurrent)}</span>
                <span className="stat-lab">
                  {t("ad.savingProgress")} · {rupiah(p.savingGoal)}
                </span>
              </div>
              <div className="stat">
                <span className="stat-num">{rupiah(p.monthlyBudget)}</span>
                <span className="stat-lab">{t("ad.budgetInfo")}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
