import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { Field, fieldInputClassName } from './Field'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
  hint?: string
  required?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      error,
      hint,
      required,
      className,
      id,
      disabled,
      rows = 4,
      ...props
    },
    ref,
  ) {
    const inputId = id ?? props.name

    return (
      <Field
        label={label}
        htmlFor={inputId}
        error={error}
        hint={hint}
        required={required}
        disabled={disabled}
        controlClassName="h-auto min-h-24 items-start"
      >
        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          rows={rows}
          className={cn(
            fieldInputClassName,
            'h-auto min-h-24 resize-y py-2.5 leading-normal',
            className,
          )}
          {...props}
        />
      </Field>
    )
  },
)
