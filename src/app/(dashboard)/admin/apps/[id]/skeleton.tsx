import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAppDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-px w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
