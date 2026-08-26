"use client";

import { useState } from "react";
import { Clock3, Loader2, Search, Users } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AIEmptyState from "@/components/ai-tools/AIEmptyState";
import CardSkeleton from "@/components/ai-tools/CardSkeleton";
import PostingTimeHeatmap from "@/components/ai-tools/PostingTimeHeatmap";
import PredictiveArcBackground from "@/components/dashboard/PredictiveArcBackground";

const EXAMPLE_NICHES = ["AI tools and tech", "Personal finance", "Fitness", "Indie games"];

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

  async function handleSearch(nicheOverride?: string) {
    const searchNiche = nicheOverride ?? niche;
    if (!searchNiche.trim()) return;
    if (nicheOverride) setNiche(nicheOverride);
    setIsLoading(true);
    setHasSearched(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/best-posting-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: searchNiche, timezone }),
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
    <div className="relative min-h-screen">
      <PredictiveArcBackground />

      <header className="relative isolate overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] px-7 py-7 backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-28 -z-10 h-64 w-[32rem] rounded-full opacity-70 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(29,155,240,0.28), rgba(29,155,240,0) 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-16 -z-10 h-56 w-80 rounded-full opacity-45 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(120,86,255,0.25), rgba(120,86,255,0) 70%)",
          }}
        />

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Clock3 size={13} className="[stroke-width:1.75] text-primary" />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                Discover
              </span>
            </div>

            <h1 className="mt-3 bg-gradient-to-br from-white via-white to-white/45 bg-clip-text text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-transparent">
              Best Posting Times
            </h1>

            <p className="mt-2 max-w-md text-body-sm text-white/50">
              Your general engagement pattern, plus research-backed windows for your niche.
            </p>
          </div>

          <div className="flex w-full max-w-lg items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/25 p-1.5 pl-3 transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(29,155,240,0.12)]">
            <input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Your niche or topic…"
              aria-label="Your niche or topic"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="min-w-0 flex-1 bg-transparent text-body-sm text-mono-ink outline-none placeholder:text-mono-ink-faint"
            />
            <input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Timezone"
              aria-label="Timezone"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-16 shrink-0 border-l border-white/[0.08] bg-transparent px-2 text-body-sm text-mono-ink outline-none placeholder:text-mono-ink-faint"
            />
            <Button
              variant="primary"
              magnetic={false}
              onClick={() => handleSearch()}
              disabled={!niche.trim() || isLoading}
              className="shrink-0"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {isLoading ? "Thinking…" : "Get Times"}
            </Button>
          </div>
        </div>
      </header>

      <div className="mt-6">
        <PostingTimeHeatmap />
      </div>

      <div className="mt-8 flex items-center gap-2">
        <span className="text-eyebrow uppercase text-white/40">Research for your niche</span>
        <div className="h-px flex-1 bg-mono-hairline" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {isLoading && Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}

        {!hasSearched && !isLoading && (
          <AIEmptyState
            message="Enter your niche for research-backed windows layered on top of the general pattern above."
            examples={EXAMPLE_NICHES}
            onPick={handleSearch}
          />
        )}

        {hasSearched && !isLoading && windows.length === 0 && (
          <div className="col-span-full py-16 text-center text-body-sm text-mono-ink-faint">
            {errorMsg ?? "Couldn't generate recommendations — try a different niche."}
          </div>
        )}

        {!isLoading &&
          windows.map((w, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/[0.1]">
                  <Clock3 size={13} className="[stroke-width:1.5] text-primary" />
                </span>
                <h3 className="text-body-sm font-semibold text-mono-ink">{w.window}</h3>
              </div>
              <div className="mt-2 flex items-start gap-2 text-caption text-mono-ink-faint">
                <Users size={14} className="mt-0.5 shrink-0 [stroke-width:1.25]" />
                <span>{w.audience}</span>
              </div>
              <p className="mt-2 text-body-sm text-mono-ink-soft">{w.reason}</p>
            </Card>
          ))}
      </div>
    </div>
  );
}