"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Send,
  Save,
  Loader2,
  Check,
  CalendarClock,
  Paperclip,
  X,
  Lock,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import CharRing from "@/components/ui/CharRing";
import TwoColumnLayout from "@/components/ui/TwoColumnLayout";
import TweetPreview from "@/components/tweet-preview/TweetPreview";
import BestTimeCard from "./BestTimeCard";
import { fieldClass } from "@/components/ui/field-styles";

const MAX_CHARS = 280;

interface Media {
  url: string;
  uploading?: boolean;
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TweetComposer({
  hasAccount,
  displayName,
  handle,
  initialTopic,
  initialScheduleAt,
}: {
  hasAccount: boolean;
  displayName: string;
  handle: string;
  initialTopic?: string;
  initialScheduleAt?: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState(initialTopic ?? "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isScheduleMode, setIsScheduleMode] = useState(!!initialScheduleAt);
  const [scheduledFor, setScheduledFor] = useState(
    initialScheduleAt ? toLocalInputValue(initialScheduleAt) : "",
  );
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    for (const file of files) {
      const placeholder: Media = { url: URL.createObjectURL(file), uploading: true };
      setMedia((prev) => [...prev, placeholder]);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        setMedia((prev) =>
          prev.map((m) => (m === placeholder ? { url: data.url } : m)),
        );
      } catch (err) {
        console.error(err);
        setMedia((prev) => prev.filter((m) => m !== placeholder));
      }
    }
  }

  function removeMedia(url: string) {
    setMedia((prev) => prev.filter((m) => m.url !== url));
  }

  async function savePost(status: "draft" | "scheduled") {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        status,
        scheduledFor:
          status === "scheduled" ? new Date(scheduledFor).toISOString() : undefined,
        mediaUrls: media.length > 0 ? JSON.stringify(media.map((m) => m.url)) : null,
      }),
    });
    return res.ok;
  }

  async function handleSaveDraft() {
    if (!content.trim()) return;
    setIsSaving(true);
    setSaved(false);
    try {
      const ok = await savePost("draft");
      if (ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSchedule() {
    if (!content.trim() || !scheduledFor) return;
    setIsScheduling(true);
    setScheduled(false);
    try {
      const ok = await savePost("scheduled");
      if (ok) {
        setScheduled(true);
        setContent("");
        setScheduledFor("");
        setMedia([]);
        router.refresh();
        setTimeout(() => setScheduled(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScheduling(false);
    }
  }

  const mediaUploading = media.some((m) => m.uploading);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;

      if (e.key === "Enter") {
        if (isScheduleMode && content.length > 0 && !isOverLimit && scheduledFor && !isScheduling && !mediaUploading) {
          e.preventDefault();
          handleSchedule();
        }
      } else if (e.key.toLowerCase() === "s") {
        if (content.length > 0 && !isSaving) {
          e.preventDefault();
          handleSaveDraft();
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
            {saved && "Draft saved"}
            {scheduled && "Tweet scheduled"}
          </div>
          <div className="mb-3 flex gap-2">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Give AI a topic or idea to write about…"
              aria-label="AI topic or idea"
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
              {isGenerating ? "Writing…" : "AI Assist"}
            </Button>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-eyebrow uppercase text-white/40">Compose Tweet</span>
            <CharRing count={charCount} max={MAX_CHARS} size={26} />
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What is happening? Share an actionable insight, update, or hook…"
            aria-label="Tweet content"
            rows={8}
            className={`${fieldClass} resize-none`}
          />

          {media.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {media.map((m) => (
                <div key={m.url} className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-mono-hairline">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.url}
                    alt="Attached media preview"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                  {m.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <Loader2 size={16} className="animate-spin text-mono-ink" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(m.url)}
                    aria-label="Remove attachment"
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-mono-ink opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 border-t border-mono-hairline pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-body-sm text-mono-ink-subtle transition-colors duration-150 hover:text-mono-ink"
              >
                <Paperclip size={16} className="[stroke-width:1.25]" />
                Attach
              </button>

              <label className="flex items-center gap-2 text-body-sm text-mono-ink-subtle">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isScheduleMode}
                  aria-label="Schedule for later"
                  onClick={() => setIsScheduleMode((v) => !v)}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ${
                    isScheduleMode ? "bg-mono-ink" : "bg-white/15"
                  }`}
                >
                  <span
                    className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-black transition-transform duration-150"
                    style={{ transform: isScheduleMode ? "translateX(16px)" : "translateX(0)" }}
                  />
                </button>
                Schedule
              </label>

              {isScheduleMode && (
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
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
                disabled={content.length === 0 || isSaving}
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : saved ? (
                  <Check size={16} />
                ) : (
                  <Save size={16} />
                )}
                {saved ? "Saved" : "Save Draft"}
              </Button>

              {isScheduleMode ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSchedule}
                  disabled={
                    content.length === 0 || isOverLimit || !scheduledFor || isScheduling || mediaUploading
                  }
                >
                  {isScheduling ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : scheduled ? (
                    <Check size={16} />
                  ) : (
                    <CalendarClock size={16} />
                  )}
                  {scheduled ? "Scheduled" : "Schedule"}
                </Button>
              ) : !hasAccount ? (
                <Tooltip label="Connect an X account in Settings to publish directly">
                  <Button type="button" variant="secondary" disabled magnetic={false}>
                    <Lock size={14} className="[stroke-width:1.25]" />
                    Publish
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  disabled={content.length === 0 || isOverLimit || mediaUploading}
                >
                  <Send size={16} />
                  Publish
                </Button>
              )}
            </div>
          </div>
        </Card>
      }
      right={
        <>
          <TweetPreview
            displayName={displayName}
            handle={handle}
            content={content}
            media={media.filter((m) => !m.uploading).map((m) => m.url)}
          />
          <BestTimeCard />
        </>
      }
    />
  );
}
