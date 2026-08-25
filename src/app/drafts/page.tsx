import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import DraftsBoard from "@/components/drafts/DraftsBoard";
import { fieldClass } from "@/components/ui/field-styles";

export default async function DraftsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const [drafts, account, settings] = await Promise.all([
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
  ]);

  const displayName = settings.displayName || "You";
  const handle = account?.username ?? displayName.toLowerCase().replace(/\s+/g, "");

  return (
    <div>
      <PageHeader
        title="Drafts"
        subtitle={`${drafts.length} saved draft${drafts.length !== 1 ? "s" : ""}`}
      />

      <form className="mt-4 max-w-md" action="/drafts">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search drafts…"
          aria-label="Search drafts"
          className={fieldClass}
        />
      </form>

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
            query ? `No drafts match "${query}".` : "No drafts yet — write one from the New Tweet page."
          }
        />
      </div>

      {query && (
        <Link
          href="/drafts"
          className="mt-4 inline-block text-caption text-mono-ink-faint hover:text-mono-ink hover:underline"
        >
          Clear search
        </Link>
      )}
    </div>
  );
}
