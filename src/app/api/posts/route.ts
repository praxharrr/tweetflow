import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { content, status, scheduledFor, mediaUrls } = await req.json();

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      content,
      status: status ?? "draft",
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      mediaUrls: mediaUrls ?? null,
    },
  });

  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");

  const result = await prisma.post.deleteMany(
    status ? { where: { status } } : undefined,
  );

  return NextResponse.json({ count: result.count });
}