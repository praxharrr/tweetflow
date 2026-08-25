"use client";

import { useRef, ReactElement } from "react";
import gsap from "gsap";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

interface MagneticProps {
  children: ReactElement;
  className?: string;
  strength?: number;
}

export default function Magnetic({
  children,
  className = "inline-block",
  strength = 14,
}: MagneticProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const quick = useRef<{
    x: gsap.QuickToFunc;
    y: gsap.QuickToFunc;
  } | null>(null);

  const target = () => wrapperRef.current?.firstElementChild as HTMLElement | null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const el = target();
    const wrapper = wrapperRef.current;
    if (!el || !wrapper) return;

    if (!quick.current) {
      quick.current = {
        x: gsap.quickTo(el, "x", { duration: 0.25, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 0.25, ease: "power3.out" }),
      };
    }

    const rect = wrapper.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    quick.current.x(relX * (strength / 100));
    quick.current.y(relY * (strength / 100));
  };

  const handleMouseLeave = () => {
    const el = target();
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: "power3.out" });
  };

  return (
    <div
      ref={wrapperRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
