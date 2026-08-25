"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Loader2, Search, Reply, Activity } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/field-styles";
import AIEmptyState from "@/components/ai-tools/AIEmptyState";
import CardSkeleton from "@/components/ai-tools/CardSkeleton";

const EXAMPLE_NICHES = ["AI tools and tech", "Personal finance", "Fitness", "Indie games"];

interface Opportunity {
  opportunity: string;
  originalPost?: string;
  context: string;
  reply: string;
  engagement?: string;
}

export default function ViralOpportunitiesPage() {
  const router = useRouter();
  const [niche, setNiche] = useState("AI tools and tech");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
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
      const res = await fetch("/api/viral-opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: searchNiche }),
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

  function draftReply(o: Opportunity) {
    router.push(`/compose?topic=${encodeURIComponent(`Reply to: ${o.opportunity} — ${o.reply}`)}`);
  }

  return (
    <div>
      <PageHeader
        title="Viral Opportunities"
        subtitle="Real conversations happening right now you could jump into."
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
          {isLoading ? "Searching…" : "Find Opportunities"}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2 lg:grid-cols-2">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}

        {!hasSearched && !isLoading && (
          <AIEmptyState
            message="Enter a niche and search to see what's active right now, with real context on why it matters."
            examples={EXAMPLE_NICHES}
            onPick={handleSearch}
          />
        )}

        {hasSearched && !isLoading && opportunities.length === 0 && (
          <div className="col-span-full py-16 text-center text-body-sm text-mono-ink-faint">
            {errorMsg ?? "Couldn't find anything for that — try a broader niche."}
          </div>
        )}

        {!isLoading &&
          opportunities.map((o, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-2">
                <Flame size={16} className="mt-0.5 shrink-0 [stroke-width:1.25] text-mono-ink-subtle" />
                <h3 className="text-body-sm font-semibold text-mono-ink">{o.opportunity}</h3>
              </div>

              {o.originalPost && (
                <blockquote className="mt-2.5 border-l-2 border-mono-hairline-strong pl-3 text-body-sm italic text-mono-ink-soft">
                  {o.originalPost}
                </blockquote>
              )}

              <div className="mt-2 flex items-center gap-1.5 text-caption text-mono-ink-faint">
                <Activity size={12} className="[stroke-width:1.25]" />
                {o.engagement ?? "Engagement figures not available"}
              </div>

              <p className="mt-2.5 text-body-sm text-mono-ink-soft">{o.context}</p>
              <p className="mt-2 rounded-md bg-black/40 p-2 text-caption text-mono-ink-faint">
                <span className="font-medium text-mono-ink-subtle">Suggested angle: </span>
                {o.reply}
              </p>
              <button
                onClick={() => draftReply(o)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-mono-hairline-strong py-1.5 text-caption font-medium text-mono-ink transition-colors duration-150 hover:bg-white/[0.06]"
              >
                <Reply size={12} className="[stroke-width:1.25]" />
                Draft a reply
              </button>
            </Card>
          ))}
      </div>
    </div>
  );
}
