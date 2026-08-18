import { useId, useState } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  displayToIsoDate,
  formatDateDigits,
  isoToDisplayDate,
} from '@/lib/dateInput'
import { Field, fieldInputClassName } from './Field'

type DateChangeEvent = {
  target: { value: string; name?: string }
}

export type DateInputProps = {
  label: string
  name?: string
  id?: string
  /** ISO YYYY-MM-DD */
  value?: string
  onChange?: (event: DateChangeEvent) => void
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  min?: string
  max?: string
  placeholder?: string
  className?: string
}

/** Qo‘lda DD.MM.YYYY yozish + kalendar tanlash. `onChange` — ISO `YYYY-MM-DD`. */
export function DateInput({
  label,
  name,
  id,
  value = '',
  onChange,
  error,
  hint,
  required,
  disabled,
  min,
  max,
  placeholder = 'kun.oy.yil',
  className,
}: DateInputProps) {
  const reactId = useId()
  const inputId = id ?? name ?? reactId
  const pickerId = `${inputId}-picker`
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(isoToDisplayDate(value))
  const shown = editing ? text : isoToDisplayDate(value)

  function emit(iso: string) {
    onChange?.({ target: { value: iso, name } })
  }

  return (
    <Field
      label={label}
      htmlFor={inputId}
      error={error}
      hint={hint}
      required={required}
      disabled={disabled}
      className={className}
    >
      <input
        id={inputId}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={shown}
        onFocus={() => {
          setEditing(true)
          setText(isoToDisplayDate(value) || text)
        }}
        onBlur={() => {
          const iso = displayToIsoDate(text)
          if (iso === '') emit('')
          else if (iso) emit(iso)
          setEditing(false)
        }}
        onChange={(e) => {
          const raw = e.target.value.trim()
          if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            const iso = displayToIsoDate(raw)
            if (iso) {
              setText(isoToDisplayDate(iso))
              emit(iso)
              return
            }
          }
          const next = formatDateDigits(e.target.value)
          setText(next)
          const iso = displayToIsoDate(next)
          if (iso === '' || iso) emit(iso)
        }}
        className={cn(fieldInputClassName, 'pr-11')}
      />
      <span className="absolute right-1.5 flex items-center">
        <label
          htmlFor={pickerId}
          className={cn(
            'relative inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted transition hover:bg-fog hover:text-deep',
            disabled && 'pointer-events-none opacity-40',
          )}
          title={placeholder}
        >
          <Calendar className="size-4" aria-hidden />
          <input
            id={pickerId}
            type="date"
            tabIndex={-1}
            disabled={disabled}
            min={min}
            max={max}
            value={/^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''}
            onChange={(e) => {
              const iso = e.target.value
              setText(isoToDisplayDate(iso))
              setEditing(false)
              emit(iso)
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={label}
          />
        </label>
      </span>
    </Field>
  )
}
