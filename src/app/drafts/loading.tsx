import Skeleton from "@/components/ui/Skeleton";
import Card from "@/components/ui/Card";

export default function DraftsLoading() {
  return (
    <div>
      <Skeleton className="h-9 w-36" />
      <Skeleton className="mt-2 h-4 w-28" />
      <Skeleton className="mt-4 h-9 w-full max-w-md" />

      <div className="mt-6 flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-7 w-16 rounded-full" />
        ))}
      </div>

      <div className="mt-4 columns-1 gap-2 sm:columns-2 lg:columns-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="mb-2 break-inside-avoid">
            <Card className="p-4">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-5/6" />
              <Skeleton className="mt-2 h-3 w-2/3" />
              <Skeleton className="mt-4 h-3 w-20" />
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
