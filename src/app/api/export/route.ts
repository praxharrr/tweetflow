import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [posts, settings, account] = await Promise.all([
    prisma.post.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
    prisma.twitterAccount.findFirst(),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    posts,
    settings,
    connectedAccount: account ? { username: account.username, connectedAt: account.createdAt } : null,
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="tweetflow-export-${Date.now()}.json"`,
    },
  });
}
