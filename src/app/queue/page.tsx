import { prisma } from "@/lib/prisma";
import QueueTimeline from "@/components/queue/QueueTimeline";
import DensityStrip from "@/components/queue/DensityStrip";
import TwoColumnLayout from "@/components/ui/TwoColumnLayout";
import { ListOrdered, Clock, CalendarClock } from "lucide-react";
import QueueScene from "@/components/queue/QueueScene";
import PredictiveArcBackground from "@/components/dashboard/PredictiveArcBackground";

export default async function QueuePage() {
  const now = new Date();

  const [posts, overdueCount] = await Promise.all([
    prisma.post.findMany({
      where: { status: "scheduled" },
      orderBy: { scheduledFor: "asc" },
    }),
    prisma.post.count({
      where: { status: "scheduled", scheduledFor: { lt: now } },
    }),
  ]);

  const scheduledDates = posts
    .map((p) => p.scheduledFor?.toISOString())
    .filter((d): d is string => !!d);
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

        <QueueScene />

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <ListOrdered size={13} className="[stroke-width:1.75] text-primary" />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                Pipeline
              </span>
            </div>

            <h1 className="mt-3 bg-gradient-to-br from-white via-white to-white/45 bg-clip-text text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-transparent">
              Queue
            </h1>

            <p className="mt-2 text-body-sm text-white/50">
              <span className="font-medium text-white/80">{posts.length}</span>{" "}
              scheduled
              {overdueCount > 0 && (
                <>
                  <span className="mx-2 text-white/20">·</span>
                  <span className="text-amber-400/80">
                    {overdueCount} overdue
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2.5 rounded-2xl border border-primary/25 bg-primary/[0.07] px-4 py-2.5">
              <CalendarClock size={15} className="[stroke-width:1.75] text-primary" />
              <div>
                <div className="text-headline leading-none tabular-nums text-mono-ink">
                  {posts.length}
                </div>
                <div className="mt-0.5 text-[11px] text-primary/80">in queue</div>
              </div>
            </div>
          </div>
        </div>
      </header>

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