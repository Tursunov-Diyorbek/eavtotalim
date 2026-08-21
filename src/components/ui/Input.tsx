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
  /** Control doim `h-9`. `sm` — ixcham label (header). */
  size?: 'sm' | 'md'
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
        <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-muted/70">
          {leftSlot}
        </span>
      ) : null}
      <input
        id={inputId}
        type={type}
        disabled={disabled}
        className={cn(
          fieldInputClassName,
          isPicker &&
            'min-w-0 scheme-light [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-datetime-edit]:min-w-0',
          leftSlot && 'pl-11',
          rightSlot && 'pr-10',
          className,
        )}
        {...props}
      />
      {rightSlot ? (
        <span className="absolute inset-y-0 right-1 flex items-center">{rightSlot}</span>
      ) : null}
    </Field>
  )
}
