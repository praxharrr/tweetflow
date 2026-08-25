import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export default function EmptyState({
  icon: Icon,
  message,
  action,
}: {
  icon: LucideIcon;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-mono-hairline-strong py-16 text-center">
      <Icon size={24} className="[stroke-width:1.25] text-mono-ink-faint" />
      <p className="max-w-xs text-body-sm text-mono-ink-subtle">{message}</p>
      {action}
    </div>
  );
}
