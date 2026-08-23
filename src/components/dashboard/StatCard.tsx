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
      ? "text-emerald-600"
      : trend === "down"
      ? "text-red-500"
      : "text-neutral-400";

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          {label}
        </span>
        <Icon size={18} className="text-neutral-400" />
      </div>
      <div className="mt-3 text-2xl font-bold text-neutral-900">{value}</div>
      {hint && <div className={`mt-1 text-xs font-medium ${hintColor}`}>{hint}</div>}
    </div>
  );
}