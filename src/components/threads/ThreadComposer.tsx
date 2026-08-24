"use client";

import { useState } from "react";
import { Plus, X, Sparkles, Loader2, Save, CalendarClock, Check } from "lucide-react";

const MAX_CHARS = 280;

export default function ThreadComposer() {
  const [tweets, setTweets] = useState<string[]>([""]);
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState<"draft" | "scheduled" | null>(null);

  function updateTweet(index: number, value: string) {
    setTweets((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  function addTweet() {
    setTweets((prev) => [...prev, ""]);
  }

  function removeTweet(index: number) {
    setTweets((prev) => prev.filter((_, i) => i !== index));
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

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex gap-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Give AI a topic to turn into a full thread..."
          className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
        <button
          onClick={handleAIAssist}
          disabled={!topic.trim() || isGenerating}
          className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-40"
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {isGenerating ? "Writing thread..." : "Generate Thread"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {tweets.map((tweet, index) => {
          const charCount = tweet.length;
          const isOverLimit = charCount > MAX_CHARS;
          return (
            <div key={index} className="rounded-xl border border-neutral-200 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">Tweet {index + 1}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isOverLimit ? "text-red-500" : "text-neutral-400"}`}>
                    {charCount} / {MAX_CHARS}
                  </span>
                  {tweets.length > 1 && (
                    <button onClick={() => removeTweet(index)} className="text-neutral-300 hover:text-red-500">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={tweet}
                onChange={(e) => updateTweet(index, e.target.value)}
                rows={3}
                placeholder={`Write tweet ${index + 1}...`}
                className="w-full resize-none rounded-lg border-none p-0 text-sm text-neutral-800 outline-none"
              />
            </div>
          );
        })}
      </div>

      <button
        onClick={addTweet}
        className="mt-3 flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-800"
      >
        <Plus size={16} />
        Add tweet
      </button>

      <div className="mt-5 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock size={16} className="text-neutral-400" />
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm text-neutral-600 outline-none focus:border-neutral-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave("draft")}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : saved === "draft" ? <Check size={16} className="text-emerald-600" /> : <Save size={16} />}
            {saved === "draft" ? "Saved" : "Save Draft"}
          </button>
          <button
            onClick={() => handleSave("scheduled")}
            disabled={isSaving || !scheduledFor}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : saved === "scheduled" ? <Check size={16} /> : <CalendarClock size={16} />}
            {saved === "scheduled" ? "Scheduled" : "Schedule Thread"}
          </button>
        </div>
      </div>
    </div>
  );
}