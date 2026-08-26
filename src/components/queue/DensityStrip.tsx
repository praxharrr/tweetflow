import Card from "@/components/ui/Card";
import { dayLabel } from "@/lib/formatCountdown";

const BAR_MAX_HEIGHT = 56;

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
    <Card className="relative isolate overflow-hidden p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-14 -z-10 h-32 w-48 rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(29,155,240,0.25), rgba(29,155,240,0) 70%)",
        }}
      />
      <span className="text-eyebrow uppercase text-white/40">Next 7 days</span>
      <div className="mt-3 flex items-end justify-between gap-1.5">
        {days.map((day, i) => {
          const count = counts[i];
          const barHeight = count === 0 ? 3 : Math.max(Math.round((count / max) * BAR_MAX_HEIGHT), 10);
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-end" style={{ height: BAR_MAX_HEIGHT }}>
                <div
                  className={`w-full rounded-sm transition-all duration-150 ${
                    count === 0
                      ? "bg-white/10"
                      : "bg-gradient-to-t from-[#1a8cd8] to-[#4db5f5] shadow-[0_0_10px_-2px_rgba(29,155,240,0.6)]"
                  }`}
                  style={{ height: barHeight }}
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