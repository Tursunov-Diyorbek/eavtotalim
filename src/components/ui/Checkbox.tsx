import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> & {
  onChange?: (checked: boolean) => void
}

/** Jadval qator tanlash va oddiy belgilash. */
export function Checkbox({
  className,
  onChange,
  disabled,
  ...props
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.checked)}
      className={cn(
        'size-4 shrink-0 rounded border-mist accent-signal',
        disabled && 'cursor-not-allowed opacity-40',
        className,
      )}
      {...props}
    />
  )
}
