import { useEffect, useState } from "react";

import mascotUrl from "../assets/mascot.png";
import { useApp } from "../context/AppContext";
import Glyph from "../lib/glyphs";
import { useI18n } from "../lib/i18n";
import { dayLabel, rupiah } from "../lib/util";

export default function Admin() {
  const { user, run, showToast } = useApp();
  const { t, categoryInfo, lang } = useI18n();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    run(async (s) => {
      setStats(await s.adminStats());
      setUsers(await s.adminUsers());
      setExpenses(await s.adminExpenses());
      return null;
    });
  }, []);

  if (!user) return null;
  if (user.role !== "admin") {
    return (
      <>
        <h1 className="page-title">{t("nav.admin")}</h1>
        <div className="card">
          <p className="muted small">{t("ad.forbidden")}</p>
        </div>
      </>
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
    <>
      <h1 className="page-title">{t("ad.title")}</h1>

      <div className="stat-row">
        {head.map((h) => (
          <div key={h.lab} className="stat">
            <span className="stat-num">{h.num}</span>
            <span className="stat-lab">{h.lab}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card-title">{t("ad.avgTitle")}</h3>
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

      <h3 className="section-title">{t("ad.users")}</h3>
      <div className="card">
        {users.map((u, i) => (
          <div key={u.id} className="admin-user">
            <span className="leader-rank">{i + 1}</span>
            <div className="admin-user-main">
              <p className="admin-user-name">
                {u.name}
                {u.role === "admin" && <span className="tag admin-tag">admin</span>}
              </p>
              <p className="muted small">
                {t("ad.userLine", {
                  points: u.points,
                  streak: u.streak,
                  badges: u.badges.length,
                  done: u.challengesDone
                })}
              </p>
            </div>
            <button
              className="btn btn-outline"
              onClick={() => toggleRole(u)}
              disabled={u.id === user.id}
            >
              {u.role === "admin" ? t("ad.demote") : t("ad.promote")}
            </button>
          </div>
        ))}
      </div>

      <h3 className="section-title">{t("ad.activity")}</h3>
      <div className="card">
        {expenses.map((e) => {
          const cat = categoryInfo(e.category);
          return (
            <div key={e.id} className="expense-item">
              <span className="exp-ico">
                <Glyph name={cat.icon} size={18} />
              </span>
              <div className="exp-body">
                <p className="exp-title">{cat.label}</p>
                <p className="exp-note">
                  {dayLabel(e.date, lang)} {e.note ? "· " + e.note : ""}
                </p>
              </div>
              <span className="exp-amount-nowrap">-{rupiah(e.amount)}</span>
            </div>
          );
        })}
        {expenses.length === 0 && (
          <div className="empty-state">
            <img className="mascot-empty" src={mascotUrl} alt={t("auth.mascotAlt")} />
            <p className="muted small">{t("ad.emptyActivity")}</p>
          </div>
        )}
      </div>
    </>
  );
}