import {
  MessageSquare,
  Clock,
  TrendingUp,
  Zap,
  CheckCircle2,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import Panel from "@/components/dashboard/Panel";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [totalTweets, scheduledCount, scheduledPosts, twitterAccount] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: "scheduled" } }),
      prisma.post.findMany({
        where: { status: "scheduled" },
        orderBy: { scheduledFor: "asc" },
        take: 5,
      }),
      prisma.twitterAccount.findFirst(),
    ]);

  return (
    <div>
      <h1 className="text-headline text-ink">Dashboard</h1>
      <p className="mt-1 text-body-sm text-ink-subtle">
        Welcome back to Tweetflow.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Tweets"
          value={totalTweets}
          icon={MessageSquare}
        />
        <StatCard label="Scheduled Posts" value={scheduledCount} icon={Clock} />
        <StatCard label="Engagement Forecast" value="—" icon={TrendingUp} />
        <StatCard label="Active Automations" value="0 / 0" icon={Zap} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Scheduled Tweets Queue" icon={Clock}>
            {scheduledPosts.length === 0 ? (
              <p className="py-6 text-center text-body-sm text-ink-tertiary">
                No tweets scheduled yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {scheduledPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between rounded-md border border-hairline px-3 py-2"
                  >
                    <p className="line-clamp-1 text-body-sm text-ink-muted">
                      {post.content}
                    </p>
                    <span className="shrink-0 text-caption text-ink-tertiary">
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
            <div className="flex items-center gap-2 rounded-md border border-hairline bg-surface-2 px-3 py-2">
              <CheckCircle2 size={16} className="text-success" />
              <span className="text-body-sm font-medium text-ink">
                @{twitterAccount.username}
              </span>
            </div>
          ) : (
            <a
              href="/api/auth/twitter/connect"
              className="block w-full rounded-md bg-primary py-2 text-center text-button text-on-primary transition-colors hover:bg-primary-hover"
            >
              Connect X Account
            </a>
          )}
        </Panel>
      </div>
    </div>
  );
}
