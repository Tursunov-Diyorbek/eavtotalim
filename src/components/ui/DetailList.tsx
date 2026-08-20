import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type DetailItem = {
  label: string
  value?: ReactNode
}

export function DetailList({
  items,
  className,
}: {
  items: DetailItem[]
  className?: string
}) {
  return (
    <dl className={cn('grid gap-x-4 gap-y-3 sm:grid-cols-2', className)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {item.label}
          </dt>
          <dd className="mt-0.5 wrap-break-word text-sm font-medium text-deep">
            {item.value == null || item.value === '' ? '—' : item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
