import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'soft'
  | 'ghost'
  | 'danger'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
    size?: ButtonSize
    loading?: boolean
    /** soft/outline aktiv holat (filter chip) */
    active?: boolean
  }
>

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-signal text-white shadow-[0_10px_24px_rgba(47,126,160,0.28)] hover:bg-signal-hot hover:shadow-[0_12px_28px_rgba(47,126,160,0.34)] focus-visible:ring-signal',
  secondary:
    'bg-white text-ink border border-mist hover:bg-brand-50 focus-visible:ring-brand-100',
  outline:
    'bg-white text-deep border border-mist hover:bg-fog focus-visible:ring-brand-100',
  soft: 'bg-signal-soft/70 text-signal hover:bg-signal-soft focus-visible:ring-signal/30',
  ghost:
    'bg-transparent text-muted hover:bg-brand-50 hover:text-deep focus-visible:ring-brand-100',
  danger:
    'bg-rose-soft text-rose hover:bg-rose/15 focus-visible:ring-rose/30',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 rounded-lg px-3 text-[13px] font-medium',
  md: 'h-9 rounded-lg px-3.5 text-sm font-medium',
  lg: 'h-9 rounded-lg px-5 text-[15px] font-semibold',
  icon: 'size-9 rounded-lg p-0',
  'icon-sm': 'size-9 rounded-lg p-0',
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  active = false,
  type = 'button',
  disabled,
  ...props
}: ButtonProps) {
  const resolvedVariant =
    active && (variant === 'soft' || variant === 'outline')
      ? 'primary'
      : variant

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-pressed={active || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40',
        variants[resolvedVariant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : null}
      {children}
    </button>
  )
}
