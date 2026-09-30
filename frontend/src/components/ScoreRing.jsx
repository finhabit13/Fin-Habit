import { useI18n } from "../lib/i18n";
import useSweep from "../lib/useSweep";

const R = 52;
const TOTAL = 2 * Math.PI * R;

/**
 * Cincin skor. Garis dan angka di tengah dianimasikan dari satu clock
 * (useSweep) supaya tidak pernah tidak sinkron: garis sudah 80% tapi
 * angkanya masih 40% akan terlihat janggal.
 */
export default function ScoreRing({ value, big = false }) {
  const { t } = useI18n();
  const pct = Math.max(0, Math.min(100, value || 0));
  const sweep = useSweep(1150);
  const shown = Math.round(pct * sweep);
  const offset = TOTAL - (TOTAL * shown) / 100;

  return (
    <div className={"ring-wrap" + (big ? " big" : "")}>
      <svg
        className="ring"
        viewBox="0 0 120 120"
        role="img"
        aria-label={t("score.sr", { value: value || 0 })}
      >
        <circle className="ring-bg" cx="60" cy="60" r={R} />
        <circle
          className="ring-fill"
          cx="60"
          cy="60"
          r={R}
          style={{ strokeDasharray: TOTAL, strokeDashoffset: offset }}
        />
      </svg>
      <div className="ring-center">
        <span className="ring-text">
          <span className={"ring-num" + (big ? " big" : "")}>{shown}</span>
          <span className="ring-max">/100</span>
        </span>
      </div>
    </div>
  );
}
