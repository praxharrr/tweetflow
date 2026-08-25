"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import CommandPalette from "./CommandPalette";
import ShortcutsCheatsheet from "./ShortcutsCheatsheet";

const CHORD_MAP: Record<string, string> = {
  d: "/",
  n: "/compose",
  t: "/threads",
  r: "/drafts",
  q: "/queue",
  c: "/calendar",
  s: "/settings",
};

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

interface ShortcutsContextValue {
  openPalette: () => void;
  openCheatsheet: () => void;
}

const ShortcutsContext = createContext<ShortcutsContextValue | null>(null);

export function useShortcuts(): ShortcutsContextValue {
  const ctx = useContext(ShortcutsContext);
  if (!ctx) throw new Error("useShortcuts must be used within ShortcutsProvider");
  return ctx;
}

export default function ShortcutsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const gPressed = useRef(false);
  const gTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }

      if (e.key === "Escape" && (paletteOpen || cheatsheetOpen)) {
        setPaletteOpen(false);
        setCheatsheetOpen(false);
        return;
      }

      if (paletteOpen || cheatsheetOpen) return;
      if (isTypingTarget(e.target)) return;

      if (e.key === "?") {
        e.preventDefault();
        setCheatsheetOpen(true);
        return;
      }

      if (e.key.toLowerCase() === "g" && !meta) {
        gPressed.current = true;
        if (gTimeout.current) clearTimeout(gTimeout.current);
        gTimeout.current = setTimeout(() => {
          gPressed.current = false;
        }, 1200);
        return;
      }

      if (gPressed.current) {
        const href = CHORD_MAP[e.key.toLowerCase()];
        gPressed.current = false;
        if (gTimeout.current) clearTimeout(gTimeout.current);
        if (href) {
          e.preventDefault();
          router.push(href);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paletteOpen, cheatsheetOpen, router]);

  return (
    <ShortcutsContext.Provider
      value={{
        openPalette: () => setPaletteOpen(true),
        openCheatsheet: () => setCheatsheetOpen(true),
      }}
    >
      {children}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ShortcutsCheatsheet open={cheatsheetOpen} onClose={() => setCheatsheetOpen(false)} />
    </ShortcutsContext.Provider>
  );
}
