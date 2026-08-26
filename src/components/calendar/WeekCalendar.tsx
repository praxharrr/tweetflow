"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { fieldClass } from "@/components/ui/field-styles";
import Button from "@/components/ui/Button";
import { getEngagementScore } from "@/lib/engagementScore";
import { useNowMinute } from "@/lib/useNowMinute";

interface Post {
  id: string;
  content: string;
  scheduledFor: string;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const ROW_HEIGHT = 40;
const DEFAULT_SCROLL_HOUR = 7;
const GRID_COLUMNS = "56px repeat(7, 1fr)";

function formatHour(h: number) {
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${period}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface QuickAdd {
  dayIndex: number;
  hour: number;
  top: number;
  left: number;
}

export default function WeekCalendar({
  weekStart,
  posts,
}: {
  weekStart: string;
  posts: Post[];
}) {
  const router = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [quickAdd, setQuickAdd] = useState<QuickAdd | null>(null);
  const [draftContent, setDraftContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const now = useNowMinute();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = DEFAULT_SCROLL_HOUR * ROW_HEIGHT;
    }
  }, []);

  const start = new Date(weekStart);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  const todayIndex = now ? days.findIndex((d) => isSameDay(d, now)) : -1;
  const nowTopOffset = now ? ((now.getHours() * 60 + now.getMinutes()) / 60) * ROW_HEIGHT : 0;

  const postsByCell = new Map<string, Post[]>();
  for (const post of posts) {
    const d = new Date(post.scheduledFor);
    const dayIndex = days.findIndex((day) => isSameDay(day, d));
    if (dayIndex === -1) continue;
    const key = `${dayIndex}-${d.getHours()}`;
    postsByCell.set(key, [...(postsByCell.get(key) ?? []), post]);
  }

  function openQuickAdd(dayIndex: number, hour: number, e: React.MouseEvent) {
    const gridRect = gridRef.current?.getBoundingClientRect();
    if (!gridRect) return;
    const target = e.currentTarget.getBoundingClientRect();
    setDraftContent("");
    setQuickAdd({
      dayIndex,
      hour,
      top: target.top - gridRect.top,
      left: Math.min(target.left - gridRect.left, gridRect.width - 260),
    });
  }

  async function handleQuickAddSave() {
    if (!quickAdd || !draftContent.trim()) return;
    setIsSaving(true);
    const scheduledFor = new Date(days[quickAdd.dayIndex]);
    scheduledFor.setHours(quickAdd.hour, 0, 0, 0);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: draftContent,
          status: "scheduled",
          scheduledFor: scheduledFor.toISOString(),
        }),
      });
      if (res.ok) {
        setQuickAdd(null);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDrop(dayIndex: number, hour: number) {
    if (!draggingId) return;
    const id = draggingId;
    setDraggingId(null);
    setMovingId(id);
    const scheduledFor = new Date(days[dayIndex]);
    scheduledFor.setHours(hour, 0, 0, 0);
    try {
      await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledFor: scheduledFor.toISOString() }),
      });
      router.refresh();
    } finally {
      setMovingId(null);
    }
  }

  return (
    <div className="relative overflow-x-auto rounded-lg border border-mono-hairline bg-mono-surface">
      <div ref={gridRef} className="relative min-w-[720px]">
        <div
          className="grid border-b border-mono-hairline"
          style={{ gridTemplateColumns: GRID_COLUMNS }}
        >
          <div />
          {days.map((day, i) => (
            <div
              key={i}
              className={`border-l border-mono-hairline px-2 py-2 text-center ${
                i === todayIndex ? "bg-primary/[0.06]" : ""
              }`}
            >
              <div
                className={`text-eyebrow uppercase ${
                  i === todayIndex ? "text-primary/70" : "text-white/40"
                }`}
              >
                {DAY_LABELS[i]}
              </div>
              <div
                className={`text-body-sm ${
                  i === todayIndex ? "font-semibold text-primary" : "text-mono-ink"
                }`}
              >
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        <div ref={scrollRef} className="relative max-h-[560px] overflow-y-auto">
          {todayIndex !== -1 && now && (
            <div
              className="pointer-events-none absolute inset-0 z-10 grid"
              style={{ gridTemplateColumns: GRID_COLUMNS, height: HOURS.length * ROW_HEIGHT }}
            >
              <div style={{ gridColumn: todayIndex + 2, marginTop: nowTopOffset }} className="relative">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary via-primary to-transparent shadow-[0_0_8px_-1px_rgba(29,155,240,0.9)]" />
                <div className="absolute -left-1 -top-[3px] h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_-1px_rgba(29,155,240,0.9)]" />
              </div>
            </div>
          )}

          {HOURS.map((hour) => (
            <div
              key={hour}
              className={`grid border-b border-mono-hairline ${hour < 6 ? "opacity-40" : ""}`}
              style={{ gridTemplateColumns: GRID_COLUMNS, height: ROW_HEIGHT }}
            >
              <div className="flex items-start justify-end pr-2 pt-0.5 font-mono text-[10px] text-mono-ink-faint">
                {formatHour(hour)}
              </div>
              {days.map((day, dayIndex) => {
                const key = `${dayIndex}-${hour}`;
                const cellPosts = postsByCell.get(key) ?? [];
                const score = getEngagementScore(day, hour);
                return (
                  <div
                    key={dayIndex}
                    role={cellPosts.length === 0 ? "button" : undefined}
                    tabIndex={cellPosts.length === 0 ? 0 : undefined}
                    aria-label={
                      cellPosts.length === 0
                        ? `Schedule a tweet for ${day.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} at ${formatHour(hour)}`
                        : undefined
                    }
                    className="group relative cursor-pointer border-l border-mono-hairline hover:bg-primary/[0.05] focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary/60 focus-visible:-outline-offset-1"
                    onClick={(e) => {
                      if (cellPosts.length === 0) openQuickAdd(dayIndex, hour, e);
                    }}
                    onKeyDown={(e) => {
                      if (cellPosts.length === 0 && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        openQuickAdd(dayIndex, hour, e as unknown as React.MouseEvent);
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(dayIndex, hour);
                    }}
                  >
                    {hour >= 6 && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{ backgroundColor: `rgba(29,155,240,${score * 0.1})` }}
                      />
                    )}
                    {cellPosts.length === 0 && (
                      <Plus
                        size={12}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/60 opacity-0 [stroke-width:1.5] transition-opacity duration-150 group-hover:opacity-100"
                      />
                    )}
                    {cellPosts.map((post) => (
                      <div
                        key={post.id}
                        draggable
                        onDragStart={() => setDraggingId(post.id)}
                        onDragEnd={() => setDraggingId(null)}
                        className={`absolute inset-0.5 flex items-center truncate rounded bg-gradient-to-b from-[#3aa8f2] to-[#1a8cd8] px-1 text-[10px] font-medium text-white shadow-[0_1px_6px_-1px_rgba(29,155,240,0.7)] transition-opacity duration-150 ${
                          movingId === post.id ? "opacity-40" : "opacity-100"
                        }`} 
                        title={post.content}
                      >
                        {post.content}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {quickAdd && (
        <div
          className="absolute z-20 w-64 rounded-lg border border-primary/25 bg-mono-surface-2 p-3 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7),0_0_0_1px_rgba(29,155,240,0.08)] backdrop-blur-sm"
          style={{ top: quickAdd.top, left: quickAdd.left }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-caption text-mono-ink-subtle">
              {days[quickAdd.dayIndex].toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}{" "}
              · {formatHour(quickAdd.hour)}
            </span>
            <button
              onClick={() => setQuickAdd(null)}
              aria-label="Close"
              className="text-mono-ink-faint hover:text-mono-ink"
            >
              <X size={12} />
            </button>
          </div>
          <textarea
            autoFocus
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            rows={3}
            aria-label="Tweet content"
            placeholder="What’s happening?"
            className={`${fieldClass} resize-none text-caption`}
          />
          <Button
            variant="primary"
            magnetic={false}
            className="mt-2 w-full !py-1.5 text-caption"
            onClick={handleQuickAddSave}
            disabled={!draftContent.trim() || isSaving}
          >
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : null}
            Schedule
          </Button>
        </div>
      )}
    </div>
  );
}