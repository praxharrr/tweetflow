"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Clock } from "lucide-react";

interface Post {
  id: string;
  content: string;
  scheduledFor: string | null;
}

export default function QueueList({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function handleCancel(id: string) {
    setCancellingId(id);
    try {
      await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-16 text-center">
        <Clock size={28} className="text-neutral-300" />
        <p className="mt-3 text-sm text-neutral-400">
          Nothing scheduled yet — schedule a tweet from the New Tweet page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4"
        >
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm text-neutral-800">{post.content}</p>
            <p className="mt-1 text-xs text-neutral-400">
              {post.scheduledFor &&
                new Date(post.scheduledFor).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </p>
          </div>
          <button
            onClick={() => handleCancel(post.id)}
            disabled={cancellingId === post.id}
            className="ml-3 flex shrink-0 items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      ))}
    </div>
  );
}