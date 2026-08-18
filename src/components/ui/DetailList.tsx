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
    <dl className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[12px] font-semibold text-ink/65">{item.label}</dt>
          <dd className="mt-0.5 break-words text-sm text-ink">
            {item.value == null || item.value === '' ? '—' : item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
