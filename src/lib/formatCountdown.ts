export function formatCountdown(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();

  if (diffMs > 0) {
    const totalMinutes = Math.floor(diffMs / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `posts in ${days}d ${hours}h`;
    if (hours > 0) return `posts in ${hours}h ${minutes}m`;
    return `posts in ${minutes}m`;
  }

  const overdueMinutes = Math.floor(-diffMs / 60000);
  if (overdueMinutes < 5) return "posting now";

  const days = Math.floor(overdueMinutes / (60 * 24));
  const hours = Math.floor((overdueMinutes % (60 * 24)) / 60);
  if (days > 0) return `overdue by ${days}d`;
  if (hours > 0) return `overdue by ${hours}h`;
  return `overdue by ${overdueMinutes}m`;
}

export function dayLabel(date: Date, now: Date): string {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / 86400000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
