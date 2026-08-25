"use client";

import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { useWindowFocus } from "@/lib/useWindowFocus";
import { useInView } from "@/lib/useInView";
import ParticleFieldFallback from "@/components/three/ParticleFieldFallback";

const ParticleField = dynamic(() => import("@/components/three/ParticleField"), {
  ssr: false,
  loading: () => <ParticleFieldFallback />,
});

export default function DashboardBackground() {
  const reducedMotion = usePrefersReducedMotion();
  const focused = useWindowFocus();
  const { ref, inView } = useInView<HTMLDivElement>(0);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-70"
    >
      {reducedMotion ? (
        <ParticleFieldFallback />
      ) : (
        <ParticleField active={inView && focused} />
      )}
    </div>
  );
}
