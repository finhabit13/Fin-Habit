import { useEffect, useState } from "react";

import { useApp } from "../context/AppContext";
import Glyph from "../lib/glyphs";
import { useI18n } from "../lib/i18n";
import { dayLabel, rupiah } from "../lib/util";

export default function AdminDashboard() {
  const { user, run, showToast } = useApp();
  const { t, categoryInfo, lang } = useI18n();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    run(async (s) => {
      setStats(await s.adminStats());
      setUsers(await s.adminUsers());
      setExpenses(await s.adminExpenses());
      setLoading(false);
      return null;
    });
  }, []);

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
      if (u.id === user.id) {
        showToast(t("ad.roleChanged"));
      }
    }
  };

  const head = [
    { num: stats?.users ?? 0, lab: t("ad.totalUsers") },
    { num: stats?.expenses ?? 0, lab: t("ad.transactions") },
    { num: stats?.active_today ?? 0, lab: t("ad.activeToday") }
  ];

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
          <h2 className="section-title">{t("ad.avgTitle")}</h2>
          <div className="card admin-stats-card">
            <div className="break-row">
              <div className="break-head">
                <span>{t("ad.avgScore")}</span>
                <b>{stats?.avg_score ?? 0}</b>
              </div>
              <div className="bar">
                <span className="bar-fill" style={{ width: (stats?.avg_score ?? 0) + "%" }} />
              </div>
            </div>
            <div className="break-row">
              <div className="break-head">
                <span>{t("ad.avgPoints")}</span>
                <b>{stats?.avg_points ?? 0}</b>
              </div>
              <div className="bar">
                <span
                  className="bar-fill"
                  style={{ width: Math.min(100, (stats?.avg_points ?? 0)) + "%" }}
                />
              </div>
            </div>
            <div className="break-row">
              <div className="break-head">
                <span>{t("ad.avgStreak")}</span>
                <b>{stats?.avg_streak ?? 0}</b>
              </div>
              <div className="bar">
                <span
                  className="bar-fill"
                  style={{ width: Math.min(100, (stats?.avg_streak ?? 0)) + "%" }}
                />
              </div>
            </div>
            <p className="muted small">
              {t("ad.spent", { value: rupiah(stats?.total_spent ?? 0) })}
            </p>
          </div>
        </section>

        <section className="admin-section">
          <div className="row-between">
            <h2 className="section-title">{t("ad.users")}</h2>
            <span className="small muted">{users.length} {t("ad.totalUsers")}</span>
          </div>
          <div className="card admin-users-table">
            <div className="admin-user-header">
              <span>{t("ad.rank")}</span>
              <span>{t("ad.name")}</span>
              <span>{t("ad.role")}</span>
              <span>{t("ad.points")}</span>
              <span>{t("ad.streak")}</span>
              <span>{t("ad.badges")}</span>
              <span>{t("ad.challenges")}</span>
              <span></span>
            </div>
            {users.map((u, i) => (
              <div key={u.id} className="admin-user-row">
                <span className="leader-rank">{i + 1}</span>
                <span className="admin-user-name">{u.name}</span>
                <span>
                  <span className={"tag" + (u.role === "admin" ? " admin" : "")}>
                    {u.role === "admin" ? t("ad.adminRole") : t("ad.userRole")}
                  </span>
                </span>
                <span>{u.points}</span>
                <span>{u.streak}</span>
                <span>{u.badges?.length ?? 0}</span>
                <span>{u.challengesDone ?? 0}</span>
                <button
                  className="btn btn-outline small-btn"
                  onClick={() => toggleRole(u)}
                  disabled={u.id === user.id}
                >
                  {u.role === "admin" ? t("ad.demote") : t("ad.promote")}
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
              <span>{t("ad.note")}</span>
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
                  <span>{e.note || "-"}</span>
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
        <p className="small muted">FINHABIT Admin Dashboard v1.0</p>
      </footer>
    </div>
  );
}