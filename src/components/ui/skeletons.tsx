import { Skeleton, SkeletonCard, SkeletonLines } from '@/components/ui'

/** Dashboard profil + org skeleton. */
export function DashboardProfileSkeleton() {
  return (
    <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <SkeletonCard className="p-0">
        <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[110px_minmax(0,1fr)]">
          <Skeleton className="min-h-[140px] w-full" rounded="lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-14" rounded="md" />
              <Skeleton className="h-5 w-12" rounded="md" />
              <Skeleton className="h-5 w-12" rounded="md" />
            </div>
            <SkeletonLines lines={6} className="mt-3" />
          </div>
        </div>
        <div className="border-t border-mist/60 px-3 py-2.5">
          <Skeleton className="mb-2 h-3 w-40" />
          <SkeletonLines lines={5} />
        </div>
      </SkeletonCard>

      <div className="flex flex-col gap-2.5">
        <SkeletonCard>
          <SkeletonLines lines={10} />
        </SkeletonCard>
        <SkeletonCard>
          <Skeleton className="mb-2 h-3 w-24" />
          <div className="flex gap-1.5">
            <Skeleton className="h-7 w-28" rounded="md" />
            <Skeleton className="h-7 w-28" rounded="md" />
          </div>
        </SkeletonCard>
      </div>
    </div>
  )
}

/** Avtodrom status kartasi skeleton. */
export function StatusCardSkeleton() {
  return (
    <SkeletonCard className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex flex-1 items-start gap-2">
        <Skeleton className="size-7 shrink-0" rounded="lg" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-2.5 w-64 max-w-full" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 shrink-0" rounded="md" />
    </SkeletonCard>
  )
}

/** Direktor dashboard skeleton. */
export function DirectorDashboardSkeleton() {
  return (
    <div className="space-y-2.5">
      <SkeletonCard className="p-0">
        <div className="grid gap-3 p-3 sm:grid-cols-[104px_minmax(0,1fr)]">
          <Skeleton className="min-h-[120px] w-full" rounded="lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-16" rounded="md" />
              <Skeleton className="h-5 w-14" rounded="md" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-12 w-full" rounded="lg" />
              ))}
            </div>
          </div>
        </div>
      </SkeletonCard>
      <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-full" rounded="lg" />
        ))}
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i}>
            <Skeleton className="mb-2 h-8 w-8" rounded="lg" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="mt-1 h-3 w-24" />
          </SkeletonCard>
        ))}
      </div>
      <div className="grid gap-2.5 lg:grid-cols-2">
        <SkeletonCard>
          <SkeletonLines lines={4} />
        </SkeletonCard>
        <SkeletonCard>
          <SkeletonLines lines={4} />
        </SkeletonCard>
      </div>
    </div>
  )
}

/** Ro‘yxat sahifasi skeleton. */
export function ListPageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-mist/70 bg-white">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 border-b border-mist/50 px-4 py-3 last:border-0"
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-6 w-16" rounded="md" />
        </div>
      ))}
    </div>
  )
}
