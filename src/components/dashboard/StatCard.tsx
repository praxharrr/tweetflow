import Link from "next/link";
import { LucideIcon } from "lucide-react";
import Sparkline from "./Sparkline";
import CountUp from "@/components/motion/CountUp";
import Magnetic from "@/components/motion/Magnetic";

interface EmptyState {
  message: string;
  actionLabel: string;
  actionHref?: string;
}

interface StatCardProps {
  label: string;
  icon: LucideIcon;
  size?: "lg" | "sm";
  value?: string | number;
  sparkline?: number[];
  empty?: EmptyState;
}

export default function StatCard({
  label,
  icon: Icon,
  size = "sm",
  value,
  sparkline,
  empty,
}: StatCardProps) {
  const isLg = size === "lg";

  return (
    <div
      className={`group flex h-full flex-col justify-between rounded-lg border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.015] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-150 hover:from-white/[0.06] hover:to-white/[0.03] ${
        isLg ? "p-6" : "p-5"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-eyebrow uppercase text-white/40">{label}</span>
        <Icon
          size={isLg ? 18 : 16}
          className="shrink-0 [stroke-width:1.25] text-mono-ink-subtle transition-[stroke-width] duration-150 group-hover:[stroke-width:1.75] group-hover:text-mono-ink"
        />
      </div>

      {empty ? (
        <div className="mt-4">
          <p className="text-body-sm text-mono-ink-subtle">{empty.message}</p>
          {empty.actionHref ? (
            <Magnetic className="mt-3 inline-block">
              <Link
                href={empty.actionHref}
                className="inline-block rounded-full border border-mono-hairline-strong px-3 py-1.5 text-caption font-medium text-mono-ink transition-colors duration-150 hover:bg-white/[0.06]"
              >
                {empty.actionLabel}
              </Link>
            </Magnetic>
          ) : (
            <span className="mt-3 inline-block cursor-not-allowed rounded-full border border-mono-hairline px-3 py-1.5 text-caption font-medium text-mono-ink-faint">
              {empty.actionLabel}
            </span>
          )}
        </div>
      ) : (
        <div className="mt-4 flex items-end justify-between gap-4">
          <div
            className={`tabular-nums text-mono-ink ${
              isLg ? "text-display-md" : "text-headline"
            }`}
          >
            {typeof value === "number" ? <CountUp value={value} /> : value}
          </div>
          {isLg && sparkline && (
            <Sparkline data={sparkline} className="h-7 w-24 shrink-0" />
          )}
        </div>
      )}
    </div>
  );
}
