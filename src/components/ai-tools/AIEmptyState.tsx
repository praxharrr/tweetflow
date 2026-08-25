import AmbientPulse from "@/components/ui/AmbientPulse";

export default function AIEmptyState({
  message,
  examples,
  onPick,
}: {
  message: string;
  examples: string[];
  onPick: (example: string) => void;
}) {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 rounded-lg border border-mono-hairline bg-mono-surface py-16 text-center">
      <AmbientPulse />
      <p className="max-w-xs text-body-sm text-mono-ink-subtle">{message}</p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onPick(example)}
            className="rounded-full border border-mono-hairline px-3 py-1.5 text-caption text-mono-ink-subtle transition-colors duration-150 hover:bg-white/[0.06] hover:text-mono-ink"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
