import { useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
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
  onChange,
  ...props
}: InputProps) {
  const { t } = useTranslation()
  const [pickedName, setPickedName] = useState('')
  const inputId = id ?? props.name
  const isFile = type === 'file'
  const isPicker = type === 'time' || type === 'date' || type === 'datetime-local'
  const large = size === 'lg'

  if (isFile) {
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
        <label
          htmlFor={inputId}
          className={cn(
            'flex h-full w-full min-w-0 cursor-pointer items-center gap-2 px-1',
            disabled && 'pointer-events-none',
            className,
          )}
        >
          <span className="inline-flex h-7 shrink-0 items-center rounded-md bg-fog px-2.5 text-[12px] font-medium leading-none text-ink">
            {t('common.chooseFile')}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] leading-none text-muted">
            {pickedName || t('common.noFileChosen')}
          </span>
          <input
            id={inputId}
            type="file"
            disabled={disabled}
            className="sr-only"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setPickedName(event.target.files?.[0]?.name ?? '')
              onChange?.(event)
            }}
            {...props}
          />
        </label>
      </Field>
    )
  }

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
        onChange={onChange}
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
