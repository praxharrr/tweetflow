interface CharRingProps {
  count: number;
  max: number;
  size?: number;
  warnAt?: number;
}

export default function CharRing({ count, max, size = 24, warnAt = 260 }: CharRingProps) {
  const radius = (size - 3) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(count / max, 1);
  const overflow = count > max;
  const warning = count > warnAt && !overflow;

  const stroke = overflow ? "var(--color-danger)" : warning ? "var(--color-warning)" : "#ffffff";
  const trackOpacity = overflow || warning ? 0.25 : 0.15;

  const remaining = max - count;
  const showNumber = remaining <= 20;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="status"
      aria-label={`${count} of ${max} characters used`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={trackOpacity}
          strokeWidth={2}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ transition: "stroke-dashoffset 150ms ease-out, stroke 150ms ease-out" }}
        />
      </svg>
      {showNumber && (
        <span
          className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-medium"
          style={{ color: overflow ? "var(--color-danger)" : "var(--color-warning)" }}
        >
          {remaining}
        </span>
      )}
    </div>
  );
}
