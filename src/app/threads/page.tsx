import ThreadComposer from "@/components/threads/ThreadComposer";
import PageHeader from "@/components/ui/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function ThreadsPage() {
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
      <PageHeader
        title="Threads"
        subtitle="Compose a connected sequence of tweets, or let AI draft the whole thread."
      />

      <div className="mt-6">
        <ThreadComposer displayName={displayName} handle={handle} />
      </div>
    </div>
  );
}
