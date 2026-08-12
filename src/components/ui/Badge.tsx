import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone =
  | 'neutral'
  | 'signal'
  | 'teal'
  | 'amber'
  | 'rose'
  | 'violet'
  | 'indigo'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone
}

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-fog text-deep',
  signal: 'bg-signal-soft text-signal',
  teal: 'bg-teal-soft text-teal',
  amber: 'bg-amber-soft text-amber',
  rose: 'bg-rose-soft text-rose',
  violet: 'bg-violet-soft text-violet',
  indigo: 'bg-indigo-soft text-indigo',
}

/** Kichik status / label chip. */
export function Badge({
  tone = 'neutral',
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
