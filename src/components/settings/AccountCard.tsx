"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LogOut, Loader2, Check, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import Magnetic from "@/components/motion/Magnetic";

const UNLOCKS = [
  "Publish tweets and threads directly, on schedule",
  "See your real handle and avatar in every preview",
  "Auto-post from Queue instead of manual copy-paste",
];

const PERMISSIONS = [
  { scope: "users.read", label: "Read your profile info (name, handle, avatar)" },
  { scope: "tweet.read", label: "Read your tweets" },
  { scope: "tweet.write", label: "Post and schedule tweets on your behalf" },
  { scope: "offline.access", label: "Stay connected between sessions" },
];

export default function AccountCard({ username }: { username: string | null }) {
  const router = useRouter();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  async function handleDisconnect() {
    setIsDisconnecting(true);
    try {
      await fetch("/api/twitter-account", { method: "DELETE" });
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDisconnecting(false);
    }
  }

  if (!username) {
    return (
      <div>
        <Magnetic className="block w-full">
          <a
            href="/api/auth/twitter/connect"
            className="block w-full rounded-full border border-mono-hairline-strong py-2.5 text-center text-button text-mono-ink transition-colors duration-150 hover:bg-white/[0.06]"
          >
            Connect X Account
          </a>
        </Magnetic>
        <p className="mt-2 text-caption text-mono-ink-faint">
          Not connected yet — publishing stays disabled until you connect.
        </p>

        <div className="mt-5">
          <span className="text-eyebrow uppercase text-white/40">What connecting unlocks</span>
          <ul className="mt-2 flex flex-col gap-1.5">
            {UNLOCKS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-caption text-mono-ink-subtle">
                <Check size={12} className="mt-0.5 shrink-0 [stroke-width:1.5] text-mono-ink-faint" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <span className="text-eyebrow uppercase text-white/40">Permissions requested</span>
          <ul className="mt-2 flex flex-col gap-1.5">
            {PERMISSIONS.map((p) => (
              <li key={p.scope} className="flex items-start gap-2 text-caption text-mono-ink-subtle">
                <ShieldCheck size={12} className="mt-0.5 shrink-0 [stroke-width:1.5] text-mono-ink-faint" />
                <span>
                  {p.label}
                  <span className="ml-1.5 font-mono text-[10px] text-mono-ink-faint">{p.scope}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <span className="text-eyebrow uppercase text-white/40">Preview once connected</span>
          <div className="mt-2 flex items-center justify-between rounded-md border border-dashed border-mono-hairline-strong px-4 py-3 opacity-60">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="[stroke-width:1.25] text-mono-ink" />
              <span className="text-body-sm font-medium text-mono-ink">@yourhandle</span>
            </div>
            <span className="flex items-center gap-1 text-caption text-mono-ink-faint">
              <LogOut size={14} />
              Disconnect
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-mono-hairline-strong bg-mono-surface-2 px-4 py-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={16} className="[stroke-width:1.25] text-mono-ink" />
        <span className="text-body-sm font-medium text-mono-ink">@{username}</span>
      </div>
      <Button
        variant="ghost"
        magnetic={false}
        onClick={handleDisconnect}
        disabled={isDisconnecting}
        className="!px-0 !py-0 text-caption"
      >
        {isDisconnecting ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
        Disconnect
      </Button>
    </div>
  );
}
