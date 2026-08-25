import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { tweets, status, scheduledFor } = await req.json();

  if (!Array.isArray(tweets) || tweets.length === 0) {
    return NextResponse.json({ error: "At least one tweet is required" }, { status: 400 });
  }

  const threadId = crypto.randomUUID();
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  const numbered = settings?.autoThreadNumbering ?? true;

  const posts = await prisma.$transaction(
    tweets.map((content: string, index: number) =>
      prisma.post.create({
        data: {
          content: numbered ? `${index + 1}/${tweets.length} ${content}` : content,
          status: status ?? "draft",
          threadId,
          position: index,
          scheduledFor:
            status === "scheduled" && scheduledFor ? new Date(scheduledFor) : null,
        },
      })
    )
  );

  return NextResponse.json({ posts });
}