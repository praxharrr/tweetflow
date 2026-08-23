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
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-neutral-500" />}
          <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}