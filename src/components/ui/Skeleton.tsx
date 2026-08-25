export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-white/[0.06] motion-reduce:animate-none ${className}`}
    />
  );
}
