// Lightweight SVG area+line chart for the 30-day click trend.
// Deterministic from real data (no random, no chart library).

export default function TrendChart({
  data,
  height = 170,
}: {
  data: number[];
  height?: number;
}) {
  const W = 600;
  const H = height;
  const pad = 8;
  const pts = data.length > 0 ? data : [0];
  const max = Math.max(...pts) * 1.15 || 1;

  const x = (i: number) =>
    pts.length === 1 ? W / 2 : pad + (i * (W - 2 * pad)) / (pts.length - 1);
  const y = (val: number) => H - pad - (val / max) * (H - 2 * pad);

  let line = `M ${x(0)} ${y(pts[0])}`;
  for (let i = 1; i < pts.length; i++) line += ` L ${x(i)} ${y(pts[i])}`;
  const area = `${line} L ${x(pts.length - 1)} ${H - pad} L ${x(0)} ${
    H - pad
  } Z`;

  const gridLines = [1, 2, 3].map((r) => pad + (r * (H - 2 * pad)) / 4);

  return (
    <div className="relative" style={{ height: H }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block h-full w-full overflow-visible"
        role="img"
        aria-label="Clicks over the last 30 days"
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2DD4BF" stopOpacity="0.32" />
            <stop offset="1" stopColor="#2DD4BF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="#272430" strokeWidth="1">
          {gridLines.map((gy, i) => (
            <line key={i} x1="0" y1={gy} x2={W} y2={gy} />
          ))}
        </g>
        <path d={area} fill="url(#trend-fill)" />
        <path
          d={line}
          fill="none"
          stroke="#2DD4BF"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
