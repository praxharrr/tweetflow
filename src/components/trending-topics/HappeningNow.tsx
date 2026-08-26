"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowUp, MessageCircle, Search, X } from "lucide-react";
import Card from "@/components/ui/Card";

interface Story {
  id: string;
  title: string;
  url: string;
  points: number;
  comments: number;
  createdAt: string;
}

function timeAgo(iso: string) {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "news.ycombinator.com";
  }
}

async function fetchStories(q: string): Promise<Story[]> {
  const url = q ? `/api/hn-trends?q=${encodeURIComponent(q)}` : "/api/hn-trends";
  const res = await fetch(url);
  const data = await res.json();
  return data.stories ?? [];
}

export default function HappeningNow() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  useEffect(() => {
    let ignore = false;
    fetchStories("")
      .then((data) => {
        if (!ignore) setStories(data);
      })
      .catch(() => {
        if (!ignore) setStories([]);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  function handleSearch() {
    const q = query.trim();
    setActiveQuery(q);
    setIsLoading(true);
    fetchStories(q)
      .then(setStories)
      .catch(() => setStories([]))
      .finally(() => setIsLoading(false));
  }

  function handleClear() {
    setQuery("");
    setActiveQuery("");
    setIsLoading(true);
    fetchStories("")
      .then(setStories)
      .catch(() => setStories([]))
      .finally(() => setIsLoading(false));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-eyebrow uppercase text-white/40">
            {activeQuery ? `Results for "${activeQuery}"` : "Happening Now"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-black/25 px-2.5 py-1.5 transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(29,155,240,0.12)]">
            <Search size={13} className="shrink-0 [stroke-width:1.75] text-mono-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search Hacker News…"
              aria-label="Search Hacker News"
              className="w-36 bg-transparent text-caption text-mono-ink outline-none placeholder:text-mono-ink-faint sm:w-48"
            />
            {activeQuery && (
              <button
                onClick={handleClear}
                aria-label="Clear search"
                className="shrink-0 text-mono-ink-faint hover:text-mono-ink"
              >
                <X size={12} />
              </button>
            )}
          </div>

          
          <a  href={
              activeQuery
                ? `https://hn.algolia.com/?q=${encodeURIComponent(activeQuery)}`
                : "https://news.ycombinator.com/"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 items-center gap-1 text-caption font-medium text-primary hover:underline sm:flex"
          >
            Read all
            <ArrowUpRight size={12} className="[stroke-width:2]" />
          </a>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse p-3.5">
              <div className="h-5 w-5 rounded bg-white/[0.08]" />
              <div className="mt-3 h-3.5 w-full rounded bg-white/[0.06]" />
              <div className="mt-1.5 h-3.5 w-2/3 rounded bg-white/[0.06]" />
              <div className="mt-3 h-3 w-16 rounded bg-white/[0.04]" />
            </Card>
          ))}

        {!isLoading && stories.length === 0 && (
          <div className="col-span-full py-10 text-center text-caption text-mono-ink-faint">
            No results for &quot;{activeQuery}&quot; — try a different search.
          </div>
        )}

        {!isLoading &&
          stories.map((story) => {
            const domain = hostnameOf(story.url);
            return (
              <a key={story.id} href={story.url} target="_blank" rel="noopener noreferrer">
                <Card className="group flex h-full flex-col p-3.5 transition-all duration-150 hover:-translate-y-0.5 hover:border-mono-hairline-strong hover:shadow-[0_14px_32px_-16px_rgba(0,0,0,0.7)]">
                  <div className="flex items-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
                      alt=""
                      width={16}
                      height={16}
                      className="h-4 w-4 shrink-0 rounded-sm"
                      loading="lazy"
                    />
                    <span className="truncate text-[11px] text-mono-ink-faint">{domain}</span>
                  </div>

                  <h3 className="mt-2 line-clamp-3 flex-1 text-body-sm font-medium leading-snug text-mono-ink transition-colors group-hover:text-primary">
                    {story.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-2.5 text-caption text-mono-ink-faint">
                    <span className="flex items-center gap-1">
                      <ArrowUp size={11} className="[stroke-width:2]" />
                      {story.points}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={11} className="[stroke-width:2]" />
                      {story.comments}
                    </span>
                    <span>{timeAgo(story.createdAt)}</span>
                  </div>
                </Card>
              </a>
            );
          })}
      </div>
    </div>
  );
}