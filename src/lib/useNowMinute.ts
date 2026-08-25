"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const id = setInterval(callback, 60000);
  return () => clearInterval(id);
}

function getSnapshot() {
  return Math.floor(Date.now() / 60000);
}

function getServerSnapshot() {
  return 0;
}

export function useNowMinute(): Date | null {
  const minuteBucket = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return minuteBucket === 0 ? null : new Date(minuteBucket * 60000);
}
