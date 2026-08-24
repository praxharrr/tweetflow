"use client";

import { useState } from "react";
import { TrendingUp, Loader2, Search } from "lucide-react";

interface Topic {
  topic: string;
  why: string;
  angle: string;
}

export default function TrendingTopicsPage() {
  const [niche, setNiche] = useState("AI tools and tech");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSearch() {
    if (!niche.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/trending-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche }),
      });
      const data = await res.json();
      setTopics(data.topics ?? []);
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
      <h1 className="text-2xl font-bold text-neutral-900">Trending Topics</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Real-time web search for what&apos;s actually trending in your niche.
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
          {isLoading ? "Searching..." : "Find Trends"}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {!hasSearched && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-16 text-center">
            <TrendingUp size={28} className="text-neutral-300" />
            <p className="mt-3 text-sm text-neutral-400">
              Enter a niche and search to see what&apos;s trending right now.
            </p>
          </div>
        )}

        {hasSearched && !isLoading && topics.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-neutral-400">
            {errorMsg ?? "Couldn't find trends for that — try a broader niche."}
          </div>
        )}

        {topics.map((t, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-start gap-2">
              <TrendingUp size={16} className="mt-0.5 shrink-0 text-violet-500" />
              <h3 className="text-sm font-semibold text-neutral-900">{t.topic}</h3>
            </div>
            <p className="mt-2 text-sm text-neutral-600">{t.why}</p>
            <p className="mt-2 rounded-lg bg-neutral-50 p-2 text-xs text-neutral-500">
              <span className="font-medium text-neutral-700">Tweet angle: </span>
              {t.angle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}