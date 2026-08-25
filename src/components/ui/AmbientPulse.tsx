export default function AmbientPulse() {
  return (
    <div className="relative h-10 w-10" aria-hidden>
      <div className="absolute inset-0 rounded-full border border-mono-hairline-strong" />
      <div className="absolute inset-1 rounded-full border border-mono-hairline" />
      <div className="absolute inset-0 animate-[spin_5s_linear_infinite] rounded-full border-t border-white/50 motion-reduce:animate-none" />
    </div>
  );
}
