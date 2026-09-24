import { useEffect, useState } from "react";

import { useApp } from "../context/AppContext";
import Glyph from "../lib/glyphs";
import { useI18n } from "../lib/i18n";
import { dayLabel, rupiah } from "../lib/util";

const MEDALS = { 0: "gold", 1: "silver", 2: "bronze" };

export default function AdminDashboard() {
  const { user, run, showToast } = useApp();
  const { t, categoryInfo, content, lang } = useI18n();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    run(async (s) => {
      setStats(await s.adminStats());
      setUsers(await s.adminUsers());
      setExpenses(await s.adminExpenses());
      const b = await s.adminLeaderboard();
      setBoard(b || []);
      setLoading(false);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!detailId) return;
    setProfile(null);
    run(async (s) => {
      const p = await s.adminProfile({ id: detailId });
      setProfile(p || null);
      return null;
    });
  }, [detailId]);

  const openDetail = (id) => setDetailId(id);
  const closeDetail = () => setDetailId(null);

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-forbidden">
        <Glyph name="shield" size={48} />
        <h1>{t("ad.forbidden")}</h1>
        <p className="muted">{t("ad.forbiddenDesc")}</p>
      </div>
    );
  }

  const toggleRole = async (u) => {
    const next = u.role === "admin" ? "user" : "admin";
    const key = next === "admin" ? "ad.confirmPromote" : "ad.confirmDemote";
    if (!confirm(t(key, { name: u.name }))) return;
    const res = await run((s) => s.adminSetRole({ id: u.id, role: next }));
    if (res.ok) {
      setUsers(users.map((x) => (x.id === u.id ? { ...x, role: next } : x)));
      setBoard(board.map((x) => (x.id === u.id ? { ...x, role: next } : x)));
      if (u.id === user.id) {
        showToast(t("ad.roleChanged"));
      }
    }
  };

  const toggleBan = async (u) => {
    const next = !u.banned;
    const key = next ? "ad.confirmBan" : "ad.confirmUnban";
    if (!confirm(t(key, { name: u.name }))) return;
    const res = await run((s) => s.adminSetBanned({ id: u.id, banned: next }));
    if (res.ok) {
      setUsers(users.map((x) => (x.id === u.id ? { ...x, banned: next } : x)));
      setBoard(board.map((x) => (x.id === u.id ? { ...x, banned: next } : x)));
      showToast(next ? t("ad.banned") : t("ad.unban"));
    }
  };

  const head = [
    { num: stats?.users ?? 0, lab: t("ad.totalUsers") },
    { num: stats?.expenses ?? 0, lab: t("ad.transactions") },
    { num: stats?.active_today ?? 0, lab: t("ad.activeToday") }
  ];

  const p = profile;
  const maxCat = Math.max(1, ...(p?.spendByCat || []).map((c) => c.total));

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-brand">
          <span className="brand-mark">₣</span>
          <div>
            <h1 className="admin-title">FINHABIT Admin</h1>
            <p className="admin-subtitle">{t("ad.subtitle")}</p>
          </div>
        </div>
        <div className="admin-user-info">
          <span className="admin-badge">Admin</span>
          <button className="avatar" onClick={() => window.location.href = "/"}>
            {(user?.name || "A").trim().charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-section">
          <h2 className="section-title">{t("ad.overview")}</h2>
          <div className="stat-row">
            {head.map((h) => (
              <div key={h.lab} className="stat">
                <span className="stat-num">{h.num}</span>
                <span className="stat-lab">{h.lab}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <h2 className="section-title">{t("ad.leaderboard")}</h2>
          <div className="card admin-board-card">
            {board.length ? (
              <div className="leader-list">
                {board.map((b, i) => (
                  <div key={b.id} className={"leader-row" + (b.banned ? " is-banned" : "")}>
                    <span className={"leader-rank " + (MEDALS[i] || "")}>
                      {MEDALS[i] ? <Glyph name="medal" size={16} /> : b.rank}
                    </span>
                    <span className="leader-name">
                      {b.name}
                      {b.banned && <span className="tag banned">{t("ad.banned")}</span>}
                    </span>
                    <span className="leader-pill">{t("lb.streak", { n: b.streak })}</span>
                    <b className="leader-pts">
                      {b.points} {t("common.points")}
                    </b>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="muted small">{t("ad.emptyChart")}</p>
              </div>
            )}
          </div>
        </section>

        <section className="admin-section">
          <div className="row-between">
            <h2 className="section-title">{t("ad.users")}</h2>
            <span className="small muted">{users.length} {t("ad.totalUsers")}</span>
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
            {users.map((u, i) => (
              <div key={u.id} className={"admin-user-row admin-user-row-ext" + (u.banned ? " banned" : "")}>
                <span className="leader-rank">{i + 1}</span>
                <span className="admin-user-name">
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
                <button className="btn btn-outline small-btn" onClick={() => openDetail(u.id)}>
                  {t("ad.detail")}
                </button>
                <button
                  className="btn btn-outline small-btn"
                  onClick={() => toggleRole(u)}
                  disabled={u.id === user.id}
                >
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

        <section className="admin-section">
          <h2 className="section-title">{t("ad.activity")}</h2>
          <div className="card admin-expenses-table">
            <div className="admin-expense-header">
              <span>{t("ad.date")}</span>
              <span>{t("ad.category")}</span>
              <span>{t("ad.user")}</span>
              <span className="right">{t("ad.amount")}</span>
            </div>
            {expenses.map((e) => {
              const cat = categoryInfo(e.category);
              return (
                <div key={e.id} className="admin-expense-row">
                  <span>{dayLabel(e.date, lang)}</span>
                  <span className="admin-expense-cat">
                    <Glyph name={cat.icon} size={16} />
                    {cat.label}
                  </span>
                  <span className="small">{e.userId?.slice(0, 8)}...</span>
                  <span className="right exp-amount-nowrap">-{rupiah(e.amount)}</span>
                </div>
              );
            })}
            {expenses.length === 0 && (
              <div className="empty-state">
                <p className="muted small">{t("ad.emptyActivity")}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="admin-footer">
        <p className="small muted">FINHABIT Admin Dashboard v1.1</p>
      </footer>

      {detailId && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeDetail()}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-label={t("ad.profileDetail")}>
            <button className="modal-close" onClick={closeDetail} aria-label={t("common.close")}>
              ✕
            </button>
            <h2 className="modal-title">{t("ad.profileDetail")}</h2>

            {!p ? (
              <p className="muted">{t("common.loading")}</p>
            ) : (
              <>
                <div className="admin-profile-head">
                  <span className="avatar-big">{(p?.name || "A").trim().charAt(0).toUpperCase()}</span>
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
                    <span className="stat-lab">{t("ad.savingProgress")} · {rupiah(p.savingGoal)}</span>
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
      )}
    </div>
  );
}