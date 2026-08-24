"use client";

import { useState } from "react";
import { Flame, Loader2, Search } from "lucide-react";

interface Opportunity {
  opportunity: string;
  context: string;
  reply: string;
}

export default function ViralOpportunitiesPage() {
  const [niche, setNiche] = useState("AI tools and tech");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSearch() {
    if (!niche.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/viral-opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche }),
      });
      const data = await res.json();
      setOpportunities(data.opportunities ?? []);
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
      <h1 className="text-2xl font-bold text-neutral-900">Viral Opportunities</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Real conversations happening right now you could jump into.
      </p>

      <div className="mt-6 flex max-w-xl gap-2">
        <input
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="Your niche or topic..."
          className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
        <button
          onClick={handleSearch}
          disabled={!niche.trim() || isLoading}
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-40"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {isLoading ? "Searching..." : "Find Opportunities"}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {!hasSearched && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-16 text-center">
            <Flame size={28} className="text-neutral-300" />
            <p className="mt-3 text-sm text-neutral-400">
              Enter a niche and search to see what&apos;s active right now.
            </p>
          </div>
        )}

        {hasSearched && !isLoading && opportunities.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-neutral-400">
            {errorMsg ?? "Couldn't find anything for that — try a broader niche."}
          </div>
        )}

        {opportunities.map((o, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-start gap-2">
              <Flame size={16} className="mt-0.5 shrink-0 text-orange-500" />
              <h3 className="text-sm font-semibold text-neutral-900">{o.opportunity}</h3>
            </div>
            <p className="mt-2 text-sm text-neutral-600">{o.context}</p>
            <p className="mt-2 rounded-lg bg-neutral-50 p-2 text-xs text-neutral-500">
              <span className="font-medium text-neutral-700">Suggested angle: </span>
              {o.reply}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}