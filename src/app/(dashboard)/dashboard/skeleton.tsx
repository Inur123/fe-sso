import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-36 rounded" />
        <Skeleton className="h-4 w-52 rounded mt-2" />
      </div>

      <Separator />

      {/* Profile Card Skeleton */}
      <div className="border border-slate-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <Skeleton className="h-16 w-16 rounded-full shrink-0" />
        <div className="space-y-2.5 w-full min-w-0">
          <Skeleton className="h-6 w-40 rounded" />
          <Skeleton className="h-4 w-60 rounded" />
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Skeleton className="h-5.5 w-20 rounded-full" />
            <Skeleton className="h-5.5 w-24 rounded-full" />
            <Skeleton className="h-5.5 w-36 rounded-full" />
          </div>
        </div>
      </div>

      {/* Quick Links Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="border border-slate-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 rounded-2xl p-6 space-y-4"
          >
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
