"use client";

import { useSyncExternalStore } from "react";
import { PredictiveArcCanvas } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

function subscribe() {
  return () => {};
}
function getClientSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

export default function PredictiveArcBackground() {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  if (!mounted) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-60">
      <PredictiveArcCanvas
        mode="dark"
        speed={1.0}
        hue={0}
        saturation={1}
        brightness={0.9}
      />
    </div>
  );
}