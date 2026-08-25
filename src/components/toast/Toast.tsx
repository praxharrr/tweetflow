"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { ToastItem } from "./ToastProvider";

export default function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-center gap-3 rounded-full border border-mono-hairline-strong bg-mono-surface-2 px-4 py-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-200 motion-reduce:transition-none ${
        entered ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
      }`}
    >
      <span className="text-caption text-mono-ink">{toast.message}</span>
      {toast.actionLabel && (
        <button
          onClick={() => {
            toast.onAction?.();
            onDismiss();
          }}
          className="text-caption font-semibold text-mono-ink underline underline-offset-2 transition-colors duration-150 hover:text-white"
        >
          {toast.actionLabel}
        </button>
      )}
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-mono-ink-faint transition-colors duration-150 hover:text-mono-ink"
      >
        <X size={12} />
      </button>
    </div>
  );
}
