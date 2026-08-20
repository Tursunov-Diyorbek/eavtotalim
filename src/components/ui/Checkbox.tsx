import { useEffect, useRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> & {
  onChange?: (checked: boolean) => void
  indeterminate?: boolean
}

/** Jadval qator tanlash va oddiy belgilash. */
export function Checkbox({
  className,
  onChange,
  disabled,
  indeterminate = false,
  ...props
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <input
      ref={ref}
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
