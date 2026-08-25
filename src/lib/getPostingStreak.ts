import { prisma } from "@/lib/prisma";

function toDayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export async function getPostingStreak(): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - 60);

  const posts = await prisma.post.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const activeDays = new Set(posts.map((p) => toDayKey(p.createdAt)));

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!activeDays.has(toDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!activeDays.has(toDayKey(cursor))) return 0;
  }

  let streak = 0;
  while (activeDays.has(toDayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
