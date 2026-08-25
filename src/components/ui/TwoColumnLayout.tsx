import { ReactNode } from "react";

export default function TwoColumnLayout({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">{left}</div>
      <div className="flex flex-col gap-4 lg:sticky lg:top-8">{right}</div>
    </div>
  );
}
