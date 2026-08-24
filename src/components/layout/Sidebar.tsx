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
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-neutral-200 bg-white px-4 py-6">
      <div className="mb-8 px-2 text-lg font-bold">Tweetflow</div>
      {navGroups.map((group) => (
        <div key={group.label} className="mb-6">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            {group.label}
          </div>
          <nav className="flex flex-col gap-1">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
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