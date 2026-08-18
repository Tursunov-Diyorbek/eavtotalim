import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
} from 'react'
import { Search } from 'lucide-react'
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from '@/hooks'
import { cn } from '@/lib/cn'

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  /** label yashirin (a11y) */
  label?: string
  size?: 'sm' | 'md'
  /**
   * onChange kechikishi (ms). Default: `SEARCH_DEBOUNCE_MS`.
   * Lokal filter (sidebar) uchun `0`.
   */
  debounceMs?: number
  type?: HTMLInputElement['type']
}

const sizeClass = {
  sm: 'h-8 rounded-lg py-0 pr-3 pl-8 text-[12px]',
  md: 'h-9 rounded-lg py-0 pr-3 pl-9 text-[13px]',
} as const

const iconClass = {
  sm: 'left-2.5 size-3.5',
  md: 'left-3 size-3.5',
} as const

function asText(value: SearchInputProps['value']) {
  if (value == null) return ''
  return String(value)
}

/** Ro‘yxat qidiruvi — yozish darhol, onChange default 1s debounce. */
export function SearchInput({
  className,
  label = 'Search',
  id,
  size = 'md',
  debounceMs = SEARCH_DEBOUNCE_MS,
  value,
  defaultValue,
  onChange,
  name,
  type = 'search',
  ...props
}: SearchInputProps) {
  const inputId = id ?? name ?? 'search'
  const delay =
    type === 'time' || type === 'date' || type === 'datetime-local'
      ? 0
      : debounceMs

  const [text, setText] = useState(() => asText(value ?? defaultValue ?? ''))
  const lastEmitted = useRef(text)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (value === undefined) return
    const next = asText(value)
    if (next === lastEmitted.current) return
    setText(next)
    lastEmitted.current = next
  }, [value])

  const debounced = useDebouncedValue(text, delay)

  useEffect(() => {
    if (delay <= 0) return
    if (debounced === lastEmitted.current) return
    lastEmitted.current = debounced
    onChangeRef.current?.({
      target: { value: debounced, name },
    } as ChangeEvent<HTMLInputElement>)
  }, [debounced, delay, name])

  const emitNow = (next: string, event: ChangeEvent<HTMLInputElement>) => {
    setText(next)
    if (delay <= 0) {
      lastEmitted.current = next
      onChange?.(event)
    }
  }

  return (
    <div className={cn('relative min-w-0 w-full', className)}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Search
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted',
          iconClass[size],
        )}
        aria-hidden
      />
      <input
        id={inputId}
        name={name}
        type={type}
        size={1}
        className={cn(
          'min-w-0 w-full border border-mist/90 bg-white text-deep outline-none transition placeholder:text-muted focus:border-signal focus:ring-2 focus:ring-signal/20',
          sizeClass[size],
        )}
        {...props}
        value={text}
        onChange={(e) => emitNow(e.target.value, e)}
      />
    </div>
  )
}
