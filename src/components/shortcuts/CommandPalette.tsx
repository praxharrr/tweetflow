"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  MessagesSquare,
  FileEdit,
  ListOrdered,
  Calendar,
  TrendingUp,
  Flame,
  Clock3,
  Settings,
  Search,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { fuzzyScore } from "@/lib/fuzzyMatch";
import { useFocusTrap } from "@/lib/useFocusTrap";

interface ResultItem {
  id: string;
  label: string;
  href: string;
  group: string;
  icon: LucideIcon;
}

const NAV_ITEMS: Omit<ResultItem, "id">[] = [
  { label: "Dashboard", href: "/", group: "Navigate", icon: LayoutDashboard },
  { label: "New Tweet", href: "/compose", group: "Navigate", icon: PenSquare },
  { label: "Threads", href: "/threads", group: "Navigate", icon: MessagesSquare },
  { label: "Drafts", href: "/drafts", group: "Navigate", icon: FileEdit },
  { label: "Queue", href: "/queue", group: "Navigate", icon: ListOrdered },
  { label: "Calendar", href: "/calendar", group: "Navigate", icon: Calendar },
  { label: "Trending Topics", href: "/trending-topics", group: "Navigate", icon: TrendingUp },
  { label: "Viral Opportunities", href: "/viral-opportunities", group: "Navigate", icon: Flame },
  { label: "Best Posting Times", href: "/best-posting-times", group: "Navigate", icon: Clock3 },
  { label: "Settings", href: "/settings", group: "Navigate", icon: Settings },
];

export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<{ id: string; content: string }[]>([]);
  const [scheduled, setScheduled] = useState<{ id: string; content: string }[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  // Reset transient state when the palette opens — computed during render
  // (not an effect) per React's guidance for adjusting state on a prop change.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  useEffect(() => {
    if (!open) return;
    fetch("/api/search")
      .then((r) => r.json())
      .then((data) => {
        setDrafts(data.drafts ?? []);
        setScheduled(data.scheduled ?? []);
      })
      .catch(() => {});
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  const results = useMemo<ResultItem[]>(() => {
    const items: ResultItem[] = [
      ...NAV_ITEMS.map((n, i) => ({ ...n, id: `nav-${i}` })),
      ...drafts.map((d) => ({
        id: `draft-${d.id}`,
        label: d.content.slice(0, 70),
        href: "/drafts",
        group: "Drafts",
        icon: FileEdit,
      })),
      ...scheduled.map((s) => ({
        id: `sched-${s.id}`,
        label: s.content.slice(0, 70),
        href: "/queue",
        group: "Queue",
        icon: ListOrdered,
      })),
    ];
    if (!query.trim()) return items.filter((i) => i.group === "Navigate");
    return items
      .map((item) => ({ item, score: fuzzyScore(query, item.label) }))
      .filter((r): r is { item: ResultItem; score: number } => r.score !== null)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item)
      .slice(0, 20);
  }, [query, drafts, scheduled]);

  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActiveIndex(0);
  }

  function select(item: ResultItem) {
    router.push(item.href);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) select(results[activeIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  if (!open) return null;

  const grouped = results.reduce<Record<string, ResultItem[]>>((acc, r) => {
    (acc[r.group] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-[15vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="w-full max-w-lg overflow-hidden rounded-lg border border-mono-hairline-strong bg-mono-surface-2/95 shadow-[0_24px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 border-b border-mono-hairline px-4 py-3">
          <Search size={16} className="[stroke-width:1.25] text-mono-ink-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, drafts, queue…"
            aria-label="Command palette search"
            className="flex-1 bg-transparent text-body-sm text-mono-ink outline-none placeholder:text-mono-ink-faint"
          />
          <kbd className="rounded border border-mono-hairline px-1.5 py-0.5 font-mono text-[10px] text-mono-ink-faint">
            Esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5">
          {results.length === 0 && (
            <p className="py-8 text-center text-body-sm text-mono-ink-faint">No results</p>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-1">
              <div className="px-2.5 py-1.5 text-eyebrow uppercase text-white/40">{group}</div>
              {items.map((item) => {
                const globalIndex = results.indexOf(item);
                const Icon = item.icon;
                const isActive = globalIndex === activeIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => select(item)}
                    onMouseEnter={() => setActiveIndex(globalIndex)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-body-sm transition-colors duration-100 ${
                      isActive ? "bg-white/[0.08] text-mono-ink" : "text-mono-ink-subtle"
                    }`}
                  >
                    <Icon size={14} className="shrink-0 [stroke-width:1.25]" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && (
                      <CornerDownLeft size={12} className="shrink-0 text-mono-ink-faint" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
