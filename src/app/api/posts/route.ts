import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { content, status, scheduledFor } = await req.json();

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      content,
      status: status ?? "draft",
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
    },
  });

  return NextResponse.json({ post });
}