import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'section' | 'aside' | 'article'
  padding?: 'none' | 'sm' | 'md'
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
} as const

/** Oq bordered surface — kartalar o‘rniga bir xil panel. */
export function Panel({
  as: Tag = 'div',
  padding = 'none',
  className,
  ...props
}: PanelProps) {
  return (
    <Tag
      className={cn(
        'overflow-hidden rounded-xl border border-mist/70 bg-white',
        paddings[padding],
        className,
      )}
      {...props}
    />
  )
}
