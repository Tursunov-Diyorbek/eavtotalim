import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  /** rounded-full for avatar, etc. */
  rounded?: 'md' | 'lg' | 'xl' | 'full'
}

/** Asosiy skeleton blok — har joyda shu. */
export function Skeleton({
  className,
  rounded = 'md',
  ...props
}: SkeletonProps) {
  const radius =
    rounded === 'full'
      ? 'rounded-full'
      : rounded === 'xl'
        ? 'rounded-xl'
        : rounded === 'lg'
          ? 'rounded-lg'
          : 'rounded-md'

  return (
    <div
      className={cn(
        'animate-skeleton bg-mist/70',
        radius,
        className,
      )}
      aria-hidden
      {...props}
    />
  )
}

type SkeletonLinesProps = {
  lines?: number
  className?: string
}

/** Bir nechta matn qatori. */
export function SkeletonLines({ lines = 3, className }: SkeletonLinesProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  )
}

type SkeletonCardProps = {
  className?: string
  children?: ReactNode
}

/** Oq kartali skeleton konteyner. */
export function SkeletonCard({ className, children }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-mist/70 bg-white p-3',
        className,
      )}
      role="status"
      aria-busy="true"
    >
      {children}
    </div>
  )
}
