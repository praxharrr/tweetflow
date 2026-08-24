import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";

export default async function DraftsPage() {
  const drafts = await prisma.post.findMany({
    where: { status: "draft" },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Drafts</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {drafts.length} saved draft{drafts.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drafts.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-16 text-center">
            <FileText size={28} className="text-neutral-300" />
            <p className="mt-3 text-sm text-neutral-400">
              No drafts yet — write one from the New Tweet page.
            </p>
          </div>
        )}

        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <p className="line-clamp-4 text-sm text-neutral-800">
              {draft.content}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
              <span>
                {new Date(draft.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span>{draft.content.length} chars</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}