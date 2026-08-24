import { MessageSquare, Clock, TrendingUp, Zap } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import Panel from "@/components/dashboard/Panel";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [totalTweets, scheduledCount, scheduledPosts] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "scheduled" } }),
    prisma.post.findMany({
      where: { status: "scheduled" },
      orderBy: { scheduledFor: "asc" },
      take: 5,
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Welcome back to Tweetflow.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tweets" value={totalTweets} icon={MessageSquare} />
        <StatCard label="Scheduled Posts" value={scheduledCount} icon={Clock} />
        <StatCard label="Engagement Forecast" value="—" icon={TrendingUp} />
        <StatCard label="Active Automations" value="0 / 0" icon={Zap} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Scheduled Tweets Queue" icon={Clock}>
            {scheduledPosts.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-400">
                No tweets scheduled yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {scheduledPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2"
                  >
                    <p className="line-clamp-1 text-sm text-neutral-700">
                      {post.content}
                    </p>
                    <span className="shrink-0 text-xs text-neutral-400">
                      {post.scheduledFor
                        ? new Date(post.scheduledFor).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
        <Panel title="Connected Accounts">
          <button className="w-full rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
            Manage Accounts
          </button>
        </Panel>
      </div>
    </div>
  );
}