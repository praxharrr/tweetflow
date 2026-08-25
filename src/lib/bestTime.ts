export interface BestTimeSuggestion {
  window: string;
  reason: string;
}

export function getBestTimeToday(now: Date = new Date()): BestTimeSuggestion {
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;

  if (isWeekend) {
    return {
      window: "10:00 AM – 12:00 PM",
      reason: "Weekend engagement peaks late morning as people browse casually.",
    };
  }

  const hour = now.getHours();
  if (hour < 11) {
    return {
      window: "9:00 AM – 11:00 AM",
      reason: "Weekday mornings see a commute-and-coffee engagement spike.",
    };
  }
  if (hour < 15) {
    return {
      window: "1:00 PM – 3:00 PM",
      reason: "The post-lunch lull tends to drive higher scroll time.",
    };
  }
  return {
    window: "5:00 PM – 7:00 PM",
    reason: "Evening wind-down is prime scrolling time.",
  };
}
