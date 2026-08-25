import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [drafts, scheduled] = await Promise.all([
    prisma.post.findMany({
      where: { status: "draft" },
      orderBy: { updatedAt: "desc" },
      take: 15,
      select: { id: true, content: true },
    }),
    prisma.post.findMany({
      where: { status: "scheduled" },
      orderBy: { scheduledFor: "asc" },
      take: 15,
      select: { id: true, content: true },
    }),
  ]);

  return NextResponse.json({ drafts, scheduled });
}
