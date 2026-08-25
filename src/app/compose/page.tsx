import TweetComposer from "@/components/compose/TweetComposer";
import PageHeader from "@/components/ui/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; scheduleAt?: string }>;
}) {
  const params = await searchParams;

  const [account, settings] = await Promise.all([
    prisma.twitterAccount.findFirst(),
    prisma.settings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton" },
      update: {},
    }),
  ]);

  const displayName = settings.displayName || "You";
  const handle = account?.username ?? displayName.toLowerCase().replace(/\s+/g, "");

  return (
    <div>
      <PageHeader title="New Tweet" subtitle="Draft a tweet, or let AI help you write one." />

      <div className="mt-6">
        <TweetComposer
          hasAccount={!!account}
          displayName={displayName}
          handle={handle}
          initialTopic={params.topic}
          initialScheduleAt={params.scheduleAt}
        />
      </div>
    </div>
  );
}
