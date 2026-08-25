"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Minus, Loader2, Search, PenSquare } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/field-styles";
import AIEmptyState from "@/components/ai-tools/AIEmptyState";
import CardSkeleton from "@/components/ai-tools/CardSkeleton";

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
      <PageHeader
        title="Trending Topics"
        subtitle="Real-time web search for what's actually trending in your niche."
      />

      <div className="mt-6 flex max-w-xl gap-2">
        <input
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="Your niche or topic…"
          aria-label="Your niche or topic"
          className={fieldClass}
        />
        <Button
          variant="primary"
          onClick={() => handleSearch()}
          disabled={!niche.trim() || isLoading}
          className="shrink-0"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {isLoading ? "Searching…" : "Find Trends"}
        </Button>
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
                  <span className="mt-0.5 shrink-0 rounded-full border border-mono-hairline-strong px-1.5 py-0.5 font-mono text-[10px] text-mono-ink-faint">
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
                            className="h-full rounded-full bg-white/50"
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
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-mono-hairline-strong py-1.5 text-caption font-medium text-mono-ink transition-colors duration-150 hover:bg-white/[0.06]"
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
