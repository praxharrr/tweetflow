import { MessageSquare } from "lucide-react";
import Sparkline from "./Sparkline";

interface TweetBreakdownProps {
  total: number;
  drafts: number;
  scheduled: number;
  published: number;
  sparkline: number[];
}

const SEGMENTS = [
  { key: "drafts", label: "Drafts", color: "#71767b" },
  { key: "scheduled", label: "Scheduled", color: "#1d9bf0" },
  { key: "published", label: "Published", color: "#00ba7c" },
] as const;

export default function TweetBreakdown({
  total,
  drafts,
  scheduled,
  published,
  sparkline,
}: TweetBreakdownProps) {
  const values = { drafts, scheduled, published };
  const safeTotal = total || 1;

  return (
    <div className="group flex h-full flex-col rounded-lg border border-mono-hairline bg-gradient-to-b from-mono-surface-2 to-mono-surface p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.4)]">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-eyebrow uppercase text-white/40">
            Total Tweets
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-display-md tabular-nums leading-none text-mono-ink">
              {total}
            </span>
            <span className="text-caption text-mono-ink-faint">
              across all stages
            </span>
          </div>
        </div>
        <MessageSquare
          size={18}
          className="shrink-0 [stroke-width:1.25] text-mono-ink-subtle transition-[stroke-width] duration-150 group-hover:[stroke-width:1.75] group-hover:text-mono-ink"
        />
      </div>

      <div className="mt-6 flex h-2 gap-1 overflow-hidden rounded-full">
        {SEGMENTS.map((seg) => {
          const value = values[seg.key];
          if (value === 0) return null;
          return (
            <div
              key={seg.key}
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(value / safeTotal) * 100}%`,
                background: seg.color,
                boxShadow: `0 0 12px -2px ${seg.color}`,
              }}
            />
          );
        })}
        {total === 0 && (
          <div className="h-full w-full rounded-full bg-white/[0.06]" />
        )}
      </div>

      <div className="mt-5 flex flex-col divide-y divide-white/[0.05]">
        {SEGMENTS.map((seg) => {
          const value = values[seg.key];
          const pct = total ? Math.round((value / total) * 100) : 0;
          return (
            <div
              key={seg.key}
              className="flex items-center justify-between py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    background: value ? seg.color : "rgba(255,255,255,0.15)",
                  }}
                />
                <span className="text-body-sm text-mono-ink-soft">
                  {seg.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-caption text-mono-ink-faint">
                  {pct}%
                </span>
                <span className="w-6 text-right text-body-sm tabular-nums text-mono-ink">
                  {value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex items-end justify-between pt-4">
        <span className="text-caption text-mono-ink-faint">Last 7 days</span>
        <Sparkline data={sparkline} className="h-8 w-28" />
      </div>
    </div>
  );
}