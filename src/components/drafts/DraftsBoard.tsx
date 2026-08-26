"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Trash2, CalendarClock, X } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/field-styles";
import { useToast } from "@/components/toast/ToastProvider";
import DraftCard from "./DraftCard";

interface Draft {
  id: string;
  content: string;
  updatedAt: string;
}

type FilterKey = "all" | "recent" | "long" | "short";
type SortKey = "date" | "length";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "recent", label: "Recent" },
  { key: "long", label: "Long" },
  { key: "short", label: "Short" },
];

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const LONG_THRESHOLD = 200;
const SHORT_THRESHOLD = 100;

export default function DraftsBoard({
  drafts,
  displayName,
  handle,
  emptyMessage,
}: {
  drafts: Draft[];
  displayName: string;
  handle: string;
  emptyMessage: string;
}) {
  const router = useRouter();
  const { undoableAction } = useToast();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("date");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isBulkScheduling, setIsBulkScheduling] = useState(false);
  const [bulkScheduleAt, setBulkScheduleAt] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [now] = useState(() => Date.now());
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());

  function handleDeleteOne(id: string) {
    setPendingDeleteIds((prev) => new Set(prev).add(id));
    undoableAction(
      "Draft deleted",
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

  const filtered = useMemo(() => {
    let list = drafts.filter((d) => !pendingDeleteIds.has(d.id));
    if (filter === "recent") {
      list = list.filter((d) => now - new Date(d.updatedAt).getTime() < SEVEN_DAYS_MS);
    } else if (filter === "long") {
      list = list.filter((d) => d.content.length > LONG_THRESHOLD);
    } else if (filter === "short") {
      list = list.filter((d) => d.content.length <= SHORT_THRESHOLD);
    }

    return [...list].sort((a, b) =>
      sort === "date"
        ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        : b.content.length - a.content.length,
    );
  }, [drafts, filter, sort, now, pendingDeleteIds]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
    setIsBulkScheduling(false);
  }

  async function handleBulkDelete() {
    if (!window.confirm(`Delete ${selected.size} draft${selected.size !== 1 ? "s" : ""}? This can't be undone.`)) {
      return;
    }
    setIsBusy(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) => fetch(`/api/posts/${id}`, { method: "DELETE" })),
      );
      clearSelection();
      router.refresh();
    } finally {
      setIsBusy(false);
    }
  }

  async function handleBulkSchedule() {
    if (!bulkScheduleAt) return;
    setIsBusy(true);
    try {
      const base = new Date(bulkScheduleAt);
      const ids = Array.from(selected);
      await Promise.all(
        ids.map((id, i) => {
          const scheduledFor = new Date(base.getTime() + i * 30 * 60 * 1000);
          return fetch(`/api/posts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "scheduled", scheduledFor: scheduledFor.toISOString() }),
          });
        }),
      );
      clearSelection();
      setBulkScheduleAt("");
      router.refresh();
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3 py-1.5 text-caption font-medium transition-all duration-150 ${
                filter === f.key
                  ? "border-primary/40 bg-primary/[0.12] text-primary shadow-[0_0_12px_-4px_rgba(29,155,240,0.4)]"
                  : "border-mono-hairline text-mono-ink-subtle hover:bg-white/[0.04]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-caption text-mono-ink-faint">
          Sort by
          <button
            onClick={() => setSort("date")}
            className={`rounded-full px-2 py-1 transition-colors duration-150 ${
              sort === "date" ? "text-mono-ink" : "hover:text-mono-ink-subtle"
            }`}
          >
            Date
          </button>
          <button
            onClick={() => setSort("length")}
            className={`rounded-full px-2 py-1 transition-colors duration-150 ${
              sort === "length" ? "text-mono-ink" : "hover:text-mono-ink-subtle"
            }`}
          >
            Length
          </button>
        </div>
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState icon={FileText} message={emptyMessage} />
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                displayName={displayName}
                handle={handle}
                selected={selected.has(draft.id)}
                onToggleSelect={toggleSelect}
                onDelete={handleDeleteOne}
              />
            ))}
          </div>
        )}
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-primary/25 bg-mono-surface-2/95 px-4 py-2.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.75),0_0_0_1px_rgba(29,155,240,0.1)] backdrop-blur-xl">
          <span className="text-caption font-medium text-mono-ink">
            {selected.size} selected
          </span>

          {isBulkScheduling ? (
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                aria-label="Bulk schedule date and time"
                value={bulkScheduleAt}
                onChange={(e) => setBulkScheduleAt(e.target.value)}
                className={`${fieldClass} !w-auto py-1 text-caption`}
              />
              <Button
                variant="primary"
                magnetic={false}
                className="!px-3 !py-1.5 text-caption"
                onClick={handleBulkSchedule}
                disabled={!bulkScheduleAt || isBusy}
              >
                {isBusy ? <Loader2 size={12} className="animate-spin" /> : "Confirm"}
              </Button>
              <button
                onClick={() => setIsBulkScheduling(false)}
                aria-label="Cancel bulk schedule"
                className="text-mono-ink-faint hover:text-mono-ink"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsBulkScheduling(true)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption font-medium text-mono-ink-subtle transition-colors duration-150 hover:bg-white/[0.06] hover:text-mono-ink"
              >
                <CalendarClock size={13} className="[stroke-width:1.25]" />
                Schedule
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isBusy}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption font-medium text-mono-ink-subtle transition-colors duration-150 hover:bg-red-950/30 hover:text-red-400 disabled:opacity-40"
              >
                {isBusy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} className="[stroke-width:1.25]" />}
                Delete
              </button>
              <button
                onClick={clearSelection}
                aria-label="Clear selection"
                className="text-mono-ink-faint hover:text-mono-ink"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}