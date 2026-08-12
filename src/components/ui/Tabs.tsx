import type { ReactNode } from 'react'
import { Button } from './Button'
import { cn } from '@/lib/cn'

export type TabItem<T extends string | number = string> = {
  value: T
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

export type TabsProps<T extends string | number = string> = {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  className?: string
  /** Teng kenglikda (masalan 2 ta segment) */
  fullWidth?: boolean
  'aria-label'?: string
}

/** Bir xil tab / segment — sahifalarda qayta stil qilinmasin. */
export function Tabs<T extends string | number = string>({
  items,
  value,
  onChange,
  size = 'sm',
  className,
  fullWidth = false,
  'aria-label': ariaLabel,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'flex flex-wrap gap-1.5',
        fullWidth && 'w-full [&>button]:flex-1',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <Button
            key={String(item.value)}
            type="button"
            role="tab"
            aria-selected={active}
            size={size}
            variant={active ? 'primary' : 'soft'}
            active={active}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn(!active && 'text-muted')}
          >
            {item.icon}
            {item.label}
          </Button>
        )
      })}
    </div>
  )
}
