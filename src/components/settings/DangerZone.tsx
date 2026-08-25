"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, RotateCcw, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";

export default function DangerZone() {
  const router = useRouter();
  const [busy, setBusy] = useState<"export" | "clear" | "reset" | null>(null);

  function handleExport() {
    setBusy("export");
    // Real browser download (Content-Disposition: attachment) — not a page
    // navigation, so router.push() would not trigger a file save here.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/export";
    setTimeout(() => setBusy(null), 800);
  }

  async function handleClearDrafts() {
    if (!window.confirm("Delete every draft? This can't be undone.")) return;
    setBusy("clear");
    try {
      await fetch("/api/posts?status=draft", { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function handleResetWorkspace() {
    if (
      !window.confirm(
        "Reset workspace? This permanently deletes every draft, scheduled tweet, and thread, and restores preferences to their defaults. Your connected account stays untouched. This can't be undone.",
      )
    )
      return;
    setBusy("reset");
    try {
      await fetch("/api/settings/reset", { method: "POST" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="p-5">
      <h2 className="text-card-title text-mono-ink">Danger Zone</h2>
      <p className="mt-1 text-caption text-mono-ink-faint">
        Destructive actions — each one is permanent.
      </p>

      <div className="mt-4 flex flex-col divide-y divide-mono-hairline">
        <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
          <div>
            <p className="text-body-sm text-mono-ink">Export all data</p>
            <p className="text-caption text-mono-ink-faint">
              Download every post, thread, and preference as JSON.
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={busy === "export"}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-mono-hairline-strong px-3 py-1.5 text-caption font-medium text-mono-ink transition-colors duration-150 hover:bg-white/[0.06] disabled:opacity-40"
          >
            {busy === "export" ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} className="[stroke-width:1.25]" />}
            Export
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className="text-body-sm text-mono-ink">Clear all drafts</p>
            <p className="text-caption text-mono-ink-faint">
              Deletes every saved draft. Scheduled tweets are untouched.
            </p>
          </div>
          <button
            onClick={handleClearDrafts}
            disabled={busy === "clear"}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-mono-hairline-strong px-3 py-1.5 text-caption font-medium text-mono-ink-subtle transition-colors duration-150 hover:border-red-900/50 hover:bg-red-950/30 hover:text-red-400 disabled:opacity-40"
          >
            {busy === "clear" ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} className="[stroke-width:1.25]" />}
            Clear drafts
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
          <div>
            <p className="text-body-sm text-mono-ink">Reset workspace</p>
            <p className="text-caption text-mono-ink-faint">
              Deletes all posts and restores preferences to defaults.
            </p>
          </div>
          <button
            onClick={handleResetWorkspace}
            disabled={busy === "reset"}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-mono-hairline-strong px-3 py-1.5 text-caption font-medium text-mono-ink-subtle transition-colors duration-150 hover:border-red-900/50 hover:bg-red-950/30 hover:text-red-400 disabled:opacity-40"
          >
            {busy === "reset" ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} className="[stroke-width:1.25]" />}
            Reset
          </button>
        </div>
      </div>
    </Card>
  );
}
