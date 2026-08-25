export default function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-white/10 font-semibold text-mono-ink"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}
