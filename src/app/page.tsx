import Link from "next/link";
import ActivityChart from "@/components/dashboard/ActivityChart";
import TweetBreakdown from "@/components/dashboard/TweetBreakdown";
import { dayLabel, formatCountdown } from "@/lib/formatCountdown";
import PredictiveArcBackground from "@/components/dashboard/PredictiveArcBackground";
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
    draftCount,
    publishedCount,
    scheduledCount,
    scheduledPosts,
    twitterAccount,
    recentPosts,
    recentScheduled,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "draft" } }),
    prisma.post.count({ where: { status: "published" } }),
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
  const dayLabels = days.map((d) =>
    d.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 3),
  );

  return (
    <div className="relative">
      <DashboardBackground />
      <PredictiveArcBackground />

      <header className="relative isolate overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] px-7 py-7 backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-32 -z-10 h-72 w-[36rem] rounded-full opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(29,155,240,0.30), rgba(29,155,240,0) 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -right-20 -z-10 h-64 w-96 rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(120,86,255,0.28), rgba(120,86,255,0) 70%)",
          }}
        />

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>

            <h1 className="mt-3 bg-gradient-to-br from-white via-white to-white/45 bg-clip-text text-[44px] font-semibold leading-[1.05] tracking-[-0.035em] text-transparent">
              Dashboard
            </h1>

            <p className="mt-2 text-body-sm text-white/50">
              <span className="font-medium text-white/80">{scheduledCount}</span>{" "}
              scheduled
              <span className="mx-2 text-white/20">·</span>
              <span className="font-medium text-white/80">{draftCount}</span>{" "}
              drafts waiting
              <span className="mx-2 text-white/20">·</span>
              <span
                className={
                  twitterAccount ? "text-emerald-400/80" : "text-amber-400/80"
                }
              >
                {twitterAccount ? "connected" : "not connected"}
              </span>
            </p>
          </div>

          <Link
            href="/compose"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-b from-[#3aa8f2] to-[#1a8cd8] px-5 py-2.5 text-button font-semibold text-white shadow-[0_8px_28px_-8px_rgba(29,155,240,0.75)] ring-1 ring-inset ring-white/25 transition-all duration-200 hover:shadow-[0_10px_34px_-8px_rgba(29,155,240,0.95)] active:scale-[0.98]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <MessageSquare size={16} className="[stroke-width:2]" />
            Write a tweet
          </Link>
        </div>
      </header>

      <StaggerReveal className="mt-6 grid grid-cols-1 gap-2 lg:grid-cols-2">
        <TweetBreakdown
          total={totalTweets}
          drafts={draftCount}
          scheduled={scheduledCount}
          published={publishedCount}
          sparkline={totalTrend}
        />
        <ActivityChart
          days={dayLabels}
          created={totalTrend}
          scheduled={scheduledTrend}
        />
      </StaggerReveal>

      <StaggerReveal
        className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3"
        delay={0.06}
      >
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
        <StatCard
          size="sm"
          label="Scheduled Posts"
          value={scheduledCount}
          icon={Clock}
          sparkline={scheduledTrend}
        />
      </StaggerReveal>

      <div className="mt-6 h-px w-full bg-mono-hairline" />

      <StaggerReveal
        className="mt-6 grid grid-cols-1 gap-2 lg:grid-cols-3"
        delay={0.12}
      >
        <div className="lg:col-span-2">
          <Panel
            title="Scheduled Tweets Queue"
            icon={Clock}
            action={
              <Link
                href="/queue"
                className="text-caption font-medium text-mono-ink-subtle transition-colors hover:text-primary"
              >
                View all →
              </Link>
            }
          >
            {scheduledPosts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-body-sm text-mono-ink-subtle">
                  Nothing scheduled yet. Queue up your first tweet.
                </p>
                <Magnetic>
                  <Link
                    href="/compose"
                    className="rounded-xl bg-gradient-to-b from-[#3aa8f2] to-[#1a8cd8] px-4 py-2 text-caption font-semibold text-white shadow-[0_4px_16px_-4px_rgba(29,155,240,0.5)] ring-1 ring-inset ring-white/20 transition-all duration-150 hover:from-[#4db5f5] hover:to-[#1d9bf0] active:scale-[0.98]"
                  >
                    New Tweet
                  </Link>
                </Magnetic>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-white/[0.05]">
                {scheduledPosts.map((post) => {
                  const target = post.scheduledFor
                    ? new Date(post.scheduledFor)
                    : null;
                  const now = new Date();
                  const isOverdue = target ? target < now : false;
                  return (
                    <Link
                      key={post.id}
                      href="/queue"
                      className="group flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          isOverdue ? "bg-warning" : "bg-primary"
                        }`}
                      />
                      <p className="line-clamp-1 flex-1 text-body-sm text-mono-ink-soft transition-colors group-hover:text-mono-ink">
                        {post.content}
                      </p>
                      <div className="shrink-0 text-right">
                        <div className="text-caption text-mono-ink-faint">
                          {target ? dayLabel(target, now) : ""}
                        </div>
                        <div
                          className={`font-mono text-[11px] ${
                            isOverdue ? "text-warning" : "text-mono-ink-faint"
                          }`}
                        >
                          {target ? formatCountdown(target, now) : ""}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Connected Accounts" icon={CheckCircle2}>
          {twitterAccount ? (
            <div className="flex items-center gap-3 rounded-xl border border-mono-hairline-strong bg-mono-surface-2 px-3 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-white">
                {twitterAccount.username.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-body-sm font-medium text-mono-ink">
                  @{twitterAccount.username}
                </div>
                <div className="text-caption text-emerald-400/80">
                  Connected
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="text-body-sm leading-relaxed text-mono-ink-subtle">
                Connect X to publish scheduled tweets automatically.
              </p>
              <Magnetic className="block w-full">
                <Link
                  href="/settings"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#3aa8f2] to-[#1a8cd8] py-2.5 text-button font-semibold text-white shadow-[0_4px_16px_-4px_rgba(29,155,240,0.5)] ring-1 ring-inset ring-white/20 transition-all duration-150 hover:from-[#4db5f5] hover:to-[#1d9bf0] active:scale-[0.98]"
                >
                  Connect X Account
                </Link>
              </Magnetic>
            </div>
          )}
        </Panel>
      </StaggerReveal>
    </div>
  );
}