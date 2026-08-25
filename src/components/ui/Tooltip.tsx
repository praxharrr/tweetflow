"use client";

import { ReactNode, useId } from "react";

export default function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const id = useId();

  return (
    <span className="group/tooltip relative inline-flex">
      <span aria-describedby={id}>{children}</span>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-56 -translate-x-1/2 rounded-md border border-mono-hairline-strong bg-mono-surface-2 px-2.5 py-1.5 text-caption text-mono-ink opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
