import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthGrid(year: number, monthIndex: number) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // shift so Monday = 0

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
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

  const postsByDay = new Map<number, typeof posts>();
  for (const post of posts) {
    if (!post.scheduledFor) continue;
    const day = new Date(post.scheduledFor).getDate();
    postsByDay.set(day, [...(postsByDay.get(day) ?? []), post]);
  }

  const cells = getMonthGrid(year, monthIndex);
  const monthLabel = startOfMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const prev = new Date(year, monthIndex - 1, 1);
  const next = new Date(year, monthIndex + 1, 1);
  const prevHref = `/calendar?month=${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
  const nextHref = `/calendar?month=${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Calendar</h1>
      <p className="mt-1 text-sm text-neutral-500">Scheduled tweets across the month.</p>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-neutral-400" />
            <span className="text-sm font-semibold text-neutral-800">{monthLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href={prevHref} className="rounded-lg border border-neutral-200 p-1.5 hover:bg-neutral-50">
              <ChevronLeft size={16} />
            </Link>
            <Link href={nextHref} className="rounded-lg border border-neutral-200 p-1.5 hover:bg-neutral-50">
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-neutral-400">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => (
            <div
              key={i}
              className={`min-h-[80px] rounded-lg border p-1.5 ${day ? "border-neutral-100" : "border-transparent"}`}
            >
              {day && (
                <>
                  <span className="text-xs text-neutral-400">{day}</span>
                  <div className="mt-1 flex flex-col gap-1">
                    {(postsByDay.get(day) ?? []).slice(0, 2).map((post) => (
                      <div
                        key={post.id}
                        className="truncate rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700"
                      >
                        {post.content}
                      </div>
                    ))}
                    {(postsByDay.get(day)?.length ?? 0) > 2 && (
                      <span className="text-[10px] text-neutral-400">
                        +{(postsByDay.get(day)?.length ?? 0) - 2} more
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}