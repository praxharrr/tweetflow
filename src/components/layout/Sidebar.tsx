"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    label: "Navigation",
    items: [
      { label: "Dashboard", href: "/" },
      { label: "New Tweet", href: "/compose" },
      { label: "Threads", href: "/threads" },
      { label: "Drafts", href: "/drafts" },
      { label: "Queue", href: "/queue" },
      { label: "Calendar", href: "/calendar" },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { label: "Trending Topics", href: "/trending-topics" },
      { label: "Viral Opportunities", href: "/viral-opportunities" },
      { label: "Best Posting Times", href: "/best-posting-times" },
    ],
  },
  {
    label: "Account",
    items: [{ label: "Settings", href: "/settings" }],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-hairline bg-canvas px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span className="text-card-title text-ink">Tweetflow</span>
      </div>
      {navGroups.map((group) => (
        <div key={group.label} className="mb-6">
          <div className="mb-2 px-3 text-eyebrow uppercase text-ink-tertiary">
            {group.label}
          </div>
          <nav className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-md px-3 py-2 text-body-sm transition-colors ${
                    isActive
                      ? "bg-surface-1 text-ink"
                      : "text-ink-subtle hover:bg-surface-1 hover:text-ink"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}
