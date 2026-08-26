import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import WeekCalendar from "@/components/calendar/WeekCalendar";
import MonthCalendar from "@/components/calendar/MonthCalendar";
import CalendarScene from "@/components/calendar/CalendarScene";
import PredictiveArcBackground from "@/components/dashboard/PredictiveArcBackground";

function mondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d;
}

function toDateParam(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function CalendarHeader({
  view,
  count,
  countLabel,
}: {
  view: "week" | "month";
  count: number;
  countLabel: string;
}) {
  return (
    <header className="relative isolate overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] px-7 py-7 backdrop-blur-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-28 -z-10 h-64 w-[32rem] rounded-full opacity-70 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(29,155,240,0.28), rgba(29,155,240,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-16 -z-10 h-56 w-80 rounded-full opacity-45 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(120,86,255,0.25), rgba(120,86,255,0) 70%)",
        }}
      />

      <CalendarScene />

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays size={13} className="[stroke-width:1.75] text-primary" />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
              Schedule
            </span>
          </div>

          <h1 className="mt-3 bg-gradient-to-br from-white via-white to-white/45 bg-clip-text text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-transparent">
            Calendar
          </h1>

          <p className="mt-2 max-w-md text-body-sm text-white/50">
            Click an empty slot to schedule, drag a tweet to reschedule.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5 rounded-2xl border border-primary/25 bg-primary/[0.07] px-4 py-2.5">
            <CalendarDays size={15} className="[stroke-width:1.75] text-primary" />
            <div>
              <div className="text-headline leading-none tabular-nums text-mono-ink">{count}</div>
              <div className="mt-0.5 text-[11px] text-primary/80">{countLabel}</div>
            </div>
          </div>
          <ViewToggle view={view} />
        </div>
      </div>
    </header>
  );
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; month?: string; view?: string }>;
}) {
  const params = await searchParams;
  const view = params.view === "month" ? "month" : "week";

  if (view === "month") {
    const now = new Date();
    const [year, month] = params.month
      ? params.month.split("-").map(Number)
      : [now.getFullYear(), now.getMonth() + 1];
    const monthIndex = month - 1;

    const startOfMonth = new Date(year, monthIndex, 1);
    const startOfNextMonth = new Date(year, monthIndex + 1, 1);

    const posts = await prisma.post.findMany({
      where: {
        status: "scheduled",
        scheduledFor: { gte: startOfMonth, lt: startOfNextMonth },
      },
      orderBy: { scheduledFor: "asc" },
    });

    const prevMonth = new Date(year, monthIndex - 1, 1);
    const nextMonth = new Date(year, monthIndex + 1, 1);
    const monthLabel = startOfMonth.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });

    return (
      <div className="relative min-h-screen">
        <PredictiveArcBackground />

        <CalendarHeader view="month" count={posts.length} countLabel="this month" />

        <div className="relative isolate mt-6 overflow-hidden rounded-2xl border border-mono-hairline bg-gradient-to-b from-mono-surface-2 to-mono-surface p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.4)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="[stroke-width:1.25] text-mono-ink-subtle" />
              <span className="text-card-title text-mono-ink">{monthLabel}</span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/calendar?view=month&month=${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`}
                className="rounded-full border border-mono-hairline p-1.5 text-mono-ink-subtle transition-colors duration-150 hover:border-primary/40 hover:bg-primary/[0.06] hover:text-primary"
              >
                <ChevronLeft size={16} />
              </Link>
              <Link
                href={`/calendar?view=month&month=${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`}
                className="rounded-full border border-mono-hairline p-1.5 text-mono-ink-subtle transition-colors duration-150 hover:border-primary/40 hover:bg-primary/[0.06] hover:text-primary"
              >
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          <MonthCalendar
            year={year}
            monthIndex={monthIndex}
            posts={posts.map((p) => ({
              id: p.id,
              content: p.content,
              scheduledFor: p.scheduledFor!.toISOString(),
            }))}
          />
        </div>
      </div>
    );
  }

  const weekStart = params.week ? mondayOf(new Date(params.week)) : mondayOf(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const posts = await prisma.post.findMany({
    where: {
      status: "scheduled",
      scheduledFor: { gte: weekStart, lt: weekEnd },
    },
    orderBy: { scheduledFor: "asc" },
  });

  const prevWeek = new Date(weekStart);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const weekEndDisplay = new Date(weekStart);
  weekEndDisplay.setDate(weekEndDisplay.getDate() + 6);
  const rangeLabel = `${weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${weekEndDisplay.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="relative min-h-screen">
      <PredictiveArcBackground />

      <CalendarHeader view="week" count={posts.length} countLabel="this week" />
      <div className="relative isolate mt-6 overflow-hidden rounded-2xl border border-mono-hairline bg-gradient-to-b from-mono-surface-2 to-mono-surface p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.4)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="[stroke-width:1.25] text-mono-ink-subtle" />
            <span className="text-card-title text-mono-ink">{rangeLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/calendar?view=week&week=${toDateParam(prevWeek)}`}
              className="rounded-full border border-mono-hairline p-1.5 text-mono-ink-subtle transition-colors duration-150 hover:border-primary/40 hover:bg-primary/[0.06] hover:text-primary"
            >
              <ChevronLeft size={16} />
            </Link>
            <Link
              href={`/calendar?view=week&week=${toDateParam(nextWeek)}`}
              className="rounded-full border border-mono-hairline p-1.5 text-mono-ink-subtle transition-colors duration-150 hover:border-primary/40 hover:bg-primary/[0.06] hover:text-primary"
            >
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        <WeekCalendar
          weekStart={weekStart.toISOString()}
          posts={posts.map((p) => ({
            id: p.id,
            content: p.content,
            scheduledFor: p.scheduledFor!.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}

function ViewToggle({ view }: { view: "week" | "month" }) {
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-white/[0.08] bg-black/25 p-1">
      <Link
        href="/calendar?view=week"
        className={`rounded-xl px-3 py-1.5 text-caption font-medium transition-all duration-150 ${
          view === "week"
            ? "bg-primary/[0.15] text-primary shadow-[0_0_10px_-4px_rgba(29,155,240,0.4)]"
            : "text-mono-ink-subtle hover:text-mono-ink"
        }`}
      >
        Week
      </Link>
      <Link
        href="/calendar?view=month"
        className={`rounded-xl px-3 py-1.5 text-caption font-medium transition-all duration-150 ${
          view === "month"
            ? "bg-primary/[0.15] text-primary shadow-[0_0_10px_-4px_rgba(29,155,240,0.4)]"
            : "text-mono-ink-subtle hover:text-mono-ink"
        }`}
      >
        Month
      </Link>
    </div>
  );
}