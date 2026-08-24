import { prisma } from "@/lib/prisma";
import QueueList from "@/components/queue/QueueList";

export default async function QueuePage() {
  const posts = await prisma.post.findMany({
    where: { status: "scheduled" },
    orderBy: { scheduledFor: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Queue</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {posts.length} tweet{posts.length !== 1 ? "s" : ""} scheduled
      </p>

      <div className="mt-6 max-w-2xl">
        <QueueList
          posts={posts.map((p) => ({
            id: p.id,
            content: p.content,
            scheduledFor: p.scheduledFor?.toISOString() ?? null,
          }))}
        />
      </div>
    </div>
  );
}