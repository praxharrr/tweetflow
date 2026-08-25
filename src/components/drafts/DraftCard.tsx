"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, CalendarClock, Loader2, Check, X, Eye } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/field-styles";
import TweetPreview from "@/components/tweet-preview/TweetPreview";

interface Draft {
  id: string;
  content: string;
  updatedAt: string;
}

interface DraftCardProps {
  draft: Draft;
  displayName: string;
  handle: string;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function DraftCard({
  draft,
  displayName,
  handle,
  selected,
  onToggleSelect,
  onDelete,
}: DraftCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(draft.content);
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  async function handleSaveEdit() {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/posts/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePromote() {
    if (!scheduledFor) return;
    setIsScheduling(true);
    try {
      const res = await fetch(`/api/posts/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "scheduled",
          scheduledFor: new Date(scheduledFor).toISOString(),
        }),
      });
      if (res.ok) router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsScheduling(false);
    }
  }

  return (
    <Card
      className={`group relative flex flex-col p-4 transition-colors duration-150 ${
        selected ? "border-mono-hairline-strong" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleSelect(draft.id)}
        aria-label={selected ? "Deselect draft" : "Select draft"}
        aria-pressed={selected}
        className={`absolute right-3 top-3 z-10 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-150 ${
          selected
            ? "border-mono-ink bg-mono-ink text-black opacity-100"
            : "border-mono-hairline-strong bg-black/60 text-transparent opacity-0 group-hover:opacity-100"
        }`}
      >
        <Check size={12} />
      </button>

      {!isEditing && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end rounded-lg bg-black/90 p-3 opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100">
          <div className="mb-1.5 flex items-center gap-1.5 text-caption text-mono-ink-faint">
            <Eye size={12} className="[stroke-width:1.25]" />
            Preview
          </div>
          <TweetPreview displayName={displayName} handle={handle} content={draft.content} />
        </div>
      )}

      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          aria-label="Draft content"
          className={`${fieldClass} resize-none`}
          autoFocus
        />
      ) : (
        <p className="whitespace-pre-wrap text-body-sm text-mono-ink-soft">{draft.content}</p>
      )}

      <div className="mt-3 flex items-center justify-between text-caption text-mono-ink-faint">
        <span>
          {new Date(draft.updatedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </span>
        <span>{content.length} chars</span>
      </div>

      {isSchedulingOpen && (
        <div className="mt-3 flex items-center gap-2 border-t border-mono-hairline pt-3">
          <CalendarClock size={14} className="[stroke-width:1.25] text-mono-ink-subtle" />
          <input
            type="datetime-local"
            aria-label="Schedule date and time"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className={`${fieldClass} py-1 text-caption`}
          />
          <Button
            variant="primary"
            magnetic={false}
            className="!px-2 !py-1"
            onClick={handlePromote}
            disabled={!scheduledFor || isScheduling}
          >
            {isScheduling ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          </Button>
        </div>
      )}

      <div className="mt-3 flex items-center gap-1 border-t border-mono-hairline pt-3">
        {isEditing ? (
          <>
            <Button
              variant="secondary"
              magnetic={false}
              className="!px-2 !py-1 text-caption"
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Save
            </Button>
            <Button
              variant="ghost"
              magnetic={false}
              className="!px-2 !py-1 text-caption"
              onClick={() => {
                setContent(draft.content);
                setIsEditing(false);
              }}
            >
              <X size={12} />
              Cancel
            </Button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-caption text-mono-ink-subtle transition-colors duration-150 hover:bg-white/[0.06] hover:text-mono-ink"
            >
              <Pencil size={12} className="[stroke-width:1.25]" />
              Edit
            </button>
            <button
              onClick={() => setIsSchedulingOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-caption text-mono-ink-subtle transition-colors duration-150 hover:bg-white/[0.06] hover:text-mono-ink"
            >
              <CalendarClock size={12} className="[stroke-width:1.25]" />
              Schedule
            </button>
            <button
              onClick={() => onDelete(draft.id)}
              aria-label="Delete draft"
              className="ml-auto flex items-center gap-1 rounded-full px-2 py-1 text-caption text-mono-ink-subtle transition-colors duration-150 hover:bg-red-950/30 hover:text-red-400"
            >
              <Trash2 size={12} className="[stroke-width:1.25]" />
            </button>
          </>
        )}
      </div>
    </Card>
  );
}
