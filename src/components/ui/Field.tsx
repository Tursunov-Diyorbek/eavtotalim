import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type FieldProps = {
  label?: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  className?: string
  controlClassName?: string
  /** `sm` — header filter (ixcham label). Control balandligi doim `h-9`. */
  size?: 'sm' | 'md'
  children: ReactNode
}

/** Input / Select / Date / Search / Export — doim shu balandlik. */
export const CONTROL_HEIGHT = 'h-9'

export const fieldLabelClassName =
  'text-[12px] font-semibold tracking-wide text-ink/65 sm:text-[13px]'

export const fieldControlClassName =
  'relative flex h-9 w-full min-w-0 items-center rounded-lg border border-mist/90 bg-white shadow-[0_1px_2px_rgba(15,36,48,0.04)] transition duration-200 focus-within:border-signal/50 focus-within:shadow-[0_0_0_3px_rgba(47,126,160,0.12)]'

export const fieldInputClassName =
  'h-9 w-full min-w-0 bg-transparent px-3 text-[13px] leading-none text-ink outline-none placeholder:text-muted/40'

/** Label + control + error/hint — Input / DateInput / PhoneInput / Select uchun. */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  disabled,
  className,
  controlClassName,
  size = 'md',
  children,
}: FieldProps) {
  const compact = size === 'sm'
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col text-left',
        compact ? 'gap-1' : 'gap-1.5',
        className ?? 'w-full',
      )}
    >
      {label ? (
        <label
          htmlFor={htmlFor}
          className={
            compact
              ? 'text-[11px] font-medium text-muted'
              : fieldLabelClassName
          }
        >
          {required ? (
            <span className="text-rose" aria-hidden>
              *{' '}
            </span>
          ) : null}
          {label}
        </label>
      ) : null}
      <span
        className={cn(
          'relative flex w-full min-w-0 items-center rounded-lg border border-mist/90 bg-white transition duration-200 focus-within:border-signal/50 focus-within:shadow-[0_0_0_3px_rgba(47,126,160,0.12)]',
          !controlClassName?.includes('h-auto') && 'h-9',
          !compact && 'shadow-[0_1px_2px_rgba(15,36,48,0.04)]',
          controlClassName,
          error &&
            'border-red-300 focus-within:border-red-400 focus-within:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]',
          disabled && 'bg-fog/50 opacity-70',
        )}
      >
        {children}
      </span>
      {error ? (
        <span className="text-xs text-red-500/90">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
    </div>
  )
}
