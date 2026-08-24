import { prisma } from "@/lib/prisma";
import AccountCard from "@/components/settings/AccountCard";

export default async function SettingsPage() {
  const twitterAccount = await prisma.twitterAccount.findFirst();

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Manage your connected accounts and workspace.
      </p>

      <div className="mt-6 max-w-md rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-800">Connected Accounts</h2>
        <p className="mt-1 text-xs text-neutral-400">
          Tweetflow posts to X on your behalf using this connection.
        </p>
        <div className="mt-4">
          <AccountCard username={twitterAccount?.username ?? null} />
        </div>
      </div>
    </div>
  );
}