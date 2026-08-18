import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Field, fieldInputClassName } from './Field'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
  required?: boolean
  leftSlot?: ReactNode
  rightSlot?: ReactNode
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
    >
      {leftSlot ? (
        <span className="pointer-events-none absolute left-3.5 text-muted/70">
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
          rightSlot && 'pr-11',
          className,
        )}
        {...props}
      />
      {rightSlot ? (
        <span className="absolute right-2 flex items-center">{rightSlot}</span>
      ) : null}
    </Field>
  )
}
