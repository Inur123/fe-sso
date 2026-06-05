import { Skeleton } from "@/components/ui/skeleton";

export default function SessionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-16 rounded" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="rounded-xl border">
        <div className="p-4 border-b">
          <Skeleton className="h-5 w-32" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-4 gap-4 items-center px-4 py-3 border-b last:border-0"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-8 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
