import ThreadComposer from "@/components/threads/ThreadComposer";

export default function ThreadsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Threads</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Compose a connected sequence of tweets, or let AI draft the whole thread.
      </p>

      <div className="mt-6 max-w-2xl">
        <ThreadComposer />
      </div>
    </div>
  );
}