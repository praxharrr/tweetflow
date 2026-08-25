"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("focus", callback);
  window.addEventListener("blur", callback);
  document.addEventListener("visibilitychange", callback);
  return () => {
    window.removeEventListener("focus", callback);
    window.removeEventListener("blur", callback);
    document.removeEventListener("visibilitychange", callback);
  };
}

function getSnapshot() {
  return !document.hidden && document.hasFocus();
}

function getServerSnapshot() {
  return true;
}

export function useWindowFocus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
