import { Skeleton } from "@/components/ui/skeleton";

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton className="h-96 w-full rounded-xl" key={i} />
      ))}
    </div>
  );
}
