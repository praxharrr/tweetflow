"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  X,
  Sparkles,
  Loader2,
  Save,
  CalendarClock,
  Check,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Scissors,
  MessagesSquare,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CharRing from "@/components/ui/CharRing";
import TwoColumnLayout from "@/components/ui/TwoColumnLayout";
import TweetPreview from "@/components/tweet-preview/TweetPreview";
import { splitIntoThread } from "@/lib/splitIntoThread";

const MAX_CHARS = 280;

export default function ThreadComposer({
  displayName,
  handle,
}: {
  displayName: string;
  handle: string;
}) {
  const router = useRouter();
  const [tweets, setTweets] = useState<string[]>([""]);
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState<"draft" | "scheduled" | null>(null);
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [splitText, setSplitText] = useState("");
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function updateTweet(index: number, value: string) {
    setTweets((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  function addTweet() {
    setTweets((prev) => [...prev, ""]);
  }

  function removeTweet(index: number) {
    setTweets((prev) => prev.filter((_, i) => i !== index));
  }

  function moveTweet(index: number, direction: -1 | 1) {
    setTweets((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleDrop(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    setDragOverIndex(null);
    if (from === null || from === index) return;
    setTweets((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
  }

  function handleSplit() {
    const chunks = splitIntoThread(splitText);
    if (chunks.length === 0) return;
    setTweets(chunks);
    setSplitText("");
    setIsSplitOpen(false);
  }

  async function handleAIAssist() {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic }),
      });
      const data = await res.json();
      if (Array.isArray(data.tweets) && data.tweets.length > 0) {
        setTweets(data.tweets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave(status: "draft" | "scheduled") {
    const validTweets = tweets.map((t) => t.trim()).filter(Boolean);
    if (validTweets.length === 0) return;
    if (status === "scheduled" && !scheduledFor) return;

    setIsSaving(true);
    setSaved(null);
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tweets: validTweets,
          status,
          scheduledFor:
            status === "scheduled" ? new Date(scheduledFor).toISOString() : undefined,
        }),
      });
      if (res.ok) {
        setSaved(status);
        router.refresh();
        setTimeout(() => setSaved(null), 2000);
        if (status === "scheduled") {
          setTweets([""]);
          setScheduledFor("");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  const previewTweets = tweets.map((t) => t.trim()).filter(Boolean);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta || isSaving) return;

      if (e.key === "Enter") {
        if (scheduledFor) {
          e.preventDefault();
          handleSave("scheduled");
        }
      } else if (e.key.toLowerCase() === "s") {
        if (previewTweets.length > 0) {
          e.preventDefault();
          handleSave("draft");
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <TwoColumnLayout
      left={
        <Card className="relative isolate overflow-hidden p-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-24 -z-10 h-48 w-96 rounded-full opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(29,155,240,0.20), rgba(29,155,240,0) 70%)",
            }}
          />

          <div role="status" aria-live="polite" className="sr-only">
            {saved === "draft" && "Thread saved as draft"}
            {saved === "scheduled" && "Thread scheduled"}
          </div>

          <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/25 p-1.5 pl-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_3px_rgba(29,155,240,0.12)]">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Give AI a topic to turn into a full thread…"
              aria-label="AI thread topic"
              className="min-w-0 flex-1 bg-transparent text-body-sm text-mono-ink outline-none placeholder:text-mono-ink-faint"
            />
            <button
              type="button"
              onClick={handleAIAssist}
              disabled={!topic.trim() || isGenerating}
              className="group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-lg border border-primary/25 bg-primary/[0.08] px-3.5 py-2 text-button font-semibold text-primary transition-all duration-200 hover:border-primary/50 hover:bg-primary/[0.15] hover:shadow-[0_0_20px_-4px_rgba(29,155,240,0.5)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isGenerating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles
                  size={16}
                  className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                />
              )}
              {isGenerating ? "Writing…" : "Generate Thread"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSplitOpen((v) => !v)}
            className="mb-3 flex items-center gap-1.5 text-body-sm text-mono-ink-subtle transition-colors duration-150 hover:text-mono-ink"
          >
            <Scissors size={14} className="[stroke-width:1.25]" />
            Split long text into a thread
          </button>

          {isSplitOpen && (
            <div className="mb-4 rounded-xl border border-mono-hairline bg-black/20 p-3">
              <textarea
                value={splitText}
                onChange={(e) => setSplitText(e.target.value)}
                rows={4}
                placeholder="Paste a long paragraph — it’ll be broken into 280-character tweets at sentence boundaries…"
                aria-label="Long text to split into a thread"
                className="w-full resize-none bg-transparent text-body-sm text-mono-ink outline-none placeholder:text-mono-ink-faint"
              />
              <div className="mt-2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  magnetic={false}
                  onClick={handleSplit}
                  disabled={!splitText.trim()}
                  className="text-caption"
                >
                  Split into {splitIntoThread(splitText).length || "…"} tweets
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col">
            {tweets.map((tweet, index) => {
              const charCount = tweet.length;
              return (
                <div
                  key={index}
                  className={`relative flex gap-3 transition-opacity duration-150 ${
                    dragOverIndex === index ? "opacity-60" : "opacity-100"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverIndex(index);
                  }}
                  onDragLeave={() =>
                    setDragOverIndex((prev) => (prev === index ? null : prev))
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(index);
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div
                        aria-hidden
                        className="absolute inset-0 -z-10 rounded-full bg-primary/40 blur-md"
                      />
                      <div
                        draggable
                        onDragStart={() => {
                          dragIndex.current = index;
                        }}
                        onDragEnd={() => setDragOverIndex(null)}
                        className="relative flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-full bg-gradient-to-b from-[#3aa8f2] to-[#1a8cd8] font-mono text-[10px] font-semibold text-white shadow-[0_2px_10px_-3px_rgba(29,155,240,0.7)] ring-1 ring-inset ring-white/20 active:cursor-grabbing"
                        aria-hidden
                      >
                        {index + 1}
                      </div>
                    </div>
                    {index < tweets.length - 1 && (
                      <div className="my-1 w-px flex-1 bg-gradient-to-b from-primary/50 to-mono-hairline-strong" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pb-4">
                    <div className="rounded-xl border border-mono-hairline bg-gradient-to-b from-white/[0.025] to-transparent p-3 shadow-[0_1px_0_rgba(255,255,255,0.04),0_10px_28px_-16px_rgba(0,0,0,0.85)] transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-[0_1px_0_rgba(255,255,255,0.04),0_10px_28px_-16px_rgba(0,0,0,0.85),0_0_0_3px_rgba(29,155,240,0.12)]">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-caption font-medium text-mono-ink-faint">
                          <GripVertical size={12} className="[stroke-width:1.25]" />
                          Tweet {index + 1}/{tweets.length}
                        </div>
                        <div className="flex items-center gap-2">
                          <CharRing count={charCount} max={MAX_CHARS} size={18} />
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => moveTweet(index, -1)}
                              disabled={index === 0}
                              className="text-mono-ink-faint transition-colors duration-150 hover:text-mono-ink disabled:opacity-20"
                              aria-label="Move up"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveTweet(index, 1)}
                              disabled={index === tweets.length - 1}
                              className="text-mono-ink-faint transition-colors duration-150 hover:text-mono-ink disabled:opacity-20"
                              aria-label="Move down"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                          {tweets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTweet(index)}
                              className="text-mono-ink-faint transition-colors duration-150 hover:text-red-400"
                              aria-label="Remove tweet"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <textarea
                        value={tweet}
                        onChange={(e) => updateTweet(index, e.target.value)}
                        rows={3}
                        placeholder={`Write tweet ${index + 1}…`}
                        aria-label={`Tweet ${index + 1} content`}
                        className="w-full resize-none border-none bg-transparent p-0 text-body-sm text-mono-ink outline-none placeholder:text-mono-ink-faint"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addTweet}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-mono-hairline-strong px-3 py-2.5 text-body-sm text-mono-ink-subtle transition-all duration-150 hover:border-primary/40 hover:bg-primary/[0.04] hover:text-mono-ink"
          >
            <Plus size={16} className="[stroke-width:1.5]" />
            Add tweet
          </button>

          <div className="mt-5 flex flex-col gap-3 border-t border-mono-hairline pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-xl border border-mono-hairline bg-black/30 px-3 py-1.5">
              <CalendarClock size={16} className="[stroke-width:1.5] text-primary" />
              <input
                type="datetime-local"
                aria-label="Scheduled date and time"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="bg-transparent text-body-sm text-mono-ink outline-none [color-scheme:dark]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSave("draft")}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : saved === "draft" ? (
                  <Check size={16} />
                ) : (
                  <Save size={16} />
                )}
                {saved === "draft" ? "Saved" : "Save Draft"}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => handleSave("scheduled")}
                disabled={isSaving || !scheduledFor}
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : saved === "scheduled" ? (
                  <Check size={16} />
                ) : (
                  <CalendarClock size={16} />
                )}
                {saved === "scheduled" ? "Scheduled" : "Schedule Thread"}
              </Button>
            </div>
          </div>
        </Card>
      }
      right={
        <Card className="relative isolate overflow-hidden p-4">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-14 -top-16 -z-10 h-40 w-64 rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(120,86,255,0.22), rgba(120,86,255,0) 70%)",
            }}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-eyebrow uppercase text-white/40">
                Thread Preview
              </span>
              {previewTweets.length > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
                  {previewTweets.length}
                </span>
              )}
            </div>
            <MessagesSquare
              size={15}
              className="shrink-0 [stroke-width:1.25] text-mono-ink-subtle"
            />
          </div>

          <div className="mt-3 flex flex-col">
            {previewTweets.length === 0 ? (
              <p className="text-body-sm text-mono-ink-faint">
                Your thread preview will appear here as you write.
              </p>
            ) : (
              previewTweets.map((content, index) => (
                <div key={index} className="relative flex gap-2">
                  <div className="flex flex-col items-center">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_6px_-1px_rgba(29,155,240,0.8)]" />
                    {index < previewTweets.length - 1 && (
                      <div className="my-1 w-px flex-1 bg-gradient-to-b from-primary/40 to-mono-hairline-strong" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-3">
                    <TweetPreview
                      displayName={displayName}
                      handle={handle}
                      content={content}
                      badge={`${index + 1}/${previewTweets.length}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      }
    />
  );
}