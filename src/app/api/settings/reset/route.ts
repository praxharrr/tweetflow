import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  await prisma.$transaction([
    prisma.post.deleteMany(),
    prisma.settings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton" },
      update: {
        displayName: "Tweetflow",
        timezone: "Asia/Kolkata",
        defaultAiTone: "direct",
        autoThreadNumbering: true,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
