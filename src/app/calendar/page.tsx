import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import WeekCalendar from "@/components/calendar/WeekCalendar";
import MonthCalendar from "@/components/calendar/MonthCalendar";

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
      <div>
        <PageHeader
          title="Calendar"
          subtitle="Click an empty slot to schedule, drag a tweet to reschedule."
          action={<ViewToggle view="month" />}
        />

        <div className="mt-6 rounded-lg border border-mono-hairline bg-gradient-to-b from-mono-surface-2 to-mono-surface p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.4)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="[stroke-width:1.25] text-mono-ink-subtle" />
              <span className="text-card-title text-mono-ink">{monthLabel}</span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/calendar?view=month&month=${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`}
                className="rounded-full border border-mono-hairline p-1.5 text-mono-ink-subtle transition-colors duration-150 hover:bg-white/[0.06] hover:text-mono-ink"
              >
                <ChevronLeft size={16} />
              </Link>
              <Link
                href={`/calendar?view=month&month=${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`}
                className="rounded-full border border-mono-hairline p-1.5 text-mono-ink-subtle transition-colors duration-150 hover:bg-white/[0.06] hover:text-mono-ink"
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
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Click an empty slot to schedule, drag a tweet to reschedule."
        action={<ViewToggle view="week" />}
      />

      <div className="mt-6 rounded-lg border border-mono-hairline bg-gradient-to-b from-mono-surface-2 to-mono-surface p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.4)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="[stroke-width:1.25] text-mono-ink-subtle" />
            <span className="text-card-title text-mono-ink">{rangeLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/calendar?view=week&week=${toDateParam(prevWeek)}`}
              className="rounded-full border border-mono-hairline p-1.5 text-mono-ink-subtle transition-colors duration-150 hover:bg-white/[0.06] hover:text-mono-ink"
            >
              <ChevronLeft size={16} />
            </Link>
            <Link
              href={`/calendar?view=week&week=${toDateParam(nextWeek)}`}
              className="rounded-full border border-mono-hairline p-1.5 text-mono-ink-subtle transition-colors duration-150 hover:bg-white/[0.06] hover:text-mono-ink"
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
    <div className="flex items-center gap-1 rounded-full border border-mono-hairline p-0.5">
      <Link
        href="/calendar?view=week"
        className={`rounded-full px-3 py-1.5 text-caption font-medium transition-colors duration-150 ${
          view === "week" ? "bg-white/[0.08] text-mono-ink" : "text-mono-ink-subtle hover:text-mono-ink"
        }`}
      >
        Week
      </Link>
      <Link
        href="/calendar?view=month"
        className={`rounded-full px-3 py-1.5 text-caption font-medium transition-colors duration-150 ${
          view === "month" ? "bg-white/[0.08] text-mono-ink" : "text-mono-ink-subtle hover:text-mono-ink"
        }`}
      >
        Month
      </Link>
    </div>
  );
}
