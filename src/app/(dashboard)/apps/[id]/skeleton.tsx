import { Skeleton } from "@/components/ui/skeleton";

export default function AppDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-24 rounded" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
