import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Field, fieldInputClassName } from './Field'
import { Skeleton } from './Skeleton'

export type SelectOption = {
  value: string | number
  label: ReactNode
  /** Lokal qidiruv uchun (label ReactNode bo‘lsa). */
  searchText?: string
}

type SelectChangeEvent = {
  target: {
    value: string
    name?: string
  }
}

export type SelectProps = {
  label?: string
  options: SelectOption[]
  value?: string | number
  defaultValue?: string | number
  onChange?: (event: SelectChangeEvent) => void
  name?: string
  id?: string
  disabled?: boolean
  className?: string
  /** Dropdown min width / trigger width class */
  triggerClassName?: string
  placeholder?: string
  required?: boolean
  error?: string
  searchPlaceholder?: string
  /**
   * Qidiruv maydoni.
   * Default: options > 5 bo‘lsa yoqiladi.
   */
  searchable?: boolean
  /**
   * `md` — forma (Input/DateInput bilan bir xil, label katta).
   * `sm` — filter/pagination (ixcham label).
   * Trigger doim `h-9`. Default: label bo‘lsa `md`, aks holda `sm`.
   */
  size?: 'sm' | 'md'
  /** Tanlangan qiymatni X bilan tozalash (antd allowClear). */
  clearable?: boolean
  /**
   * Masofaviy qidiruv. Berilsa, optionlar lokal filter qilinmaydi
   * (`filterOption={false}`). Har yozishda chaqiladi — debounce ota komponentda.
   */
  onSearch?: (query: string) => void
  /** Dropdown ichida skeleton (masofaviy qidiruv). */
  loading?: boolean
  /** Dropdown min-width (px). Default 220. */
  menuMinWidth?: number
}

type MenuPos = {
  top: number
  left: number
  width: number
  openUp: boolean
}

function normalize(s: string) {
  return s.toLocaleLowerCase('uz').trim()
}

function nodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join(' ')
  if (typeof node === 'object' && 'props' in node) {
    return nodeText((node as { props?: { children?: ReactNode } }).props?.children)
  }
  return ''
}

function optionText(option: SelectOption) {
  return option.searchText?.trim() || nodeText(option.label)
}

/** Zamonaviy select — qidiruv, keyboard, portal dropdown. */
export function Select({
  label,
  options,
  value,
  defaultValue,
  onChange,
  name,
  id,
  disabled,
  className,
  triggerClassName,
  placeholder,
  required,
  error,
  searchPlaceholder,
  searchable,
  size,
  clearable = false,
  onSearch,
  loading = false,
  menuMinWidth = 220,
}: SelectProps) {
  const { t } = useTranslation()
  const reactId = useId()
  const selectId = id ?? name ?? reactId
  const listboxId = `${selectId}-listbox`

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const isControlled = value !== undefined
  const [uncontrolled, setUncontrolled] = useState(
    defaultValue != null ? String(defaultValue) : '',
  )
  const current = isControlled ? String(value ?? '') : uncontrolled

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [pos, setPos] = useState<MenuPos | null>(null)

  const enableSearch = searchable ?? (Boolean(onSearch) || options.length > 5)

  const selected = useMemo(
    () => options.find((o) => String(o.value) === current),
    [options, current],
  )

  const filtered = useMemo(() => {
    if (onSearch || !enableSearch || !query.trim()) return options
    const q = normalize(query)
    return options.filter((o) => normalize(optionText(o)).includes(q))
  }, [options, query, enableSearch, onSearch])

  const updatePosition = () => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pad = 8
    const menuMax = 280
    const width = Math.min(
      Math.max(rect.width, menuMinWidth),
      window.innerWidth - pad * 2,
    )
    let left = rect.left
    if (left + width > window.innerWidth - pad) {
      left = rect.right - width
    }
    if (left < pad) left = pad

    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < menuMax && rect.top > spaceBelow
    setPos({
      top: openUp ? rect.top : rect.bottom + 6,
      left,
      width,
      openUp,
    })
  }

  const close = () => {
    setOpen(false)
    setQuery('')
    setActiveIndex(-1)
  }

  const commit = (next: string) => {
    if (!isControlled) setUncontrolled(next)
    onChange?.({ target: { value: next, name } })
    close()
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return

    updatePosition()
    const onScroll = () => updatePosition()
    const onResize = () => updatePosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)

    const t = window.setTimeout(() => {
      if (enableSearch) searchRef.current?.focus()
      else listRef.current?.focus()
    }, 0)

    return () => {
      window.clearTimeout(t)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open, enableSearch, menuMinWidth])

  useEffect(() => {
    if (!onSearch) return
    onSearch(query)
  }, [query, onSearch])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node
      if (rootRef.current?.contains(target)) return
      if (listRef.current?.contains(target)) return
      close()
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [open])

  useEffect(() => {
    if (!open) return
    const idx = filtered.findIndex((o) => String(o.value) === current)
    setActiveIndex(idx >= 0 ? idx : filtered.length ? 0 : -1)
  }, [open, filtered, current])

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
    }
  }

  const onMenuKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      triggerRef.current?.focus()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) =>
        filtered.length === 0 ? -1 : Math.min((i < 0 ? -1 : i) + 1, filtered.length - 1),
      )
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) =>
        filtered.length === 0 ? -1 : Math.max((i < 0 ? filtered.length : i) - 1, 0),
      )
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const opt = filtered[activeIndex]
      if (opt) commit(String(opt.value))
    }
  }

  const displayLabel =
    selected?.label ||
    placeholder ||
    t('common.selectPlaceholder', { defaultValue: 'Tanlang' })

  const menu =
    open && pos
      ? createPortal(
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={selectId}
            onKeyDown={onMenuKeyDown}
            style={{
              position: 'fixed',
              top: pos.openUp ? undefined : pos.top,
              bottom: pos.openUp
                ? window.innerHeight - pos.top + 6
                : undefined,
              left: pos.left,
              width: pos.width,
              // Modal overlay z-100, toast z-110 — dropdown modal ichida ham ustida
              zIndex: 120,
            }}
            className="overflow-hidden rounded-xl border border-mist/80 bg-white shadow-[0_12px_40px_rgba(15,36,48,0.16)]"
          >
            {enableSearch ? (
              <div className="border-b border-mist/70 p-2">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted"
                    aria-hidden
                  />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onMenuKeyDown}
                    placeholder={
                      searchPlaceholder ||
                      t('common.search', { defaultValue: 'Qidirish…' })
                    }
                    className="h-9 w-full rounded-lg border border-mist/80 bg-fog/50 py-1.5 pr-2.5 pl-8 text-[13px] text-deep outline-none transition placeholder:text-muted/70 focus:border-signal focus:bg-white focus:ring-2 focus:ring-signal/15"
                  />
                </div>
              </div>
            ) : null}

            <div className="max-h-56 overflow-y-auto p-1">
              {loading ? (
                <div className="space-y-1 p-1.5" aria-hidden>
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-5/6" />
                  <Skeleton className="h-8 w-4/5" />
                  <Skeleton className="h-8 w-2/3" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="px-2.5 py-3 text-center text-[12px] text-muted">
                  {t('common.empty')}
                </p>
              ) : (
                filtered.map((opt, index) => {
                  const val = String(opt.value)
                  const isSelected = val === current
                  const isActive = index === activeIndex
                  return (
                    <button
                      key={val || `opt-${index}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => commit(val)}
                      className={cn(
                        'flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] leading-snug transition',
                        isSelected && 'bg-signal-soft font-semibold text-signal',
                        !isSelected && isActive && 'bg-fog text-deep',
                        !isSelected && !isActive && 'text-ink hover:bg-fog/80',
                      )}
                    >
                      <span className="min-w-0 flex-1 break-words text-left">
                        {opt.label}
                      </span>
                      {isSelected ? (
                        <Check className="mt-0.5 size-3.5 shrink-0 text-signal" aria-hidden />
                      ) : (
                        <span className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>,
          document.body,
        )
      : null

  const compact = (size ?? (label ? 'md' : 'sm')) === 'sm'

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      id={selectId}
      name={name}
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={open ? listboxId : undefined}
      onClick={() => {
        if (disabled) return
        if (open) close()
        else setOpen(true)
      }}
      onKeyDown={onTriggerKeyDown}
      className={cn(
        compact
          ? cn(
              'inline-flex h-9 w-full min-w-0 items-center gap-2 rounded-lg border border-mist bg-white px-2.5 text-left text-[13px] font-medium text-deep outline-none transition',
              'hover:border-signal/40 hover:bg-fog/40',
              'focus-visible:border-signal focus-visible:ring-2 focus-visible:ring-signal/20',
              open && 'border-signal ring-2 ring-signal/20',
            )
          : cn(
              fieldInputClassName,
              'flex cursor-pointer items-center gap-2 text-left font-medium',
              open && 'text-deep',
            ),
        disabled && 'cursor-not-allowed opacity-50',
        triggerClassName,
      )}
    >
      <span
        className={cn(
          'min-w-0 flex-1 truncate',
          !selected && 'font-normal text-muted',
        )}
      >
        {displayLabel}
      </span>
      {clearable && current ? (
        <span
          role="button"
          tabIndex={-1}
          className="inline-flex size-5 shrink-0 items-center justify-center rounded-md text-muted hover:bg-fog hover:text-deep"
          aria-label="Clear"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            commit('')
          }}
        >
          <X className="size-3.5" aria-hidden />
        </span>
      ) : null}
      <ChevronDown
        className={cn(
          'size-4 shrink-0 text-muted transition duration-200',
          open && 'rotate-180 text-signal',
        )}
        aria-hidden
      />
    </button>
  )

  return (
    <div
      ref={rootRef}
      className={cn(compact ? 'inline-flex min-w-34 flex-col gap-1' : 'min-w-0 w-full', className)}
    >
      {compact ? (
        <>
          {label ? (
            <label
              htmlFor={selectId}
              className="text-[11px] font-semibold tracking-wide text-muted"
            >
              {required ? (
                <span className="text-rose" aria-hidden>
                  *{' '}
                </span>
              ) : null}
              {label}
            </label>
          ) : null}
          {trigger}
        </>
      ) : (
        <Field
          label={label}
          htmlFor={selectId}
          required={required}
          disabled={disabled}
          error={error}
        >
          {trigger}
        </Field>
      )}

      {menu}
    </div>
  )
}
