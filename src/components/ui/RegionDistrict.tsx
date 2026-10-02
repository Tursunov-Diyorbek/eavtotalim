import { cn } from '@/lib/cn'

function clean(value: string | null | undefined) {
  const text = value?.trim()
  return text && text !== '—' ? text : ''
}

/** Viloyat + tuman — jadvalda doim bitta ustunda (sarlavha `common.regionDistrict`). */
export function RegionDistrict({
  region,
  district,
  className,
}: {
  region?: string | null
  district?: string | null
  className?: string
}) {
  const top = clean(region)
  const bottom = clean(district)
  if (!top && !bottom) return <span className="text-muted">—</span>
  return (
    <div className={cn('flex min-w-0 flex-col leading-tight', className)}>
      <span className="truncate text-ink">{top || bottom}</span>
      {top && bottom ? (
        <span className="mt-0.5 truncate text-[12px] text-muted">{bottom}</span>
      ) : null}
    </div>
  )
}
