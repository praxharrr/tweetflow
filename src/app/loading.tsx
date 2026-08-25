import Skeleton from "@/components/ui/Skeleton";
import Card from "@/components/ui/Card";

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-2 h-4 w-64" />

      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-4 h-9 w-16" />
            <Skeleton className="mt-3 h-7 w-24" />
          </Card>
        ))}
        {[0, 1].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-6 w-14" />
          </Card>
        ))}
      </div>

      <div className="mt-6 h-px w-full bg-mono-hairline" />

      <div className="mt-6 grid grid-cols-1 gap-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <Skeleton className="h-5 w-40" />
            <div className="mt-4 flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </Card>
        </div>
        <Card className="p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-4 h-10 w-full" />
        </Card>
      </div>
    </div>
  );
}
