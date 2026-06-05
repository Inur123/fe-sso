import { Skeleton } from "@/components/ui/skeleton";

export default function AppsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-40 rounded" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>
        <Skeleton className="h-9 w-28 rounded" />
      </div>
      <Skeleton className="h-px w-full" />

      {/* Skeleton for Filters outside the card */}
      <div className="flex flex-col sm:flex-row items-end gap-3">
        <div className="flex-1 w-full space-y-1">
          <Skeleton className="h-3.5 w-10 rounded" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <div className="w-full sm:w-[150px] space-y-1">
          <Skeleton className="h-3.5 w-12 rounded" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <div className="w-full sm:w-[150px] space-y-1">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border-b last:border-0"
          >
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
