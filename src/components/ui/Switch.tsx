import { cn } from '@/lib/cn'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  loading?: boolean
  checkedLabel?: string
  uncheckedLabel?: string
  className?: string
  id?: string
  name?: string
}

/** Yoqib-o‘chirish. Ichida holat matni. */
export function Switch({
  checked,
  onChange,
  disabled = false,
  loading = false,
  checkedLabel,
  uncheckedLabel,
  className,
  id,
  name,
}: SwitchProps) {
  const locked = disabled || loading
  return (
    <button
      id={id}
      name={name}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-busy={loading || undefined}
      disabled={locked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 min-w-[6.5rem] items-center rounded-full px-1 text-[11px] font-semibold transition duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/30 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-teal text-white' : 'bg-mist text-deep',
        className,
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute top-1 size-5 rounded-full bg-white shadow-sm transition duration-200',
          checked ? 'right-1' : 'left-1',
          loading && 'animate-pulse',
        )}
        aria-hidden
      />
      <span className={cn('relative w-full truncate', checked ? 'pr-5 pl-1.5 text-left' : 'pr-1.5 pl-5 text-right')}>
        {checked ? checkedLabel : uncheckedLabel}
      </span>
    </button>
  )
}
