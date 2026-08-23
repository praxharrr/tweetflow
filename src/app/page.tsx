import { MessageSquare, Clock, TrendingUp, Zap } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import Panel from "@/components/dashboard/Panel";

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Welcome back to Tweetflow.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tweets" value={0} icon={MessageSquare} />
        <StatCard label="Scheduled Posts" value={0} icon={Clock} />
        <StatCard label="Engagement Forecast" value="—" icon={TrendingUp} />
        <StatCard label="Active Automations" value="0 / 0" icon={Zap} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Scheduled Tweets Queue" icon={Clock}>
            <p className="py-6 text-center text-sm text-neutral-400">
              No tweets scheduled yet.
            </p>
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