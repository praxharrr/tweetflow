export default function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4db5f5] to-[#1d7fd4] font-semibold text-white ring-1 ring-inset ring-white/20"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}