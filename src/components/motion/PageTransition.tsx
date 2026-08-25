"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reducedMotion) {
      gsap.set(el, { opacity: 1, scale: 1 });
      return;
    }

    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.985 },
      { opacity: 1, scale: 1, duration: 0.22, ease: "power2.out" },
    );
  }, [pathname, reducedMotion]);

  return (
    <div key={pathname} ref={ref}>
      {children}
    </div>
  );
}
