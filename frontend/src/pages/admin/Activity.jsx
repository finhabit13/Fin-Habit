import { useEffect, useState } from "react";

import { useApp } from "../../context/AppContext";
import Glyph from "../../lib/glyphs";
import { useI18n } from "../../lib/i18n";
import { dayLabel, rupiah } from "../../lib/util";

/** Catatan pengeluaran seluruh user (agregat, tanpa note pribadi). */
export default function Activity() {
  const { run } = useApp();
  const { t, categoryInfo, lang } = useI18n();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    run(async (s) => {
      const r = await Promise.allSettled([s.adminExpenses()]);
      setExpenses(r[0].status === "fulfilled" ? r[0].value || [] : []);
      setLoading(false);
      return null;
    });
  }, []);

  return (
    <section className="admin-section">
      <h2 className="section-title">{t("ad.activity")}</h2>
      <div className="card admin-expenses-table">
        <div className="admin-expense-header">
          <span>{t("ad.date")}</span>
          <span>{t("ad.category")}</span>
          <span>{t("ad.user")}</span>
          <span className="right">{t("ad.amount")}</span>
        </div>

        {loading && <p className="muted small empty-state">{t("common.loading")}</p>}

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

        {!loading && expenses.length === 0 && (
          <div className="empty-state">
            <p className="muted small">{t("ad.emptyActivity")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
