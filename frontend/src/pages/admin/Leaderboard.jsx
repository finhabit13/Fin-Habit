import { useEffect, useState } from "react";

import Avatar from "../../components/Avatar";
import { useApp } from "../../context/AppContext";
import Glyph from "../../lib/glyphs";
import { useI18n } from "../../lib/i18n";

const MEDALS = { 0: "gold", 1: "silver", 2: "bronze" };

/** Papan peringkat dengan badge ban. */
export default function Leaderboard() {
  const { run } = useApp();
  const { t } = useI18n();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    run(async (s) => {
      const r = await Promise.allSettled([s.adminLeaderboard()]);
      setBoard(r[0].status === "fulfilled" ? r[0].value || [] : []);
      setLoading(false);
      return null;
    });
  }, []);

  return (
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
                  <Avatar user={b} size="sm" />
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
            <p className="muted small">{loading ? t("common.loading") : t("ad.emptyChart")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
