export default function ScoreRing({ value, big = false }) {
  const total = 2 * Math.PI * 52;
  const pct = Math.max(0, Math.min(100, value || 0));
  const offset = total - (total * pct) / 100;

  return (
    <div className={"ring-wrap" + (big ? " big" : "")}>
      <svg
        className="ring"
        viewBox="0 0 120 120"
        role="img"
        aria-label={"Skor " + (value || 0) + " dari 100"}
      >
        <circle className="ring-bg" cx="60" cy="60" r="52" />
        <circle
          className="ring-fill"
          cx="60"
          cy="60"
          r="52"
          style={{ strokeDasharray: total, strokeDashoffset: offset }}
        />
      </svg>
      <div className="ring-center">
        <span className="ring-text">
          <span className={"ring-num" + (big ? " big" : "")}>{value}</span>
          <span className="ring-max">/100</span>
        </span>
      </div>
    </div>
  );
}