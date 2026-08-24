"use client";

import { useState } from "react";
import { Clock3, Loader2, Search, Users } from "lucide-react";

interface Window {
  window: string;
  audience: string;
  reason: string;
}

export default function BestPostingTimesPage() {
  const [niche, setNiche] = useState("AI tools and tech");
  const [timezone, setTimezone] = useState("IST");
  const [windows, setWindows] = useState<Window[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSearch() {
    if (!niche.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/best-posting-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, timezone }),
      });
      const data = await res.json();
      setWindows(data.windows ?? []);
      if (data.error) setErrorMsg(data.error);
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong — try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Best Posting Times</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Research-backed posting windows for your niche and timezone.
      </p>

      <div className="mt-6 flex max-w-xl gap-2">
        <input
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="Your niche or topic..."
          className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
        <input
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          placeholder="Timezone"
          className="w-24 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
        <button
          onClick={handleSearch}
          disabled={!niche.trim() || isLoading}
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-40"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {isLoading ? "Thinking..." : "Get Times"}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {!hasSearched && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-16 text-center">
            <Clock3 size={28} className="text-neutral-300" />
            <p className="mt-3 text-sm text-neutral-400">
              Enter your niche to get suggested posting windows.
            </p>
          </div>
        )}

        {hasSearched && !isLoading && windows.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-neutral-400">
            {errorMsg ?? "Couldn't generate recommendations — try a different niche."}
          </div>
        )}

        {windows.map((w, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-start gap-2">
              <Clock3 size={16} className="mt-0.5 shrink-0 text-blue-500" />
              <h3 className="text-sm font-semibold text-neutral-900">{w.window}</h3>
            </div>
            <div className="mt-2 flex items-start gap-2 text-xs text-neutral-500">
              <Users size={14} className="mt-0.5 shrink-0" />
              <span>{w.audience}</span>
            </div>
            <p className="mt-2 text-sm text-neutral-600">{w.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}