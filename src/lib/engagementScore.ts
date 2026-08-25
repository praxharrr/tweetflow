export function getEngagementScoreByDay(dayOfWeek: number, hour: number): number {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (hour < 6) return 0.05;

  if (isWeekend) {
    if (hour >= 10 && hour < 13) return 1;
    if (hour >= 13 && hour < 16) return 0.6;
    return 0.3;
  }

  if (hour >= 9 && hour < 11) return 1;
  if (hour >= 17 && hour < 19) return 0.9;
  if (hour >= 13 && hour < 15) return 0.8;
  if (hour >= 19 && hour < 22) return 0.5;
  if (hour >= 6 && hour < 9) return 0.35;
  return 0.2;
}

export function getEngagementScore(date: Date, hour: number): number {
  return getEngagementScoreByDay(date.getDay(), hour);
}

export function scoreLabel(score: number): string {
  if (score >= 0.9) return "Peak engagement";
  if (score >= 0.6) return "Good window";
  if (score >= 0.3) return "Average";
  return "Low activity";
}
