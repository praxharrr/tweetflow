import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  await prisma.twitterAccount.deleteMany({});
  return NextResponse.json({ success: true });
}