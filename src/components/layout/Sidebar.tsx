"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
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
  Flame as StreakIcon,
  type LucideIcon,
} from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { useShortcuts } from "@/components/shortcuts/ShortcutsProvider";

const WireframeMark = dynamic(() => import("@/components/three/WireframeMark"), {
  ssr: false,
  loading: () => <div className="h-7 w-7" />,
});

const navGroups: { label: string; items: { label: string; href: string; icon: LucideIcon }[] }[] = [
  {
    label: "Navigation",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "New Tweet", href: "/compose", icon: PenSquare },
      { label: "Threads", href: "/threads", icon: MessagesSquare },
      { label: "Drafts", href: "/drafts", icon: FileEdit },
      { label: "Queue", href: "/queue", icon: ListOrdered },
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
  {
    label: "Account",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

export default function Sidebar({ streak = 0 }: { streak?: number }) {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const { openPalette } = useShortcuts();
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const indicatorRef = useRef<HTMLDivElement>(null);
  const hasPositioned = useRef(false);

  useLayoutEffect(() => {
    const active = linkRefs.current[pathname];
    const indicator = indicatorRef.current;
    if (!active || !indicator) return;

    indicator.style.height = `${active.offsetHeight}px`;
    const y = active.offsetTop;

    if (!hasPositioned.current || reducedMotion) {
      gsap.set(indicator, { y, opacity: 1 });
      hasPositioned.current = true;
    } else {
      gsap.to(indicator, { y, duration: 0.22, ease: "power2.out" });
    }
  }, [pathname, reducedMotion]);

  return (
    <aside className="relative flex w-60 shrink-0 flex-col border-r border-mono-hairline bg-black px-4 py-6">
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <div className="h-7 w-7">
          <WireframeMark />
        </div>
        <span className="text-card-title text-mono-ink">Tweetflow</span>
      </div>

      <button
        type="button"
        onClick={openPalette}
        className="mb-6 flex items-center justify-between rounded-md border border-mono-hairline px-3 py-2 text-caption text-mono-ink-faint transition-colors duration-150 hover:border-mono-hairline-strong hover:text-mono-ink-subtle"
      >
        <span className="flex items-center gap-2">
          <Search size={13} className="[stroke-width:1.25]" />
          Search
        </span>
        <kbd className="rounded border border-mono-hairline px-1 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      <div
        ref={indicatorRef}
        aria-hidden
        className="pointer-events-none absolute left-4 right-4 top-0 rounded-full bg-white/[0.07] opacity-0"
        style={{ willChange: "transform" }}
      />

      {navGroups.map((group) => (
        <div key={group.label} className="mb-6">
          <div className="mb-2 px-3 text-eyebrow uppercase text-mono-ink-faint">
            {group.label}
          </div>
          <nav className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  ref={(el) => {
                    linkRefs.current[item.href] = el;
                  }}
                  className={`group relative z-10 flex items-center gap-2.5 rounded-full px-3 py-2 text-body-sm transition-colors duration-150 ${
                    isActive
                      ? "text-mono-ink"
                      : "text-mono-ink-subtle hover:bg-white/[0.04] hover:text-mono-ink"
                  }`}
                >
                  <Icon
                    size={16}
                    className="shrink-0 origin-center [stroke-width:1.25] transition-[stroke-width,transform] duration-150 group-hover:scale-110 group-hover:[stroke-width:2]"
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}

      {streak > 0 && (
        <div className="mt-auto flex items-center gap-2 px-3 py-2 text-caption text-mono-ink-faint">
          <StreakIcon size={13} className="[stroke-width:1.25] text-mono-ink-subtle" />
          <span>
            {streak}-day posting streak
          </span>
        </div>
      )}
    </aside>
  );
}
