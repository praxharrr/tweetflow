interface SparklineProps {
  data: number[];
  className?: string;
}

interface Point {
  x: number;
  y: number;
}

function smoothPath(points: Point[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export default function Sparkline({ data, className }: SparklineProps) {
  if (data.length < 2) return null;

  const nonZeroDays = data.filter((v) => v > 0).length;

  if (nonZeroDays < 2) {
    return (
      <div className={`flex items-center justify-end ${className ?? ""}`}>
        <span className="text-right text-[9px] leading-tight text-mono-ink-faint">
          Not enough
          <br />
          data yet
        </span>
      </div>
    );
  }

  const width = 100;
  const height = 28;
  const pad = 3;
  const max = Math.max(...data);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points: Point[] = data.map((value, i) => ({
    x: i * step,
    y: pad + (height - pad * 2) - ((value - min) / range) * (height - pad * 2),
  }));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <path
        d={smoothPath(points)}
        fill="none"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
