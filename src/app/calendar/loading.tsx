import Skeleton from "@/components/ui/Skeleton";

export default function CalendarLoading() {
  return (
    <div>
      <Skeleton className="h-9 w-32" />
      <Skeleton className="mt-2 h-4 w-72" />

      <div className="mt-6 rounded-lg border border-mono-hairline bg-gradient-to-b from-mono-surface-2 to-mono-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );
}
