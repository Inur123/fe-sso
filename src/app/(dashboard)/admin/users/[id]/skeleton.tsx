import { Skeleton } from "@/components/ui/skeleton";

export default function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-px w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
    </div>
  );
}
