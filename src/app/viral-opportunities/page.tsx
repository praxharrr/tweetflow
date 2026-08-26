"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Loader2, Search, Reply, Activity } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AIEmptyState from "@/components/ai-tools/AIEmptyState";
import CardSkeleton from "@/components/ai-tools/CardSkeleton";
import PredictiveArcBackground from "@/components/dashboard/PredictiveArcBackground";
import { BrandOrbs } from "@designcodeio/threeui";

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
              <Flame size={13} className="[stroke-width:1.75] text-primary" />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                Discover
              </span>
            </div>

            <h1 className="mt-3 bg-gradient-to-br from-white via-white to-white/45 bg-clip-text text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-transparent">
              Viral Opportunities
            </h1>

            <p className="mt-2 max-w-md text-body-sm text-white/50">
              Real conversations happening right now you could jump into.
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
              {isLoading ? "Searching…" : "Find Opportunities"}
            </Button>
          </div>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-2 lg:grid-cols-2">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}

        {!hasSearched && !isLoading && (
          <AIEmptyState
            message="Enter a niche and search to see what's active right now, with real context on why it matters."
            examples={EXAMPLE_NICHES}
            onPick={handleSearch}
            icon={<BrandOrbs variant="x" size="medium" mode="dark" />}
            showInlineSearch
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
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/[0.1]">
                  <Flame size={13} className="[stroke-width:1.5] text-primary" />
                </span>
                <h3 className="text-body-sm font-semibold text-mono-ink">{o.opportunity}</h3>
              </div>

              {o.originalPost && (
                <blockquote className="mt-2.5 border-l-2 border-primary/40 pl-3 text-body-sm italic text-mono-ink-soft">
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
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-primary/25 py-1.5 text-caption font-medium text-primary transition-all duration-150 hover:border-primary/50 hover:bg-primary/[0.08]"
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