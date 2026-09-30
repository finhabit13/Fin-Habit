import { useEffect, useState } from "react";

import { useApp } from "../../context/AppContext";
import { useI18n } from "../../lib/i18n";
import { rupiah } from "../../lib/util";

/** Ringkasan cohort: jumlah user, aktivitas, dan sebaran skor. */
export default function AdminOverview() {
  const { run } = useApp();
  const { t } = useI18n();
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    run(async (s) => {
      const settled = await Promise.allSettled([s.adminOverview(), s.adminStats()]);
      const ov = settled[0].status === "fulfilled" ? settled[0].value : null;
      const st = settled[1].status === "fulfilled" ? settled[1].value : null;
      setD(ov || st);
      setLoading(false);
      return null;
    });
  }, []);

  if (loading) return <p className="muted">{t("common.loading")}</p>;
  if (!d) return <p className="muted">{t("ad.emptyChart")}</p>;

  const head = [
    { num: d.users ?? 0, lab: t("ad.totalUsers") },
    { num: d.active_today ?? 0, lab: t("ad.activeToday") },
    { num: d.challenges ?? 0, lab: t("ad.challenges") },
    { num: d.avg_points != null ? Math.round(Number(d.avg_points)) : "-", lab: t("ad.avgPoints") }
  ];

  const bands = d.points_bands
    ? Object.entries(d.points_bands).map(([k, v]) => ({ k, v }))
    : [];
  const bandMax = Math.max(1, ...bands.map((b) => Number(b.v) || 0));

  return (
    <>
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

      {d.total_spent != null && (
        <section className="admin-section">
          <h2 className="section-title">{t("ad.finance")}</h2>
          <div className="stat-row">
            <div className="stat">
              <span className="stat-num">{rupiah(d.total_spent)}</span>
              <span className="stat-lab">{t("ad.totalSpent")}</span>
            </div>
            <div className="stat">
              <span className="stat-num">{d.total_expenses ?? 0}</span>
              <span className="stat-lab">{t("ad.transactions")}</span>
            </div>
            <div className="stat">
              <span className="stat-num">{d.with_avatar ?? 0}</span>
              <span className="stat-lab">{t("ad.withAvatar")}</span>
            </div>
          </div>
        </section>
      )}

      {bands.length > 0 && (
        <section className="admin-section">
          <h2 className="section-title">{t("ad.pointsSpread")}</h2>
          <div className="card admin-detail-card">
            {bands.map((b) => (
              <div key={b.k} className="break-row">
                <div className="break-head">
                  <span>{t("ad.band." + b.k)}</span>
                  <b>{b.v}</b>
                </div>
                <div className="bar">
                  <span className="bar-fill" style={{ width: Math.round((Number(b.v) / bandMax) * 100) + "%" }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
