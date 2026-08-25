import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const data: {
    status?: string;
    content?: string;
    scheduledFor?: Date | null;
    mediaUrls?: string | null;
  } = {};

  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.content === "string") data.content = body.content;
  if ("scheduledFor" in body) {
    data.scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;
  }
  if ("mediaUrls" in body) data.mediaUrls = body.mediaUrls;

  const post = await prisma.post.update({ where: { id }, data });

  return NextResponse.json({ post });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
