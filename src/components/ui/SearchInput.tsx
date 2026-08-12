import type { InputHTMLAttributes } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/cn'

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /** label yashirin (a11y) */
  label?: string
  size?: 'sm' | 'md'
}

const sizeClass = {
  sm: 'h-8 rounded-lg py-0 pr-3 pl-8 text-[12px]',
  md: 'h-9 rounded-lg py-0 pr-3 pl-9 text-[13px]',
} as const

const iconClass = {
  sm: 'left-2.5 size-3.5',
  md: 'left-3 size-3.5',
} as const

/** Ro‘yxat / menyu qidiruvi — label-siz ixcham input. */
export function SearchInput({
  className,
  label = 'Search',
  id,
  size = 'md',
  ...props
}: SearchInputProps) {
  const inputId = id ?? props.name ?? 'search'

  return (
    <div className={cn('relative w-full', className)}>
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
        type="search"
        className={cn(
          'w-full border border-mist/90 bg-white text-deep outline-none transition placeholder:text-muted focus:border-signal focus:ring-2 focus:ring-signal/20',
          sizeClass[size],
        )}
        {...props}
      />
    </div>
  )
}
