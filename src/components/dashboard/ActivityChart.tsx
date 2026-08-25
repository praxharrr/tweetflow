"use client";

import { useState } from "react";
import { Activity } from "lucide-react";

interface ActivityChartProps {
  days: string[];
  created: number[];
  scheduled: number[];
}

const W = 600;
const H = 190;
const PAD_X = 8;
const PAD_TOP = 16;
const PAD_BOTTOM = 26;

function buildPoints(data: number[], max: number) {
  const step = (W - PAD_X * 2) / (data.length - 1);
  const usable = H - PAD_TOP - PAD_BOTTOM;
  return data.map((v, i) => ({
    x: PAD_X + i * step,
    y: PAD_TOP + usable - (v / max) * usable,
  }));
}

function smooth(points: { x: number; y: number }[]) {
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

export default function ActivityChart({
  days,
  created,
  scheduled,
}: ActivityChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  const max = Math.max(...created, ...scheduled, 1);
  const createdPts = buildPoints(created, max);
  const scheduledPts = buildPoints(scheduled, max);
  const baseY = H - PAD_BOTTOM;

  const areaPath = (pts: { x: number; y: number }[]) =>
    `${smooth(pts)} L ${pts[pts.length - 1].x},${baseY} L ${pts[0].x},${baseY} Z`;

  const totalCreated = created.reduce((a, b) => a + b, 0);

  return (
    <div className="group flex h-full flex-col rounded-lg border border-mono-hairline bg-gradient-to-b from-mono-surface-2 to-mono-surface p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.4)]">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-eyebrow uppercase text-white/40">
            Activity
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-headline tabular-nums text-mono-ink">
              {totalCreated}
            </span>
            <span className="text-caption text-mono-ink-faint">
              tweets written this week
            </span>
          </div>
        </div>
        <Activity
          size={18}
          className="shrink-0 [stroke-width:1.25] text-mono-ink-subtle transition-[stroke-width] duration-150 group-hover:[stroke-width:1.75] group-hover:text-mono-ink"
        />
      </div>

      <div className="relative mt-4 flex-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1d9bf0" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1d9bf0" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradScheduled" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7856ff" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#7856ff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((t) => (
            <line
              key={t}
              x1={PAD_X}
              x2={W - PAD_X}
              y1={PAD_TOP + t * (H - PAD_TOP - PAD_BOTTOM)}
              y2={PAD_TOP + t * (H - PAD_TOP - PAD_BOTTOM)}
              stroke="white"
              strokeOpacity="0.05"
              strokeWidth="1"
            />
          ))}

          <path d={areaPath(scheduledPts)} fill="url(#gradScheduled)" />
          <path d={areaPath(createdPts)} fill="url(#gradCreated)" />

          <path
            d={smooth(scheduledPts)}
            fill="none"
            stroke="#7856ff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />
          <path
            d={smooth(createdPts)}
            fill="none"
            stroke="#1d9bf0"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {hover !== null && (
            <>
              <line
                x1={createdPts[hover].x}
                x2={createdPts[hover].x}
                y1={PAD_TOP}
                y2={baseY}
                stroke="white"
                strokeOpacity="0.18"
                strokeWidth="1"
              />
              <circle
                cx={scheduledPts[hover].x}
                cy={scheduledPts[hover].y}
                r="4"
                fill="#7856ff"
                stroke="#000"
                strokeWidth="2"
              />
              <circle
                cx={createdPts[hover].x}
                cy={createdPts[hover].y}
                r="4.5"
                fill="#1d9bf0"
                stroke="#000"
                strokeWidth="2"
              />
            </>
          )}

          {days.map((day, i) => (
            <g key={i}>
              <rect
                x={createdPts[i].x - 20}
                y={0}
                width={40}
                height={H}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
              <text
                x={createdPts[i].x}
                y={H - 8}
                textAnchor="middle"
                fill="white"
                fillOpacity={hover === i ? "0.6" : "0.28"}
                fontSize="11"
              >
                {day}
              </text>
            </g>
          ))}
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute -top-1 rounded-md border border-mono-hairline-strong bg-black/90 px-2.5 py-1.5 backdrop-blur-sm"
            style={{
              left: `${(createdPts[hover].x / W) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1d9bf0]" />
              <span className="font-mono text-[11px] text-mono-ink">
                {created[hover]} written
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7856ff]" />
              <span className="font-mono text-[11px] text-mono-ink-subtle">
                {scheduled[hover]} scheduled
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-caption text-mono-ink-subtle">
          <span className="h-2 w-2 rounded-full bg-[#1d9bf0]" />
          Written
        </span>
        <span className="flex items-center gap-1.5 text-caption text-mono-ink-subtle">
          <span className="h-2 w-2 rounded-full bg-[#7856ff]" />
          Scheduled
        </span>
        <span className="ml-auto text-caption text-mono-ink-faint">
          Last 7 days
        </span>
      </div>
    </div>
  );
}