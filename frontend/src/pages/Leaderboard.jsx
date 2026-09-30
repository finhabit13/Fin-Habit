import { useEffect, useState } from "react";

import mascotUrl from "../assets/mascot.png";
import Avatar from "../components/Avatar";
import { useApp } from "../context/AppContext";
import Glyph from "../lib/glyphs";
import { useI18n } from "../lib/i18n";

const MEDALS = { 0: "gold", 1: "silver", 2: "bronze" };

export default function Leaderboard() {
  const { run } = useApp();
  const { t } = useI18n();
  const [rows, setRows] = useState(null);
  const [meId, setMeId] = useState(null);

  useEffect(() => {
    run(async (s) => {
      const data = await s.leaderboard();
      setRows(data.rows || []);
      setMeId(data.meId || null);
      return null;
    });
  }, []);

  const rank = meId ? rankOf(rows, meId) : "-";

  if (!rows) return <p className="muted">{t("lb.loading")}</p>;

  return (
    <>
      <h1 className="page-title">{t("lb.title")}</h1>
      <p className="muted small">{t("lb.sub")}</p>

      <div className="card score-hero leaderboard-hero">
        <p className="score-title center">{t("lb.posTitle")}</p>
        <p className="muted small center">
          {t("lb.myPos", { rank, total: rows.length })}
        </p>
      </div>

      <div className="leader-list">
        {rows.map((r, i) => {
          const isMe = r.id === meId;
          return (
            <div
              key={r.id}
              className={"leader-row leader-row-full rise" + (isMe ? " is-me" : "")}
              style={{ "--d": `${Math.min(i, 10) * 40}ms` }}
            >
              <span className={"leader-rank " + (MEDALS[i] || "")}>
                {MEDALS[i] ? <Glyph name="medal" size={16} /> : i + 1}
              </span>
              <Avatar user={r} size="md" />
              <span className="leader-identity">
                <span className="leader-name">
                  {r.name}
                  {isMe && <span className="tag tag-anim">{t("lb.you")}</span>}
                </span>
                <span className="leader-sub">
                  <span className="leader-pill">{t("lb.streak", { n: r.streak })}</span>
                  <span className="muted small">
                    {r.challengesDone || 0} {t("ad.challengesDoneShort")}
                  </span>
                </span>
              </span>
              <b className="leader-pts">
                {r.points} {t("common.points")}
              </b>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div className="card empty-state">
            <img className="mascot-empty" src={mascotUrl} alt={t("auth.mascotAlt")} />
            <p className="muted small">{t("lb.empty")}</p>
          </div>
        )}
      </div>
    </>
  );
}

function rankOf(rows, myId) {
  const idx = rows.findIndex((r) => r.id === myId);
  return idx < 0 ? "-" : idx + 1;
}