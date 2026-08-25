import { ReactNode } from "react";

export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-display-md text-mono-ink">{title}</h1>
        <p className="mt-1 text-body-sm text-mono-ink-subtle">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}
