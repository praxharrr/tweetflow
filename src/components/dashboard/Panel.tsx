import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface PanelProps {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
}

export default function Panel({ title, icon: Icon, action, children }: PanelProps) {
  return (
    <div className="rounded-lg border border-mono-hairline bg-gradient-to-b from-mono-surface-2 to-mono-surface p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.4)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="[stroke-width:1.25] text-mono-ink-subtle" />}
          <h3 className="text-card-title text-mono-ink">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
