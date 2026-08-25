import { prisma } from "@/lib/prisma";
import QueueTimeline from "@/components/queue/QueueTimeline";
import DensityStrip from "@/components/queue/DensityStrip";
import PageHeader from "@/components/ui/PageHeader";
import TwoColumnLayout from "@/components/ui/TwoColumnLayout";

export default async function QueuePage() {
  const posts = await prisma.post.findMany({
    where: { status: "scheduled" },
    orderBy: { scheduledFor: "asc" },
  });

  const scheduledDates = posts
    .map((p) => p.scheduledFor?.toISOString())
    .filter((d): d is string => !!d);

  return (
    <div>
      <PageHeader
        title="Queue"
        subtitle={`${posts.length} tweet${posts.length !== 1 ? "s" : ""} scheduled`}
      />

      <div className="mt-6">
        <TwoColumnLayout
          left={
            <QueueTimeline
              posts={posts.map((p) => ({
                id: p.id,
                content: p.content,
                scheduledFor: p.scheduledFor!.toISOString(),
              }))}
            />
          }
          right={<DensityStrip scheduledDates={scheduledDates} />}
        />
      </div>
    </div>
  );
}
