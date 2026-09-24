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
  /** `line` — pastki chiziqli tab (eski show). */
  variant?: 'soft' | 'line'
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
  variant = 'soft',
  'aria-label': ariaLabel,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        variant === 'line'
          ? 'flex w-full flex-nowrap gap-0 overflow-x-auto border-b border-mist'
          : 'flex flex-wrap gap-1.5',
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
            variant={variant === 'line' ? 'ghost' : active ? 'primary' : 'soft'}
            active={variant === 'soft' && active}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              variant === 'line'
                ? cn(
                    '!h-auto !rounded-none !bg-transparent !px-3 !py-2.5 !shadow-none',
                    '-mb-px border-b-2 whitespace-nowrap hover:!bg-transparent',
                    active
                      ? '!border-signal font-semibold !text-signal'
                      : '!border-transparent !text-ink hover:!text-signal',
                  )
                : !active && 'text-muted',
            )}
          >
            {item.icon}
            {item.label}
          </Button>
        )
      })}
    </div>
  )
}
