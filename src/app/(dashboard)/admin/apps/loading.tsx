import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function AdminAppsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-4 w-80 rounded" />
      </div>

      <Separator />

      {/* Skeleton for Filters outside the card */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Skeleton className="h-9 flex-1 w-full rounded-md" />
        <Skeleton className="h-9 w-full sm:w-[150px] rounded-md" />
        <Skeleton className="h-9 w-full sm:w-[150px] rounded-md" />
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="p-6 border-b bg-muted/5">
          <Skeleton className="h-6 w-36 rounded" />
          <Skeleton className="h-4 w-48 rounded mt-1.5" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border-b last:border-0 bg-background"
          >
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
