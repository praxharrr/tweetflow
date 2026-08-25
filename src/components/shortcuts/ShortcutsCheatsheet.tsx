"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "K"], label: "Open command palette" },
  { keys: ["G", "D"], label: "Go to Dashboard" },
  { keys: ["G", "N"], label: "Go to New Tweet" },
  { keys: ["G", "T"], label: "Go to Threads" },
  { keys: ["G", "R"], label: "Go to Drafts" },
  { keys: ["G", "Q"], label: "Go to Queue" },
  { keys: ["G", "C"], label: "Go to Calendar" },
  { keys: ["G", "S"], label: "Go to Settings" },
  { keys: ["⌘", "Enter"], label: "Publish / Schedule (composer)" },
  { keys: ["⌘", "S"], label: "Save draft (composer)" },
  { keys: ["?"], label: "Show this cheatsheet" },
];

export default function ShortcutsCheatsheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="w-full max-w-md rounded-lg border border-mono-hairline-strong bg-mono-surface-2/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-card-title text-mono-ink">Keyboard shortcuts</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="text-mono-ink-faint transition-colors duration-150 hover:text-mono-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {SHORTCUTS.map((s) => (
            <div key={s.label} className="flex items-center justify-between text-body-sm">
              <span className="text-mono-ink-subtle">{s.label}</span>
              <span className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="rounded border border-mono-hairline-strong bg-black/40 px-1.5 py-0.5 font-mono text-[11px] text-mono-ink"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
