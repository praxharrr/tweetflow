import TweetComposer from "@/components/compose/TweetComposer";
import { PenSquare, FileEdit, CalendarClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ComposeScene from "@/components/compose/ComposeScene";
import PredictiveArcBackground from "@/components/dashboard/PredictiveArcBackground";

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; scheduleAt?: string }>;
}) {
  const params = await searchParams;

  const [account, settings, draftCount, scheduledCount] = await Promise.all([
    prisma.twitterAccount.findFirst(),
    prisma.settings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton" },
      update: {},
    }),
    prisma.post.count({ where: { status: "draft", threadId: null } }),
    prisma.post.count({ where: { status: "scheduled", threadId: null } }),
  ]);

  const displayName = settings.displayName || "You";
  const handle = account?.username ?? displayName.toLowerCase().replace(/\s+/g, "");

  return (
    <div className="relative min-h-screen">
      <PredictiveArcBackground />

      <header className="relative isolate overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] px-7 py-7 backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-28 -z-10 h-64 w-[32rem] rounded-full opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(29,155,240,0.28), rgba(29,155,240,0) 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-16 -z-10 h-56 w-80 rounded-full opacity-45 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(120,86,255,0.25), rgba(120,86,255,0) 70%)",
          }}
        />

        <ComposeScene />

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <PenSquare size={13} className="[stroke-width:1.75] text-primary" />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                Write
              </span>
            </div>

            <h1 className="mt-3 bg-gradient-to-br from-white via-white to-white/45 bg-clip-text text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-transparent">
              New Tweet
            </h1>

            <p className="mt-2 max-w-md text-body-sm text-white/50">
              Draft a tweet, or let AI help you write one.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5">
              <FileEdit size={15} className="[stroke-width:1.75] text-mono-ink-faint" />
              <div>
                <div className="text-headline leading-none tabular-nums text-mono-ink">
                  {draftCount}
                </div>
                <div className="mt-0.5 text-[11px] text-mono-ink-faint">drafted</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-primary/25 bg-primary/[0.07] px-4 py-2.5">
              <CalendarClock size={15} className="[stroke-width:1.75] text-primary" />
              <div>
                <div className="text-headline leading-none tabular-nums text-mono-ink">
                  {scheduledCount}
                </div>
                <div className="mt-0.5 text-[11px] text-primary/80">scheduled</div>
              </div>
            </div>
          </div>
        </div>
      </header>

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