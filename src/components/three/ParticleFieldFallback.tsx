export default function ParticleFieldFallback() {
  return (
    <div
      aria-hidden
      className="h-full w-full opacity-[0.12]"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
        backgroundSize: "26px 26px",
      }}
    />
  );
}
