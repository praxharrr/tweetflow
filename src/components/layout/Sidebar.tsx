"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
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
  UserCircle2,
  type LucideIcon,
} from "lucide-react";
import { useShortcuts } from "@/components/shortcuts/ShortcutsProvider";
import { useNowMinute } from "@/lib/useNowMinute";
import { formatCountdown } from "@/lib/formatCountdown";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  countKey?: "drafts" | "queue";
};

const navGroups: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Threads", href: "/threads", icon: MessagesSquare },
      { label: "Drafts", href: "/drafts", icon: FileEdit, countKey: "drafts" },
      { label: "Queue", href: "/queue", icon: ListOrdered, countKey: "queue" },
      { label: "Calendar", href: "/calendar", icon: Calendar },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { label: "Trending Topics", href: "/trending-topics", icon: TrendingUp },
      { label: "Viral Opportunities", href: "/viral-opportunities", icon: Flame },
      { label: "Best Posting Times", href: "/best-posting-times", icon: Clock3 },
    ],
  },
];

function LogoMark() {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#4db5f5] to-[#1d7fd4] shadow-[0_4px_14px_-3px_rgba(29,155,240,0.55)] ring-1 ring-inset ring-white/25">
      <svg viewBox="0 0 20 20" className="h-[19px] w-[19px]" fill="none" aria-hidden>
        <path
          d="M3.5 6.25h13M3.5 10h9M3.5 13.75h5.5"
          stroke="white"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <circle cx="14.5" cy="13.75" r="2.4" fill="white" />
      </svg>
    </div>
  );
}

function UpNext({
  nextPost,
}: {
  nextPost: { content: string; scheduledFor: string } | null;
}) {
  const now = useNowMinute();

  if (!nextPost) {
    return (
      <div className="rounded-xl border border-dashed border-mono-hairline px-3 py-3">
        <p className="text-caption leading-relaxed text-mono-ink-subtle">
          Nothing queued up yet.
        </p>
        <Link
          href="/compose"
          className="mt-1.5 inline-block text-caption font-medium text-primary hover:underline"
        >
          Write something →
        </Link>
      </div>
    );
  }

  const target = new Date(nextPost.scheduledFor);
  const countdown = now ? formatCountdown(target, now) : null;
  const isOverdue = countdown?.startsWith("overdue") ?? false;

  return (
    <Link
      href="/queue"
      className="group block rounded-xl border border-mono-hairline bg-mono-surface px-3 py-3 transition-colors duration-150 hover:border-mono-hairline-strong"
    >
      <div className="flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isOverdue ? "bg-warning" : "bg-primary"
          }`}
        />
        <span className="text-[11px] font-medium uppercase tracking-wider text-mono-ink-faint">
          Up next
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-caption leading-relaxed text-mono-ink-soft">
        {nextPost.content}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p
          className={`font-mono text-[11px] ${
            isOverdue ? "text-warning" : "text-mono-ink-subtle"
          }`}
        >
          {countdown ?? "\u00A0"}
        </p>
        {isOverdue && (
          <span className="text-[11px] font-medium text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            Fix →
          </span>
        )}
      </div>
    </Link>
  );
}

export default function Sidebar({
  streak = 0,
  draftCount = 0,
  queueCount = 0,
  username = null,
  nextPost = null,
}: {
  streak?: number;
  draftCount?: number;
  queueCount?: number;
  username?: string | null;
  nextPost?: { content: string; scheduledFor: string } | null;
}) {
  const pathname = usePathname();
  const { openPalette } = useShortcuts();
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState({ y: 0, h: 0, ready: false });

  const counts = { drafts: draftCount, queue: queueCount };

  useLayoutEffect(() => {
    const active = linkRefs.current[pathname];
    if (!active) {
      setIndicator((s) => ({ ...s, ready: false }));
      return;
    }
    setIndicator({ y: active.offsetTop, h: active.offsetHeight, ready: true });
  }, [pathname]);

  return (
    <aside className="relative flex w-64 shrink-0 flex-col border-r border-mono-hairline bg-canvas px-3 py-5">
      <div className="mb-5 flex items-center gap-2.5 px-2">
        <LogoMark />
        <span className="text-[18px] font-semibold tracking-[-0.03em] text-mono-ink">
          Tweet<span className="text-[#4db5f5]">flow</span>
        </span>
      </div>

      <Link
        href="/compose"
        className={`group mb-2.5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#3aa8f2] to-[#1a8cd8] py-2.5 text-button font-semibold text-white shadow-[0_4px_16px_-4px_rgba(29,155,240,0.5)] ring-1 ring-inset ring-white/20 transition-all duration-150 hover:from-[#4db5f5] hover:to-[#1d9bf0] hover:shadow-[0_6px_20px_-4px_rgba(29,155,240,0.65)] active:scale-[0.98] active:shadow-[0_2px_8px_-4px_rgba(29,155,240,0.5)] ${
          pathname === "/compose" ? "from-[#4db5f5] to-[#1d9bf0]" : ""
        }`}
      >
        <PenSquare
          size={16}
          className="[stroke-width:2] transition-transform duration-150 group-hover:-rotate-12"
        />
        New Tweet
      </Link>

      <button
        type="button"
        onClick={openPalette}
        className="mb-5 flex items-center justify-between rounded-xl border border-mono-hairline px-3 py-1.5 text-caption text-mono-ink-subtle transition-colors duration-150 hover:border-mono-hairline-strong hover:text-mono-ink"
      >
        <span className="flex items-center gap-2">
          <Search size={13} className="[stroke-width:1.5]" />
          Search
        </span>
        <kbd className="rounded border border-mono-hairline px-1 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 rounded-xl bg-white/[0.07] transition-all duration-200 ease-out"
          style={{
            transform: `translateY(${indicator.y}px)`,
            height: indicator.h,
            opacity: indicator.ready ? 1 : 0,
          }}
        />

        {navGroups.map((group, gi) => (
          <div key={group.label ?? gi} className="mb-5">
            {group.label && (
              <div className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-mono-ink-faint">
                {group.label}
              </div>
            )}
            <nav className="flex flex-col gap-px">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const count = item.countKey ? counts[item.countKey] : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    ref={(el) => {
                      linkRefs.current[item.href] = el;
                    }}
                    className={`group relative z-10 flex items-center gap-3 rounded-xl px-3 py-[7px] text-body-sm transition-colors duration-150 ${
                      isActive
                        ? "font-medium text-mono-ink"
                        : "text-mono-ink-subtle hover:bg-white/[0.04] hover:text-mono-ink"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={`shrink-0 transition-colors duration-150 ${
                        isActive
                          ? "text-primary [stroke-width:2]"
                          : "[stroke-width:1.5] group-hover:text-mono-ink"
                      }`}
                    />
                    <span className="flex-1">{item.label}</span>
                    {count > 0 && (
                      <span
                        className={`min-w-[20px] rounded-full px-1.5 py-0.5 text-center font-mono text-[11px] leading-none transition-colors duration-150 ${
                          isActive
                            ? "bg-primary text-white"
                            : "bg-white/[0.08] text-mono-ink-subtle group-hover:text-mono-ink"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <UpNext nextPost={nextPost} />
      </div>

      <div className="mt-auto flex flex-col gap-1 pt-4">
        {streak > 0 && (
          <div className="flex items-center gap-2 px-2 pb-1">
            <Flame size={13} className="[stroke-width:1.5] text-primary" />
            <span className="text-caption text-mono-ink-subtle">
              <span className="font-medium text-mono-ink">{streak} days</span> in
              a row
            </span>
          </div>
        )}

        <Link
          href="/settings"
          className={`flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors duration-150 ${
            pathname === "/settings" ? "bg-white/[0.07]" : "hover:bg-white/[0.05]"
          }`}
        >
          {username ? (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-white">
              {username.slice(0, 1).toUpperCase()}
            </div>
          ) : (
            <UserCircle2
              size={26}
              className="shrink-0 [stroke-width:1.25] text-mono-ink-faint"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-caption font-medium text-mono-ink">
              {username ? `@${username}` : "Not connected"}
            </div>
            <div className="text-[11px] text-mono-ink-faint">
              {username ? "Connected" : "Connect your account"}
            </div>
          </div>
          <Settings
            size={15}
            className="shrink-0 [stroke-width:1.5] text-mono-ink-faint"
          />
        </Link>
      </div>
    </aside>
  );
}