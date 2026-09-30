import { useEffect, useState } from "react";

import Avatar from "../../components/Avatar";
import { useApp } from "../../context/AppContext";
import Glyph from "../../lib/glyphs";
import { useI18n } from "../../lib/i18n";
import { dayLabel } from "../../lib/util";

const MEDALS = { 0: "gold", 1: "silver", 2: "bronze" };

/**
 * Papan peringkat admin. Avatar dibaca dari avatar_url, jadi user yang sudah
 * pasang foto kelihatan, bukan cuma inisial.
 */
export default function Leaderboard() {
  const { run } = useApp();
  const { t, lang } = useI18n();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    run(async (s) => {
      const r = await Promise.allSettled([s.adminLeaderboard()]);
      if (alive) {
        setBoard(r[0].status === "fulfilled" ? r[0].value || [] : []);
        setLoading(false);
      }
      return null;
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="admin-section">
      <div className="row-between">
        <h2 className="section-title">{t("ad.leaderboard")}</h2>
        <span className="small muted">{board.length}</span>
      </div>

      <div className="card admin-board-card">
        {board.length ? (
          <div className="leader-list">
            {board.map((b, i) => (
              <div key={b.id} className={"leader-row leader-row-admin" + (b.banned ? " is-banned" : "")}>
                <span className={"leader-rank " + (MEDALS[i] || "")}>
                  {MEDALS[i] ? <Glyph name="medal" size={16} /> : b.rank}
                </span>

                <Avatar user={b} size="md" />

                <span className="leader-identity">
                  <span className="leader-name">
                    {b.name}
                    {b.role === "admin" && <span className="tag admin">{t("ad.adminRole")}</span>}
                    {b.banned && <span className="tag banned">{t("ad.banned")}</span>}
                  </span>
                  <span className="leader-sub">
                    <span className="leader-pill">{t("lb.streak", { n: b.streak })}</span>
                    <span className="muted small">
                      {b.challengesDone || 0} {t("ad.challengesDoneShort")}
                    </span>
                    {b.lastActiveDay && (
                      <span className="muted small">
                        {t("ad.lastActive")}: {dayLabel(b.lastActiveDay, lang)}
                      </span>
                    )}
                  </span>
                </span>

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
