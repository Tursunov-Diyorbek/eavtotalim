import { cn } from '@/lib/cn'
import {
  formatPhoneLocal,
  parsePhoneDigits,
  toPhoneValue,
} from '@/lib/phone'
import { Field, fieldInputClassName } from './Field'

type PhoneChangeEvent = {
  target: { value: string; name?: string }
}

export type PhoneInputProps = {
  label: string
  name?: string
  id?: string
  value?: string
  onChange?: (event: PhoneChangeEvent) => void
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  className?: string
  placeholder?: string
}

/** O‘zbekiston tel: +998(xx) xxx-xx-xx. `onChange` — `+998XXXXXXXXX`. */
export function PhoneInput({
  label,
  name,
  id,
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  className,
  placeholder = '(00) 000-00-00',
}: PhoneInputProps) {
  const inputId = id ?? name
  const digits = parsePhoneDigits(value)

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
      <span className="pl-3 text-[13px] font-semibold text-deep">+998</span>
      <input
        id={inputId}
        name={name}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        disabled={disabled}
        placeholder={placeholder}
        value={formatPhoneLocal(digits)}
        onChange={(e) => {
          const next = toPhoneValue(e.target.value)
          onChange?.({ target: { value: next, name } })
        }}
        className={cn(fieldInputClassName, 'pl-2')}
      />
    </Field>
  )
}
