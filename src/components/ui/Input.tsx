import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Field, fieldInputClassName } from './Field'

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label: string
  error?: string
  hint?: string
  required?: boolean
  leftSlot?: ReactNode
  rightSlot?: ReactNode
  /** Control `h-9`. `sm` — ixcham label (header). `lg` — faqat auth formalar (`h-12`). */
  size?: 'sm' | 'md' | 'lg'
}

export function Input({
  label,
  error,
  hint,
  required,
  leftSlot,
  rightSlot,
  className,
  id,
  disabled,
  type,
  size = 'md',
  ...props
}: InputProps) {
  const inputId = id ?? props.name
  const isPicker = type === 'time' || type === 'date' || type === 'datetime-local'
  const large = size === 'lg'

  return (
    <Field
      label={label}
      htmlFor={inputId}
      error={error}
      hint={hint}
      required={required}
      disabled={disabled}
      size={size}
    >
      {leftSlot ? (
        <span
          className={cn(
            'pointer-events-none absolute inset-y-0 flex items-center text-muted/70',
            large ? 'left-4' : 'left-2.5',
          )}
        >
          {leftSlot}
        </span>
      ) : null}
      <input
        id={inputId}
        type={type}
        disabled={disabled}
        className={cn(
          fieldInputClassName,
          large && 'h-12! text-[15px]!',
          large && !leftSlot && 'px-4!',
          isPicker &&
            'min-w-0 scheme-light [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-datetime-edit]:min-w-0',
          leftSlot && (large ? 'pl-12!' : 'pl-11'),
          rightSlot && (large ? 'pr-12!' : 'pr-10'),
          className,
        )}
        {...props}
      />
      {rightSlot ? (
        <span
          className={cn('absolute inset-y-0 flex items-center', large ? 'right-2' : 'right-1')}
        >
          {rightSlot}
        </span>
      ) : null}
    </Field>
  )
}
