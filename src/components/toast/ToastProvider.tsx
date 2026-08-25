"use client";

import { createContext, useCallback, useContext, useRef, useState, ReactNode } from "react";
import Toast from "./Toast";

export interface ToastItem {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ShowToastOptions {
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, opts?: ShowToastOptions) => void;
  undoableAction: (
    message: string,
    commit: () => void | Promise<void>,
    opts?: { duration?: number; onUndo?: () => void },
  ) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, opts?: ShowToastOptions) => {
      const id = String(idRef.current++);
      setToasts((prev) => [
        ...prev,
        { id, message, actionLabel: opts?.actionLabel, onAction: opts?.onAction },
      ]);
      const duration = opts?.duration ?? 4000;
      setTimeout(() => remove(id), duration);
    },
    [remove],
  );

  const undoableAction = useCallback(
    (
      message: string,
      commit: () => void | Promise<void>,
      opts?: { duration?: number; onUndo?: () => void },
    ) => {
      const duration = opts?.duration ?? 5000;
      let undone = false;
      const timeoutId = setTimeout(() => {
        if (!undone) commit();
      }, duration);
      showToast(message, {
        actionLabel: "Undo",
        onAction: () => {
          undone = true;
          clearTimeout(timeoutId);
          opts?.onUndo?.();
        },
        duration,
      });
    },
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, undoableAction }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
