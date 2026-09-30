/**
 * Chart SVG ringan, tanpa library tambahan. Data dari RPC admin_overview():
 * dim_avg (5 dimensi), score_bands, points_bands, daily_expenses.
 */

const PALETTE = ["#2563eb", "#12a37b", "#d97706", "#dc2626", "#0e2a47"];

const nf = (n) => Number(n || 0).toLocaleString("id-ID");

/** Donut untuk sebaran kategori. Dipakai untuk score_bands. */
export function DonutChart({ data, size = 168, thickness = 26, centerLabel, centerValue }) {
  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0);

  if (!total) {
    return <div className="chart-empty">Belum ada data</div>;
  }

  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
        <circle cx={c} cy={c} r={r} fill="none" stroke="#e2e8f2" strokeWidth={thickness} />
        {data.map((d, i) => {
          const frac = (Number(d.value) || 0) / total;
          const len = frac * circ;
          const el = (
            <circle
              key={d.label}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={d.color || PALETTE[i % PALETTE.length]}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${c} ${c})`}
            />
          );
          offset += len;
          return el;
        })}
        {centerValue != null && (
          <>
            <text x={c} y={c - 2} textAnchor="middle" className="donut-value">
              {nf(centerValue)}
            </text>
            <text x={c} y={c + 16} textAnchor="middle" className="donut-label">
              {centerLabel}
            </text>
          </>
        )}
      </svg>
      <ul className="chart-legend">
        {data.map((d, i) => (
          <li key={d.label}>
            <span className="dot" style={{ background: d.color || PALETTE[i % PALETTE.length] }} />
            <span className="legend-label">{d.label}</span>
            <b>{nf(d.value)}</b>
            <span className="muted small">{Math.round(((Number(d.value) || 0) / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Garis tren untuk 14 hari terakhir. */
export function LineChart({ data, height = 190, labelKey = "d", valueKey = "total", format = nf }) {
  if (!data || data.length === 0) return <div className="chart-empty">Belum ada data</div>;

  const w = 560;
  const h = height;
  const pad = { t: 14, r: 12, b: 26, l: 46 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;

  const values = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(...values, 1);

  const x = (i) => pad.l + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v) => pad.t + ih - (v / max) * ih;

  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(values.length - 1).toFixed(1)},${(pad.t + ih).toFixed(1)} L${x(0).toFixed(1)},${(
    pad.t + ih
  ).toFixed(1)} Z`;

  const ticks = [0, 0.5, 1];

  return (
    <svg className="line-chart" viewBox={`0 0 ${w} ${h}`} role="img" preserveAspectRatio="xMidYMid meet">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={y(max * t)} y2={y(max * t)} stroke="#e2e8f2" strokeWidth="1" />
          <text x={pad.l - 8} y={y(max * t) + 4} textAnchor="end" className="axis-label">
            {format(Math.round(max * t))}
          </text>
        </g>
      ))}

      <path d={area} fill="rgba(37, 99, 235, 0.1)" />
      <path d={line} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="#fff" stroke="#2563eb" strokeWidth="2">
          <title>{`${data[i][labelKey]}: ${format(v)}`}</title>
        </circle>
      ))}

      {data.map((d, i) =>
        i % 3 === 0 || i === data.length - 1 ? (
          <text key={i} x={x(i)} y={h - 8} textAnchor="middle" className="axis-label">
            {String(d[labelKey]).slice(5)}
          </text>
        ) : null
      )}
    </svg>
  );
}

/** Radar untuk 5 dimensi kemampuan — paling pas untuk data skill. */
export function RadarChart({ data, size = 240, max = 100 }) {
  if (!data || data.length === 0) return <div className="chart-empty">Belum ada data</div>;

  const c = size / 2;
  const r = size / 2 - 34;
  const n = data.length;
  const step = (Math.PI * 2) / n;

  const pt = (i, frac) => {
    const a = i * step - Math.PI / 2;
    return [c + Math.cos(a) * r * frac, c + Math.sin(a) * r * frac];
  };

  const poly = data.map((d, i) => pt(i, Math.min(1, (Number(d.value) || 0) / max)).map((v) => v.toFixed(1)).join(",")).join(" ");

  return (
    <div className="radar-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon
            key={f}
            points={data.map((_, i) => pt(i, f).map((v) => v.toFixed(1)).join(",")).join(" ")}
            fill="none"
            stroke="#e2e8f2"
            strokeWidth="1"
          />
        ))}
        {data.map((_, i) => {
          const [x, y] = pt(i, 1);
          return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#eef2f8" strokeWidth="1" />;
        })}

        <polygon points={poly} fill="rgba(37, 99, 235, 0.18)" stroke="#2563eb" strokeWidth="2" />
        {data.map((d, i) => {
          const [x, y] = pt(i, Math.min(1, (Number(d.value) || 0) / max));
          return <circle key={d.label} cx={x} cy={y} r="3" fill="#2563eb" />;
        })}

        {data.map((d, i) => {
          const [x, y] = pt(i, 1.19);
          const anchor = Math.abs(x - c) < 6 ? "middle" : x > c ? "start" : "end";
          return (
            <text key={d.label} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" className="radar-label">
              {d.label}
            </text>
          );
        })}
      </svg>

      <ul className="radar-values">
        {data.map((d) => (
          <li key={d.label}>
            <span className="muted">{d.label}</span>
            <b>{Math.round(Number(d.value) || 0)}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Batang vertikal, untuk sebaran poin. */
export function BarChart({ data, height = 170, format = nf }) {
  if (!data || data.length === 0) return <div className="chart-empty">Belum ada data</div>;

  const max = Math.max(...data.map((d) => Number(d.value) || 0), 1);

  return (
    <div className="bar-chart" style={{ "--bar-max": max }}>
      {data.map((d, i) => (
        <div key={d.label} className="bar-chart-col">
          <span className="bar-chart-value">{format(d.value)}</span>
          <div className="bar-chart-track">
            <div
              className="bar-chart-fill"
              style={{ height: Math.max(3, ((Number(d.value) || 0) / max) * 100) + "%", background: d.color }}
            />
          </div>
          <span className="bar-chart-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
