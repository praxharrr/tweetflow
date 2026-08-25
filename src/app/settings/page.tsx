import { prisma } from "@/lib/prisma";
import AccountCard from "@/components/settings/AccountCard";
import PreferencesForm from "@/components/settings/PreferencesForm";
import DangerZone from "@/components/settings/DangerZone";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

export default async function SettingsPage() {
  const [twitterAccount, settings] = await Promise.all([
    prisma.twitterAccount.findFirst(),
    prisma.settings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton" },
      update: {},
    }),
  ]);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your connected accounts and workspace." />

      <div className="mt-6 grid grid-cols-1 items-start gap-2 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-card-title text-mono-ink">Connected Accounts</h2>
          <p className="mt-1 text-caption text-mono-ink-faint">
            Tweetflow posts to X on your behalf using this connection.
          </p>
          <div className="mt-4">
            <AccountCard username={twitterAccount?.username ?? null} />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-card-title text-mono-ink">Preferences</h2>
          <p className="mt-1 text-caption text-mono-ink-faint">
            Applied across composing, threads, and AI generation.
          </p>
          <div className="mt-4">
            <PreferencesForm
              settings={{
                displayName: settings.displayName,
                timezone: settings.timezone,
                defaultAiTone: settings.defaultAiTone,
                autoThreadNumbering: settings.autoThreadNumbering,
              }}
            />
          </div>
        </Card>
      </div>

      <div className="mt-2">
        <DangerZone />
      </div>
    </div>
  );
}
