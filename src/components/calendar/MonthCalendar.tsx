import Link from "next/link";

interface Post {
  id: string;
  content: string;
  scheduledFor: string;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

function getMonthGrid(year: number, monthIndex: number) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function MonthCalendar({
  year,
  monthIndex,
  posts,
}: {
  year: number;
  monthIndex: number;
  posts: Post[];
}) {
  const today = new Date();
  const postsByDay = new Map<number, Post[]>();
  for (const post of posts) {
    const d = new Date(post.scheduledFor);
    const day = d.getDate();
    postsByDay.set(day, [...(postsByDay.get(day) ?? []), post]);
  }

  const cells = getMonthGrid(year, monthIndex);

  return (
    <div className="rounded-lg border border-mono-hairline bg-mono-surface p-3">
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1.5 text-eyebrow uppercase text-white/40">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const date = new Date(year, monthIndex, day);
          const isToday =
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();
          const dayPosts = postsByDay.get(day) ?? [];
          const weekHref = `/calendar?view=week&week=${toDateParam(mondayOf(date))}`;

          return (
            <Link
              key={i}
              href={weekHref}
              className={`group flex min-h-[84px] flex-col rounded-md border p-1.5 transition-colors duration-150 hover:bg-white/[0.03] ${
                isToday ? "border-mono-hairline-strong" : "border-mono-hairline"
              }`}
            >
              <span
                className={`text-caption ${isToday ? "font-semibold text-mono-ink" : "text-mono-ink-faint"}`}
              >
                {day}
              </span>
              <div className="mt-1 flex flex-col gap-0.5">
                {dayPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    className="truncate rounded bg-white/10 px-1 py-0.5 text-[10px] text-mono-ink-subtle"
                  >
                    {post.content}
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <span className="text-[10px] text-mono-ink-faint">
                    +{dayPosts.length - 3} more
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
