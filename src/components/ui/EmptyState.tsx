import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title?: string
  description?: ReactNode
  action?: ReactNode
}

/** Bo‘sh ro‘yxat / modul — dashed panel. */
export function EmptyState({
  title,
  description,
  action,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-mist bg-white px-4 py-10 text-center',
        className,
      )}
      {...props}
    >
      {title ? (
        <p className="font-display text-sm font-semibold text-deep">{title}</p>
      ) : null}
      {description ? (
        <p className={cn('text-sm text-muted', title && 'mt-1')}>{description}</p>
      ) : null}
      {children}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}
