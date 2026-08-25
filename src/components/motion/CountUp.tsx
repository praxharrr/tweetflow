"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

interface CountUpProps {
  value: number;
  className?: string;
}

export default function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reducedMotion) {
      el.textContent = String(value);
      return;
    }

    const counter = { val: 0 };
    const tween = gsap.to(counter, {
      val: value,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = String(Math.round(counter.val));
      },
    });

    return () => {
      tween.kill();
    };
  }, [value, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
