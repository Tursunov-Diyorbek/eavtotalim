import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type DetailItem = {
  label: string
  value?: ReactNode
}

export function DetailList({
  items,
  className,
  dense = false,
}: {
  items: DetailItem[]
  className?: string
  /** Show sahifasidagi zich ustun. */
  dense?: boolean
}) {
  return (
    <dl className={cn(dense ? 'grid gap-x-3 gap-y-1.5' : 'grid gap-x-4 gap-y-3 sm:grid-cols-2', className)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt
            className={cn(
              'font-semibold uppercase tracking-wide text-muted',
              dense ? 'text-[10px] leading-tight' : 'text-[11px]',
            )}
          >
            {item.label}
          </dt>
          <dd
            className={cn(
              'wrap-break-word font-medium text-deep',
              dense ? 'text-[13px] leading-snug' : 'mt-0.5 text-sm',
            )}
          >
            {item.value == null || item.value === '' ? '—' : item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
