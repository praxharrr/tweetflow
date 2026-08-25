import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const data: {
    displayName?: string;
    timezone?: string;
    defaultAiTone?: string;
    autoThreadNumbering?: boolean;
  } = {};

  if (typeof body.displayName === "string") data.displayName = body.displayName;
  if (typeof body.timezone === "string") data.timezone = body.timezone;
  if (typeof body.defaultAiTone === "string") data.defaultAiTone = body.defaultAiTone;
  if (typeof body.autoThreadNumbering === "boolean") {
    data.autoThreadNumbering = body.autoThreadNumbering;
  }

  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  return NextResponse.json({ settings });
}
