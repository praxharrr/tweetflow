"use client";

import { useState, ReactNode } from "react";
import { Search } from "lucide-react";
import AmbientPulse from "@/components/ui/AmbientPulse";

export default function AIEmptyState({
  message,
  examples,
  onPick,
  icon,
  showInlineSearch,
}: {
  message: string;
  examples: string[];
  onPick: (example: string) => void;
  icon?: ReactNode;
  showInlineSearch?: boolean;
}) {
  const [value, setValue] = useState("");

  function submit() {
    if (value.trim()) onPick(value.trim());
  }

  return (
    <div className="col-span-full flex flex-col items-center gap-4 rounded-lg border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.015] py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.3)] backdrop-blur-xl">
      {icon ?? <AmbientPulse />}
      <p className="max-w-xs text-body-sm text-mono-ink-subtle">{message}</p>

      {showInlineSearch && (
        <div className="flex w-full max-w-xs items-center gap-1.5 rounded-xl border border-white/[0.08] bg-black/25 px-2.5 py-1.5 transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(29,155,240,0.12)]">
          <Search size={13} className="shrink-0 [stroke-width:1.75] text-mono-ink-faint" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Search a niche…"
            aria-label="Search a niche"
            className="min-w-0 flex-1 bg-transparent text-caption text-mono-ink outline-none placeholder:text-mono-ink-faint"
          />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-1.5">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onPick(example)}
            className="rounded-full border border-mono-hairline px-3 py-1.5 text-caption text-mono-ink-subtle transition-colors duration-150 hover:bg-white/[0.06] hover:text-mono-ink"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}