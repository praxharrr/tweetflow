import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileEdit, Search, X } from "lucide-react";
import DraftsBoard from "@/components/drafts/DraftsBoard";
import DraftsScene from "@/components/drafts/DraftsScene";
import PredictiveArcBackground from "@/components/dashboard/PredictiveArcBackground";

export default async function DraftsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const [drafts, account, settings, totalDraftCount, oldestDraft] =
    await Promise.all([
      prisma.post.findMany({
        where: {
          status: "draft",
          ...(query ? { content: { contains: query } } : {}),
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.twitterAccount.findFirst(),
      prisma.settings.upsert({
        where: { id: "singleton" },
        create: { id: "singleton" },
        update: {},
      }),
      prisma.post.count({ where: { status: "draft" } }),
      prisma.post.findFirst({
        where: { status: "draft" },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  const displayName = settings.displayName || "You";
  const handle = account?.username ?? displayName.toLowerCase().replace(/\s+/g, "");

  const oldestDays = oldestDraft
    ? // eslint-disable-next-line react-hooks/purity -- Server Component runs once per request, no render-purity concern
      Math.floor((Date.now() - new Date(oldestDraft.createdAt).getTime()) / 86400000)
    : null;

  return (
    <div className="relative min-h-screen">
      <PredictiveArcBackground />

      <header className="relative isolate overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] px-7 py-7 backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-28 -z-10 h-64 w-[32rem] rounded-full opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(29,155,240,0.28), rgba(29,155,240,0) 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-16 -z-10 h-56 w-80 rounded-full opacity-45 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(120,86,255,0.25), rgba(120,86,255,0) 70%)",
          }}
        />

        <DraftsScene />

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <FileEdit size={13} className="[stroke-width:1.75] text-primary" />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                Library
              </span>
            </div>

            <h1 className="mt-3 bg-gradient-to-br from-white via-white to-white/45 bg-clip-text text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-transparent">
              Drafts
            </h1>

            <p className="mt-2 text-body-sm text-white/50">
              <span className="font-medium text-white/80">{totalDraftCount}</span>{" "}
              saved
              {oldestDays !== null && (
                <>
                  <span className="mx-2 text-white/20">·</span>
                  oldest waiting{" "}
                  <span className="font-medium text-white/80">
                    {oldestDays === 0 ? "today" : `${oldestDays}d`}
                  </span>
                </>
              )}
            </p>
          </div>

          <form action="/drafts" className="w-full max-w-xs sm:w-auto">
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/25 px-3.5 py-2.5 transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(29,155,240,0.12)]">
              <Search size={15} className="shrink-0 [stroke-width:1.75] text-mono-ink-faint" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search drafts…"
                aria-label="Search drafts"
                className="min-w-0 flex-1 bg-transparent text-body-sm text-mono-ink outline-none placeholder:text-mono-ink-faint"
              />
              {query && (
                <Link
                  href="/drafts"
                  aria-label="Clear search"
                  className="shrink-0 text-mono-ink-faint transition-colors hover:text-mono-ink"
                >
                  <X size={14} />
                </Link>
              )}
            </div>
          </form>
        </div>
      </header>

      <div className="mt-6">
        <DraftsBoard
          drafts={drafts.map((d) => ({
            id: d.id,
            content: d.content,
            updatedAt: d.updatedAt.toISOString(),
          }))}
          displayName={displayName}
          handle={handle}
          emptyMessage={
            query
              ? `No drafts match "${query}".`
              : "No drafts yet — write one from the New Tweet page."
          }
        />
      </div>
    </div>
  );
}