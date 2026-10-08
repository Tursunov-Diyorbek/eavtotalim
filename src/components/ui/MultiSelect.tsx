import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Field, fieldInputClassName } from './Field'
import { Skeleton } from './Skeleton'

export type MultiSelectOption = {
  value: string
  label: ReactNode
  searchText?: string
}

type MultiSelectProps = {
  label?: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  loading?: boolean
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

/** Bir nechta qiymat tanlanadigan select — forma maydoni. */
export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  className,
  loading = false,
}: MultiSelectProps) {
  const { t } = useTranslation()
  const reactId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState<{ top: number; left: number; width: number; openUp: boolean } | null>(
    null,
  )

  const selected = options.filter((item) => value.includes(item.value))
  const enableSearch = options.length > 5
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('uz')
    if (!q) return options
    return options.filter((item) =>
      (item.searchText || nodeText(item.label)).toLocaleLowerCase('uz').includes(q),
    )
  }, [options, query])

  const place = () => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const width = Math.min(Math.max(rect.width, 220), window.innerWidth - 16)
    let left = rect.left
    if (left + width > window.innerWidth - 8) left = rect.right - width
    if (left < 8) left = 8
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < 280 && rect.top > spaceBelow
    setPos({ top: openUp ? rect.top : rect.bottom + 6, left, width, openUp })
  }

  useEffect(() => {
    if (!open) return
    place()
    const onScroll = () => place()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target)) return
      if (listRef.current?.contains(target)) return
      setOpen(false)
      setQuery('')
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [open])

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id])
  }

  const display =
    selected.map((item) => nodeText(item.label)).filter(Boolean).join(', ') ||
    placeholder ||
    t('common.selectPlaceholder')

  const menu =
    open && pos
      ? createPortal(
          <div
            ref={listRef}
            role="listbox"
            aria-multiselectable
            style={{
              position: 'fixed',
              top: pos.openUp ? undefined : pos.top,
              bottom: pos.openUp ? window.innerHeight - pos.top + 6 : undefined,
              left: pos.left,
              width: pos.width,
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
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t('common.search')}
                    className="h-9 w-full rounded-lg border border-mist/80 bg-fog/50 py-1.5 pr-2.5 pl-8 text-[13px] text-deep outline-none"
                  />
                </div>
              </div>
            ) : null}
            <div className="max-h-56 overflow-y-auto p-1">
              {loading ? (
                <div className="space-y-1 p-1.5">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-4/5" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="px-2.5 py-3 text-center text-[12px] text-muted">{t('common.empty')}</p>
              ) : (
                filtered.map((item) => {
                  const on = value.includes(item.value)
                  return (
                    <button
                      key={item.value}
                      type="button"
                      role="option"
                      aria-selected={on}
                      onClick={() => toggle(item.value)}
                      className={cn(
                        'flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] leading-snug',
                        on ? 'bg-signal-soft font-semibold text-signal' : 'text-ink hover:bg-fog/80',
                      )}
                    >
                      <span className="min-w-0 flex-1 break-words">{item.label}</span>
                      {on ? <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden /> : null}
                    </button>
                  )
                })
              )}
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <div className={cn('min-w-0 w-full', className)}>
      <Field label={label} htmlFor={reactId} required={required} disabled={disabled}>
        <button
          ref={triggerRef}
          id={reactId}
          type="button"
          disabled={disabled}
          aria-expanded={open}
          onClick={() => {
            if (disabled) return
            setOpen((prev) => !prev)
          }}
          className={cn(
            fieldInputClassName,
            'flex cursor-pointer items-center gap-2 text-left font-medium',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <span className={cn('min-w-0 flex-1 truncate', selected.length === 0 && 'font-normal text-muted')}>
            {display}
          </span>
          <ChevronDown
            className={cn('size-4 shrink-0 text-muted transition', open && 'rotate-180 text-signal')}
            aria-hidden
          />
        </button>
      </Field>
      {menu}
    </div>
  )
}
