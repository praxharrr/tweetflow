import Card from "@/components/ui/Card";
import { dayLabel } from "@/lib/formatCountdown";

export default function DensityStrip({ scheduledDates }: { scheduledDates: string[] }) {
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const counts = days.map((day) => {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    return scheduledDates.filter((iso) => {
      const t = new Date(iso).getTime();
      return t >= day.getTime() && t < next.getTime();
    }).length;
  });

  const max = Math.max(...counts, 1);

  return (
    <Card className="p-4">
      <span className="text-eyebrow uppercase text-white/40">Next 7 days</span>
      <div className="mt-3 flex items-end justify-between gap-1.5" style={{ height: 72 }}>
        {days.map((day, i) => {
          const count = counts[i];
          const heightPct = count === 0 ? 4 : Math.max((count / max) * 100, 14);
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-full w-full items-end">
                <div
                  className={`w-full rounded-sm transition-all duration-150 ${
                    count === 0 ? "bg-white/10" : "bg-white/60"
                  }`}
                  style={{ height: `${heightPct}%` }}
                  title={`${count} tweet${count !== 1 ? "s" : ""}`}
                />
              </div>
              <span className="font-mono text-[9px] text-mono-ink-faint">
                {dayLabel(day, now) === "Today" ? "Today" : day.toLocaleDateString("en-IN", { weekday: "narrow" })}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-caption text-mono-ink-faint">
        {counts.every((c) => c === 0)
          ? "Nothing scheduled in the next week."
          : `${counts.reduce((a, b) => a + b, 0)} scheduled across the next 7 days.`}
      </p>
    </Card>
  );
}
