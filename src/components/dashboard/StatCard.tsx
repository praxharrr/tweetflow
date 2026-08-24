import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend = "neutral",
}: StatCardProps) {
  const hintColor =
    trend === "up"
      ? "text-success"
      : trend === "down"
      ? "text-danger"
      : "text-ink-tertiary";

  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between">
        <span className="text-eyebrow uppercase text-ink-subtle">
          {label}
        </span>
        <Icon size={18} className="text-ink-subtle" />
      </div>
      <div className="mt-3 text-display-md text-ink">{value}</div>
      {hint && <div className={`mt-1 text-caption font-medium ${hintColor}`}>{hint}</div>}
    </div>
  );
}
