"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getEngagementScoreByDay, scoreLabel } from "@/lib/engagementScore";

const DAYS: { label: string; dow: number }[] = [
  { label: "Mon", dow: 1 },
  { label: "Tue", dow: 2 },
  { label: "Wed", dow: 3 },
  { label: "Thu", dow: 4 },
  { label: "Fri", dow: 5 },
  { label: "Sat", dow: 6 },
  { label: "Sun", dow: 0 },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21];

function formatHour(h: number) {
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${period}`;
}

function getNextOccurrence(dayOfWeek: number, hour: number): Date {
  const now = new Date();
  const result = new Date(now);
  result.setHours(hour, 0, 0, 0);
  let diff = (dayOfWeek - now.getDay() + 7) % 7;
  if (diff === 0 && result <= now) diff = 7;
  result.setDate(result.getDate() + diff);
  return result;
}

export default function PostingTimeHeatmap() {
  const router = useRouter();
  const [hovered, setHovered] = useState<{ dow: number; label: string; hour: number } | null>(null);

  function applyToQueue(dow: number, hour: number) {
    const date = getNextOccurrence(dow, hour);
    router.push(`/compose?scheduleAt=${encodeURIComponent(date.toISOString())}`);
  }

  return (
    <div className="rounded-lg border border-mono-hairline bg-mono-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-eyebrow uppercase text-white/40">
          Weekly engagement pattern
        </span>
        {hovered ? (
          <span className="text-caption text-mono-ink-subtle">
            {hovered.label} {formatHour(hovered.hour)} ·{" "}
            {scoreLabel(getEngagementScoreByDay(hovered.dow, hovered.hour))}
          </span>
        ) : (
          <span className="text-caption text-mono-ink-faint">Hover a cell for detail · click to apply</span>
        )}
      </div>

      <div className="mt-3 overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid" style={{ gridTemplateColumns: "40px repeat(24, 1fr)" }}>
            <div />
            {HOURS.map((h) => (
              <div key={h} className="pb-1 text-center font-mono text-[9px] text-mono-ink-faint">
                {HOUR_TICKS.includes(h) ? formatHour(h).replace(" ", "") : ""}
              </div>
            ))}
          </div>

          {DAYS.map(({ label, dow }) => (
            <div key={dow} className="grid" style={{ gridTemplateColumns: "40px repeat(24, 1fr)" }}>
              <div className="flex items-center text-caption text-mono-ink-faint">{label}</div>
              {HOURS.map((hour) => {
                const score = getEngagementScoreByDay(dow, hour);
                return (
                  <button
                    key={hour}
                    type="button"
                    onMouseEnter={() => setHovered({ dow, label, hour })}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered({ dow, label, hour })}
                    onBlur={() => setHovered(null)}
                    onClick={() => applyToQueue(dow, hour)}
                    aria-label={`${label} ${formatHour(hour)} — ${scoreLabel(score)}. Apply to queue.`}
                    className="m-[1px] aspect-square rounded-[2px] transition-transform duration-150 hover:scale-125 focus-visible:scale-125 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white"
                    style={{ backgroundColor: `rgba(255,255,255,${0.04 + score * 0.5})` }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
