import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40 rounded" />
        <Skeleton className="h-4 w-56 rounded mt-2" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="rounded-xl border p-6 space-y-4 flex flex-col items-center">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2 flex flex-col items-center">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-4 w-48 rounded" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-8 w-28 rounded" />
        </div>
        <div className="rounded-xl border p-6 space-y-6">
          <Skeleton className="h-5 w-28 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-9 w-full rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-9 w-full rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-9 w-full rounded" />
          </div>
          <Skeleton className="h-9 w-full rounded" />
        </div>
      </div>
    </div>
  );
}
