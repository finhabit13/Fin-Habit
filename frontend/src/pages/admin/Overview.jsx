import { useEffect, useState } from "react";

import Avatar from "../../components/Avatar";
import { BarChart, DonutChart, LineChart, RadarChart } from "../../components/charts";
import { useApp } from "../../context/AppContext";
import Glyph from "../../lib/glyphs";
import { useI18n } from "../../lib/i18n";
import { rupiah } from "../../lib/util";

const SCORE_COLORS = { starter: "#dc2626", steady: "#d97706", smart: "#2563eb", master: "#12a37b" };

/** Ringkasan cohort dengan chart: tren pengeluaran, sebaran skor, radar skill. */
export default function Overview() {
  const { run } = useApp();
  const { t, content } = useI18n();
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    run(async (s) => {
      const settled = await Promise.allSettled([s.adminOverview(), s.adminStats()]);
      const ov = settled[0].status === "fulfilled" ? settled[0].value : null;
      const st = settled[1].status === "fulfilled" ? settled[1].value : null;
      if (alive) {
        setD(ov || st);
        setLoading(false);
      }
      return null;
    });
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <p className="muted">{t("common.loading")}</p>;
  if (!d) return <p className="muted">{t("ad.emptyChart")}</p>;

  const head = [
    { num: d.users ?? 0, lab: t("ad.totalUsers") },
    { num: d.active_today ?? 0, lab: t("ad.activeToday") },
    { num: d.avg_streak != null ? Math.round(Number(d.avg_streak)) : 0, lab: t("ad.avgStreak") },
    { num: d.avg_score != null ? Math.round(Number(d.avg_score)) : "-", lab: t("ad.avgScore") }
  ];

  const daily = (d.daily_expenses || []).map((x) => ({ ...x, total: Number(x.total) || 0 }));

  const scoreBands = d.score_bands
    ? ["starter", "steady", "smart", "master"].map((k) => ({
        label: t("ad.band2." + k),
        value: d.score_bands[k] || 0,
        color: SCORE_COLORS[k]
      }))
    : [];

  const radar = content.DIM_LABELS
    ? Object.keys(content.DIM_LABELS).map((k) => ({
        label: content.DIM_LABELS[k],
        value: d.dim_avg?.[k] ?? 0
      }))
    : [];

  const pointBands = d.points_bands
    ? [
        ["0_99", "#dc2626"],
        ["100_299", "#d97706"],
        ["300_599", "#2563eb"],
        ["600_1199", "#12a37b"],
        ["1200plus", "#0e2a47"]
      ].map(([k, color]) => ({ label: k, value: d.points_bands[k] || 0, color }))
    : [];

  const top = d.top_users || [];

  return (
    <>
      <section className="admin-section">
        <h2 className="section-title">{t("ad.overview")}</h2>
        <div className="stat-row">
          {head.map((h, i) => (
            <div key={h.lab} className="stat rise" style={{ "--d": `${i * 60}ms` }}>
              <span className="stat-num">{h.num}</span>
              <span className="stat-lab">{h.lab}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="row-between">
          <h2 className="section-title">{t("ad.spendTrend")}</h2>
          {d.spent_7d != null && (
            <span className="pill">
              7d: {rupiah(d.spent_7d)} · {d.expenses_7d ?? 0}×
            </span>
          )}
        </div>
        <div className="card admin-chart-card">
          <LineChart data={daily} />
        </div>
      </section>

      <section className="admin-section admin-two-col">
        <div className="card admin-chart-card">
          <h3 className="admin-detail-title">{t("ad.scoreBands")}</h3>
          <DonutChart
            data={scoreBands}
            centerValue={d.literacy_good ?? 0}
            centerLabel={t("ad.literacyGood")}
          />
        </div>

        <div className="card admin-chart-card">
          <h3 className="admin-detail-title">{t("ad.skillRadar")}</h3>
          <RadarChart data={radar} />
        </div>
      </section>

      {pointBands.length > 0 && (
        <section className="admin-section">
          <h2 className="section-title">{t("ad.pointsSpread")}</h2>
          <div className="card admin-chart-card">
            <BarChart data={pointBands} />
          </div>
        </section>
      )}

      <section className="admin-section admin-two-col">
        <div className="card admin-chart-card">
          <h3 className="admin-detail-title">{t("ad.topUsers")}</h3>
          {top.length ? (
            <ol className="top-user-list">
              {top.map((u, i) => (
                <li key={u.id} className="rise" style={{ "--d": `${Math.min(i, 8) * 45}ms` }}>
                  <span className={"leader-rank " + (i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "")}>
                    {i < 3 ? <Glyph name="medal" size={15} /> : i + 1}
                  </span>
                  <Avatar user={{ name: u.name, avatarUrl: u.avatar_url }} size="sm" />
                  <span className="top-user-name">{u.name}</span>
                  <span className="muted small">{t("lb.streak", { n: u.streak })}</span>
                  <b>{u.points}</b>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted small">{t("ad.emptyChart")}</p>
          )}
        </div>

        {d.total_spent != null && (
          <div className="card admin-chart-card">
            <h3 className="admin-detail-title">{t("ad.finance")}</h3>
            <div className="finance-list">
              <div className="finance-row">
                <span className="muted">{t("ad.totalSpent")}</span>
                <b>{rupiah(d.total_spent)}</b>
              </div>
              <div className="finance-row">
                <span className="muted">{t("ad.transactions")}</span>
                <b>{d.total_expenses ?? 0}</b>
              </div>
              <div className="finance-row">
                <span className="muted">{t("ad.savingTotal")}</span>
                <b>
                  {rupiah(d.saving_total)} / {rupiah(d.saving_goal_total)}
                </b>
              </div>
              <div className="finance-row">
                <span className="muted">{t("ad.withAvatar")}</span>
                <b>
                  {d.with_avatar ?? 0} / {d.users ?? 0}
                </b>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
