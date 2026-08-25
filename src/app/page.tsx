import {
  MessageSquare,
  Clock,
  TrendingUp,
  Zap,
  CheckCircle2,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import Panel from "@/components/dashboard/Panel";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import StaggerReveal from "@/components/motion/StaggerReveal";
import Magnetic from "@/components/motion/Magnetic";
import { prisma } from "@/lib/prisma";

function lastNDays(n: number): Date[] {
  const days: Date[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function bucketByDay(dates: Date[], days: Date[]): number[] {
  return days.map((day) => {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    return dates.filter((d) => d >= day && d < next).length;
  });
}

export default async function Home() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalTweets,
    scheduledCount,
    scheduledPosts,
    twitterAccount,
    recentPosts,
    recentScheduled,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "scheduled" } }),
    prisma.post.findMany({
      where: { status: "scheduled" },
      orderBy: { scheduledFor: "asc" },
      take: 5,
    }),
    prisma.twitterAccount.findFirst(),
    prisma.post.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.post.findMany({
      where: { status: "scheduled", createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  const days = lastNDays(7);
  const totalTrend = bucketByDay(
    recentPosts.map((p) => p.createdAt),
    days,
  );
  const scheduledTrend = bucketByDay(
    recentScheduled.map((p) => p.createdAt),
    days,
  );

  return (
    <div className="relative">
      <DashboardBackground />

      <header>
        <h1 className="text-display-md text-mono-ink">Dashboard</h1>
        <p className="mt-1 text-body-sm text-mono-ink-subtle">
          Welcome back to Tweetflow.
        </p>
      </header>

      <StaggerReveal className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <StatCard
            size="lg"
            label="Total Tweets"
            value={totalTweets}
            icon={MessageSquare}
            sparkline={totalTrend}
          />
        </div>
        <div className="lg:col-span-2">
          <StatCard
            size="lg"
            label="Scheduled Posts"
            value={scheduledCount}
            icon={Clock}
            sparkline={scheduledTrend}
          />
        </div>
        <StatCard
          size="sm"
          label="Engagement Forecast"
          icon={TrendingUp}
          empty={{
            message: "Connect your X account to unlock forecasts.",
            actionLabel: "Connect account",
            actionHref: "/settings",
          }}
        />
        <StatCard
          size="sm"
          label="Active Automations"
          icon={Zap}
          empty={{
            message: "No automations configured yet.",
            actionLabel: "Not available yet",
          }}
        />
      </StaggerReveal>

      <div className="mt-6 h-px w-full bg-mono-hairline" />

      <StaggerReveal
        className="mt-6 grid grid-cols-1 gap-2 lg:grid-cols-3"
        delay={0.12}
      >
        <div className="lg:col-span-2">
          <Panel title="Scheduled Tweets Queue" icon={Clock}>
            {scheduledPosts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-body-sm text-mono-ink-subtle">
                  Nothing scheduled yet. Queue up your first tweet.
                </p>
                <Magnetic>
                  <a
                    href="/compose"
                    className="rounded-full border border-mono-hairline-strong px-3 py-1.5 text-caption font-medium text-mono-ink transition-colors duration-150 hover:bg-white/[0.06]"
                  >
                    New Tweet
                  </a>
                </Magnetic>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {scheduledPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between rounded-md border border-mono-hairline px-3 py-2"
                  >
                    <p className="line-clamp-1 text-body-sm text-mono-ink-soft">
                      {post.content}
                    </p>
                    <span className="shrink-0 font-mono text-caption text-mono-ink-faint">
                      {post.scheduledFor
                        ? new Date(post.scheduledFor).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
        <Panel title="Connected Accounts">
          {twitterAccount ? (
            <div className="flex items-center gap-2 rounded-md border border-mono-hairline-strong bg-mono-surface-2 px-3 py-2">
              <CheckCircle2 size={16} className="[stroke-width:1.25] text-mono-ink" />
              <span className="text-body-sm font-medium text-mono-ink">
                @{twitterAccount.username}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="text-body-sm text-mono-ink-subtle">
                No X account connected yet.
              </p>
              <Magnetic className="block w-full">
                <a
                  href="/settings"
                  className="block w-full rounded-full border border-mono-hairline-strong py-2 text-center text-button text-mono-ink transition-colors duration-150 hover:bg-white/[0.06]"
                >
                  Connect X Account
                </a>
              </Magnetic>
            </div>
          )}
        </Panel>
      </StaggerReveal>
    </div>
  );
}
