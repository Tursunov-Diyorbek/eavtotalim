import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
  leftSlot?: ReactNode
  rightSlot?: ReactNode
}

export function Input({
  label,
  error,
  hint,
  leftSlot,
  rightSlot,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name

  return (
    <label className="group flex flex-col gap-1.5 text-left" htmlFor={inputId}>
      <span className="text-[12px] font-semibold tracking-wide text-ink/65 sm:text-[13px]">
        {label}
      </span>
      <span
        className={cn(
          'relative flex items-center rounded-xl border border-mist/90 bg-white shadow-[0_1px_2px_rgba(15,36,48,0.04)] transition duration-200',
          'focus-within:border-signal/50 focus-within:shadow-[0_0_0_3px_rgba(47,126,160,0.12)]',
          error &&
            'border-red-300 focus-within:border-red-400 focus-within:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]',
        )}
      >
        {leftSlot ? (
          <span className="pointer-events-none absolute left-3.5 text-muted/70">
            {leftSlot}
          </span>
        ) : null}
        <input
          id={inputId}
          className={cn(
            'w-full bg-transparent px-3.5 py-2.5 text-[15px] text-ink outline-none placeholder:text-muted/40 sm:py-3',
            leftSlot && 'pl-11',
            rightSlot && 'pr-11',
            className,
          )}
          {...props}
        />
        {rightSlot ? (
          <span className="absolute right-2 flex items-center">{rightSlot}</span>
        ) : null}
      </span>
      {error ? (
        <span className="text-xs text-red-500/90">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  )
}
