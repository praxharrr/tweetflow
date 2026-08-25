import Skeleton from "@/components/ui/Skeleton";
import Card from "@/components/ui/Card";

export default function QueueLoading() {
  return (
    <div>
      <Skeleton className="h-9 w-28" />
      <Skeleton className="mt-2 h-4 w-32" />

      <div className="mt-6 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-20" />
          {[0, 1, 2].map((i) => (
            <Card key={i} className="p-3.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-2/3" />
              <Skeleton className="mt-3 h-3 w-24" />
            </Card>
          ))}
        </div>
        <Card className="p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-[72px] w-full" />
        </Card>
      </div>
    </div>
  );
}
