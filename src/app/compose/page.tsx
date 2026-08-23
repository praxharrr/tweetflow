import TweetComposer from "@/components/compose/TweetComposer";

export default function ComposePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">New Tweet</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Draft a tweet, or let AI help you write one.
      </p>

      <div className="mt-6 max-w-2xl">
        <TweetComposer />
      </div>
    </div>
  );
}