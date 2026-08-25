import { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-mono-hairline bg-gradient-to-b from-mono-surface-2 to-mono-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.4)] ${className}`}
    >
      {children}
    </div>
  );
}
