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
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CharRing from "@/components/ui/CharRing";
import TwoColumnLayout from "@/components/ui/TwoColumnLayout";
import TweetPreview from "@/components/tweet-preview/TweetPreview";
import { fieldClass } from "@/components/ui/field-styles";
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
          scheduledFor: status === "scheduled" ? new Date(scheduledFor).toISOString() : undefined,
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
        <Card className="p-5">
          <div role="status" aria-live="polite" className="sr-only">
            {saved === "draft" && "Thread saved as draft"}
            {saved === "scheduled" && "Thread scheduled"}
          </div>

          <div className="mb-3 flex gap-2">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Give AI a topic to turn into a full thread…"
              aria-label="AI thread topic"
              className={fieldClass}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAIAssist}
              disabled={!topic.trim() || isGenerating}
              className="shrink-0"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isGenerating ? "Writing thread…" : "Generate Thread"}
            </Button>
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
            <div className="mb-4 rounded-md border border-mono-hairline p-3">
              <textarea
                value={splitText}
                onChange={(e) => setSplitText(e.target.value)}
                rows={4}
                placeholder="Paste a long paragraph — it’ll be broken into 280-character tweets at sentence boundaries…"
                aria-label="Long text to split into a thread"
                className={`${fieldClass} resize-none`}
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
                  onDragLeave={() => setDragOverIndex((prev) => (prev === index ? null : prev))}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(index);
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      draggable
                      onDragStart={() => {
                        dragIndex.current = index;
                      }}
                      onDragEnd={() => setDragOverIndex(null)}
                      className="flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-full border border-mono-hairline-strong bg-mono-surface-2 font-mono text-[10px] text-mono-ink-subtle active:cursor-grabbing"
                      aria-hidden
                    >
                      {index + 1}
                    </div>
                    {index < tweets.length - 1 && (
                      <div className="my-1 w-px flex-1 bg-mono-hairline-strong" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pb-4">
                    <div className="rounded-md border border-mono-hairline p-3">
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
            className="flex items-center gap-2 text-body-sm text-mono-ink-subtle transition-colors duration-150 hover:text-mono-ink"
          >
            <Plus size={16} className="[stroke-width:1.25]" />
            Add tweet
          </button>

          <div className="mt-5 flex flex-col gap-3 border-t border-mono-hairline pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock size={16} className="[stroke-width:1.25] text-mono-ink-subtle" />
              <input
                type="datetime-local"
                aria-label="Scheduled date and time"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className={`${fieldClass} !w-auto py-1.5`}
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
        <Card className="p-4">
          <span className="text-eyebrow uppercase text-white/40">Thread preview</span>
          <div className="mt-3 flex flex-col">
            {previewTweets.length === 0 ? (
              <p className="text-body-sm text-mono-ink-faint">
                Your thread preview will appear here as you write.
              </p>
            ) : (
              previewTweets.map((content, index) => (
                <div key={index} className="relative flex gap-2">
                  <div className="flex flex-col items-center">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                    {index < previewTweets.length - 1 && (
                      <div className="my-1 w-px flex-1 bg-mono-hairline-strong" />
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
