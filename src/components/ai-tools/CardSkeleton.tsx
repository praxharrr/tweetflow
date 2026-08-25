import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";

export default function CardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-1.5 h-3 w-5/6" />
      <Skeleton className="mt-3 h-8 w-full rounded-md" />
    </Card>
  );
}
