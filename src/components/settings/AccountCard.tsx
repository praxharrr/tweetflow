"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LogOut, Loader2 } from "lucide-react";

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
      
     <a  href="/api/auth/twitter/connect"
        className="block w-full max-w-md rounded-lg border border-neutral-200 bg-white py-3 text-center text-sm font-medium text-neutral-600 hover:bg-neutral-50"
      >
        Connect X Account
      </a>
    );
  }

  return (
    <div className="flex max-w-md items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={16} className="text-emerald-600" />
        <span className="text-sm font-medium text-emerald-700">@{username}</span>
      </div>
      <button
        onClick={handleDisconnect}
        disabled={isDisconnecting}
        className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-red-600 disabled:opacity-40"
      >
        {isDisconnecting ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
        Disconnect
      </button>
    </div>
  );
}