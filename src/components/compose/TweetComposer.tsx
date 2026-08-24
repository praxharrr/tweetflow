"use client";

import { useState } from "react";
import { Sparkles, Send, Save, Loader2, Check } from "lucide-react";

const MAX_CHARS = 280;

export default function TweetComposer() {
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;

  async function handleAIAssist() {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic }),
      });
      const data = await res.json();
      setContent(data.tweet ?? "");
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveDraft() {
    if (!content.trim()) return;
    setIsSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, status: "draft" }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex gap-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Give AI a topic or idea to write about..."
          className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
        <button
          onClick={handleAIAssist}
          disabled={!topic.trim() || isGenerating}
          className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-40"
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {isGenerating ? "Writing..." : "AI Assist"}
        </button>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          Compose Tweet
        </span>
        <span className={`text-xs font-medium ${isOverLimit ? "text-red-500" : "text-neutral-400"}`}>
          {charCount} / {MAX_CHARS}
        </span>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What is happening? Share an actionable insight, update, or hook..."
        rows={8}
        className="w-full resize-none rounded-lg border border-neutral-200 p-3 text-sm text-neutral-800 outline-none focus:border-neutral-400"
      />

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={handleSaveDraft}
          disabled={content.length === 0 || isSaving}
          className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <Check size={16} className="text-emerald-600" />
          ) : (
            <Save size={16} />
          )}
          {saved ? "Saved" : "Draft"}
        </button>
        <button
          disabled={content.length === 0 || isOverLimit}
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={16} />
          Publish
        </button>
      </div>
    </div>
  );
}