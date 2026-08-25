"use client";

import { useLayoutEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function StaggerReveal({
  children,
  className,
  delay = 0,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    const items = Array.from(container.children);
    if (items.length === 0) return;

    if (reducedMotion) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      items,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.32,
        ease: "power2.out",
        stagger: 0.04,
        delay,
      },
    );
  }, [reducedMotion, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
