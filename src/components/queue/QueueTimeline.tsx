"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Clock, Pencil, CalendarClock, Trash2, Loader2, Check, GripVertical } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/field-styles";
import { formatCountdown, dayLabel } from "@/lib/formatCountdown";
import { useNowMinute } from "@/lib/useNowMinute";
import { useToast } from "@/components/toast/ToastProvider";

interface Post {
  id: string;
  content: string;
  scheduledFor: string;
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function groupByDay(posts: Post[], now: Date) {
  const groups: { label: string; posts: Post[] }[] = [];
  for (const post of posts) {
    const label = dayLabel(new Date(post.scheduledFor), now);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.posts.push(post);
    } else {
      groups.push({ label, posts: [post] });
    }
  }
  return groups;
}

function QueueRow({
  post,
  now,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onDelete,
}: {
  post: Post;
  now: Date;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit" | "reschedule">("view");
  const [content, setContent] = useState(post.content);
  const [scheduledFor, setScheduledFor] = useState(toLocalInputValue(post.scheduledFor));
  const [busy, setBusy] = useState<"save" | "unschedule" | null>(null);

  async function patch(body: Record<string, unknown>) {
    return fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async function handleSaveContent() {
    if (!content.trim()) return;
    setBusy("save");
    try {
      const res = await patch({ content });
      if (res.ok) {
        setMode("view");
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleReschedule() {
    if (!scheduledFor) return;
    setBusy("save");
    try {
      const res = await patch({ scheduledFor: new Date(scheduledFor).toISOString() });
      if (res.ok) {
        setMode("view");
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleUnschedule() {
    setBusy("unschedule");
    try {
      await patch({ status: "draft" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      className="relative pb-3 pl-7"
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
    >
      <div
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className="absolute left-0 top-4 flex h-4 w-4 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border-2 border-mono-surface bg-white/40 ring-4 ring-mono-surface active:cursor-grabbing"
        aria-hidden
      />
      <Card className={`p-3.5 transition-opacity duration-150 ${isDragOver ? "opacity-50" : "opacity-100"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {mode === "edit" ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                aria-label="Tweet content"
                className={`${fieldClass} resize-none`}
                autoFocus
              />
            ) : (
              <p className="line-clamp-2 text-body-sm text-mono-ink-soft">{post.content}</p>
            )}

            {mode === "reschedule" ? (
              <div className="mt-2 flex items-center gap-2">
                <CalendarClock size={14} className="[stroke-width:1.25] text-mono-ink-subtle" />
                <input
                  type="datetime-local"
                  aria-label="Reschedule date and time"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className={`${fieldClass} py-1 text-caption`}
                />
              </div>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-caption text-mono-ink-faint">
                  {new Date(post.scheduledFor).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span
                  className="text-caption text-mono-ink-subtle"
                  style={{
                    color:
                      new Date(post.scheduledFor).getTime() < now.getTime()
                        ? "var(--color-warning)"
                        : undefined,
                  }}
                >
                  {formatCountdown(new Date(post.scheduledFor), now)}
                </span>
              </div>
            )}
          </div>

          {(mode === "edit" || mode === "reschedule") && (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="secondary"
                magnetic={false}
                className="!px-2 !py-1"
                onClick={mode === "edit" ? handleSaveContent : handleReschedule}
                disabled={busy === "save"}
                aria-label={mode === "edit" ? "Save content" : "Save new schedule"}
              >
                {busy === "save" ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              </Button>
              <button
                onClick={() => setMode("view")}
                aria-label="Cancel"
                className="rounded-full p-1.5 text-mono-ink-faint hover:bg-white/[0.06] hover:text-mono-ink"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {mode === "view" && (
          <div className="mt-2.5 flex items-center gap-1 border-t border-mono-hairline pt-2.5">
            <button
              onClick={() => setMode("edit")}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-caption text-mono-ink-subtle transition-colors duration-150 hover:bg-white/[0.06] hover:text-mono-ink"
            >
              <Pencil size={12} className="[stroke-width:1.25]" />
              Edit
            </button>
            <button
              onClick={() => setMode("reschedule")}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-caption text-mono-ink-subtle transition-colors duration-150 hover:bg-white/[0.06] hover:text-mono-ink"
            >
              <CalendarClock size={12} className="[stroke-width:1.25]" />
              Reschedule
            </button>
            <button
              onClick={handleUnschedule}
              disabled={busy === "unschedule"}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-caption text-mono-ink-subtle transition-colors duration-150 hover:bg-white/[0.06] hover:text-mono-ink disabled:opacity-40"
            >
              {busy === "unschedule" ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
              Unschedule
            </button>
            <span className="ml-auto flex items-center gap-1 text-mono-ink-faint">
              <GripVertical size={12} className="[stroke-width:1.25]" />
            </span>
            <button
              onClick={onDelete}
              aria-label="Delete post"
              className="flex items-center gap-1 rounded-full px-2 py-1 text-caption text-mono-ink-subtle transition-colors duration-150 hover:bg-red-950/30 hover:text-red-400"
            >
              <Trash2 size={12} className="[stroke-width:1.25]" />
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function QueueTimeline({ posts: allPosts }: { posts: Post[] }) {
  const router = useRouter();
  const { undoableAction } = useToast();
  const now = useNowMinute() ?? new Date();
  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());

  const initialPosts = allPosts.filter((p) => !pendingDeleteIds.has(p.id));

  function handleDeleteOne(id: string) {
    setPendingDeleteIds((prev) => new Set(prev).add(id));
    undoableAction(
      "Scheduled tweet deleted",
      async () => {
        await fetch(`/api/posts/${id}`, { method: "DELETE" });
        router.refresh();
      },
      {
        onUndo: () => {
          setPendingDeleteIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        },
      },
    );
  }

  async function handleDrop(targetId: string) {
    const sourceId = dragId.current;
    dragId.current = null;
    setDragOverId(null);
    if (!sourceId || sourceId === targetId) return;

    const source = initialPosts.find((p) => p.id === sourceId);
    const target = initialPosts.find((p) => p.id === targetId);
    if (!source || !target) return;

    await Promise.all([
      fetch(`/api/posts/${sourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledFor: target.scheduledFor }),
      }),
      fetch(`/api/posts/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledFor: source.scheduledFor }),
      }),
    ]);
    router.refresh();
  }

  if (initialPosts.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        message="Nothing scheduled yet — schedule a tweet from the New Tweet page."
      />
    );
  }

  const groups = groupByDay(initialPosts, now);

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="sticky top-0 z-10 mb-2 bg-mono-surface/95 py-1.5 backdrop-blur-sm">
            <span className="text-eyebrow uppercase text-white/40">{group.label}</span>
          </div>
          <div className="relative">
            <div className="absolute left-0 top-2 bottom-2 w-px bg-mono-hairline-strong" />
            {group.posts.map((post) => (
              <QueueRow
                key={post.id}
                post={post}
                now={now}
                isDragOver={dragOverId === post.id}
                onDragStart={() => {
                  dragId.current = post.id;
                }}
                onDragOver={() => setDragOverId(post.id)}
                onDrop={() => handleDrop(post.id)}
                onDragEnd={() => setDragOverId(null)}
                onDelete={() => handleDeleteOne(post.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
