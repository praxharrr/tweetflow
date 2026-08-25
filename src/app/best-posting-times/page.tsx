"use client";

import { useState } from "react";
import { Clock3, Loader2, Search, Users } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/field-styles";
import AIEmptyState from "@/components/ai-tools/AIEmptyState";
import CardSkeleton from "@/components/ai-tools/CardSkeleton";
import PostingTimeHeatmap from "@/components/ai-tools/PostingTimeHeatmap";

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
    <div>
      <PageHeader
        title="Best Posting Times"
        subtitle="Your general engagement pattern, plus research-backed windows for your niche."
      />

      <div className="mt-6">
        <PostingTimeHeatmap />
      </div>

      <div className="mt-8 flex items-center gap-2">
        <span className="text-eyebrow uppercase text-white/40">Research for your niche</span>
        <div className="h-px flex-1 bg-mono-hairline" />
      </div>

      <div className="mt-4 flex max-w-xl gap-2">
        <input
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="Your niche or topic…"
          aria-label="Your niche or topic"
          className={`${fieldClass} min-w-0 flex-1`}
        />
        <input
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          placeholder="Timezone"
          aria-label="Timezone"
          className={`${fieldClass} !w-24 shrink-0`}
        />
        <Button
          variant="primary"
          onClick={() => handleSearch()}
          disabled={!niche.trim() || isLoading}
          className="shrink-0"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {isLoading ? "Thinking…" : "Get Times"}
        </Button>
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
                <Clock3 size={16} className="mt-0.5 shrink-0 [stroke-width:1.25] text-mono-ink-subtle" />
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
