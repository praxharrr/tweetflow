"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Minus, Loader2, Search, PenSquare } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AIEmptyState from "@/components/ai-tools/AIEmptyState";
import CardSkeleton from "@/components/ai-tools/CardSkeleton";
import HappeningNow from "@/components/trending-topics/HappeningNow";

const EXAMPLE_NICHES = ["AI tools and tech", "Personal finance", "Fitness", "Indie games"];

const VOLUME_LEVEL: Record<string, number> = { high: 1, medium: 0.6, low: 0.3 };

const MOMENTUM_META: Record<string, { icon: typeof TrendingUp; label: string }> = {
  rising: { icon: TrendingUp, label: "Rising" },
  steady: { icon: Minus, label: "Steady" },
  falling: { icon: TrendingDown, label: "Falling" },
};

interface Topic {
  topic: string;
  why: string;
  angle: string;
  momentum?: "rising" | "steady" | "falling";
  volume?: "high" | "medium" | "low";
}

export default function TrendingTopicsPage() {
  const router = useRouter();
  const [niche, setNiche] = useState("AI tools and tech");
  const [topics, setTopics] = useState<Topic[]>([]);
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
      const res = await fetch("/api/trending-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: searchNiche }),
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

  function draftAbout(topic: Topic) {
    router.push(`/compose?topic=${encodeURIComponent(`${topic.topic} — ${topic.angle}`)}`);
  }

  return (
    <div>
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
              <TrendingUp size={13} className="[stroke-width:1.75] text-primary" />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                Discover
              </span>
            </div>

            <h1 className="mt-3 bg-gradient-to-br from-white via-white to-white/45 bg-clip-text text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-transparent">
              Trending Topics
            </h1>

            <p className="mt-2 max-w-md text-body-sm text-white/50">
              Real-time web search for what&apos;s actually trending in your niche.
            </p>
          </div>

          <div className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/25 p-1.5 pl-3 transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(29,155,240,0.12)]">
            <input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Your niche or topic…"
              aria-label="Your niche or topic"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="min-w-0 flex-1 bg-transparent text-body-sm text-mono-ink outline-none placeholder:text-mono-ink-faint"
            />
            <Button
              variant="primary"
              magnetic={false}
              onClick={() => handleSearch()}
              disabled={!niche.trim() || isLoading}
              className="shrink-0"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {isLoading ? "Searching…" : "Find Trends"}
            </Button>
          </div>
        </div>
      </header>

      <div className="mt-6">
        <HappeningNow />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2 lg:grid-cols-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}

        {!hasSearched && !isLoading && (
          <AIEmptyState
            message="Enter a niche and search to see what's trending right now, ranked by momentum."
            examples={EXAMPLE_NICHES}
            onPick={handleSearch}
          />
        )}

        {hasSearched && !isLoading && topics.length === 0 && (
          <div className="col-span-full py-16 text-center text-body-sm text-mono-ink-faint">
            {errorMsg ?? "Couldn't find trends for that — try a broader niche."}
          </div>
        )}

        {!isLoading &&
          topics.map((t, i) => {
            const momentum = t.momentum && MOMENTUM_META[t.momentum] ? MOMENTUM_META[t.momentum] : null;
            const MomentumIcon = momentum?.icon;
            const volumeLevel = t.volume ? (VOLUME_LEVEL[t.volume] ?? 0.5) : null;

            return (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 rounded-full border border-primary/30 bg-primary/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-primary">
                    #{i + 1}
                  </span>
                  <h3 className="text-body-sm font-semibold text-mono-ink">{t.topic}</h3>
                </div>

                {(momentum || volumeLevel !== null) && (
                  <div className="mt-2.5 flex items-center gap-3">
                    {momentum && MomentumIcon && (
                      <span
                        className="flex items-center gap-1 text-caption"
                        style={{
                          color:
                            t.momentum === "rising"
                              ? "var(--color-success)"
                              : t.momentum === "falling"
                              ? "var(--color-mono-ink-faint)"
                              : undefined,
                        }}
                      >
                        <MomentumIcon size={12} className="[stroke-width:1.5]" />
                        {momentum.label}
                      </span>
                    )}
                    {volumeLevel !== null && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-caption text-mono-ink-faint">Volume</span>
                        <div className="h-1 w-14 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#1a8cd8] to-[#4db5f5]"
                            style={{ width: `${volumeLevel * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <p className="mt-2.5 text-body-sm text-mono-ink-soft">{t.why}</p>
                <p className="mt-2 rounded-md bg-black/40 p-2 text-caption text-mono-ink-faint">
                  <span className="font-medium text-mono-ink-subtle">Tweet angle: </span>
                  {t.angle}
                </p>
                <button
                  onClick={() => draftAbout(t)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-primary/25 py-1.5 text-caption font-medium text-primary transition-all duration-150 hover:border-primary/50 hover:bg-primary/[0.08]"
                >
                  <PenSquare size={12} className="[stroke-width:1.25]" />
                  Draft a tweet about this
                </button>
              </Card>
            );
          })}
      </div>
    </div>
  );
}