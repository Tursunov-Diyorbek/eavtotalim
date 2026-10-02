import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { readStoredPaging, writeStoredPaging } from '@/lib/tablePaging'
import { Button } from './Button'
import { Input } from './Input'
import { Select } from './Select'

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

export type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  /**
   * Bitta sahifa bo‘lsa yashirish.
   * Paginationli ro‘yxatlarda odatda `false` (default) — doim ko‘rinadi.
   */
  hideIfSingle?: boolean
  /** `1` o‘rniga `1/5` */
  showTotal?: boolean
  /** Jami yozuvlar (chapda "Jami: N") */
  total?: number
  /** Sahifadagi elementlar soni */
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: readonly number[]
  /**
   * Sahifa / o‘lcham sessionStorage da saqlanadi (refresh va «orqaga» dan keyin tiklanadi).
   * Modal / tanlash jadvallarida `false`.
   */
  persist?: boolean
  /** Bitta route da bir nechta Pagination bo‘lsa — farqlovchi kalit */
  storageKey?: string
}

/** Standart sahifa navigatsiyasi — paginationli joylarda doim shu. */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  hideIfSingle = false,
  showTotal = true,
  total,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  persist = true,
  storageKey,
}: PaginationProps) {
  const { t } = useTranslation()
  const { pathname, search } = useLocation()
  const [jump, setJump] = useState('')
  const safeTotal = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(1, page), safeTotal)
  const showSizeChanger =
    pageSize != null && typeof onPageSizeChange === 'function'

  const persistKey = persist
    ? `${pathname}${search}${storageKey ? `#${storageKey}` : ''}`
    : null

  const latest = useRef({ page, pageSize, onPageChange, onPageSizeChange })
  useLayoutEffect(() => {
    latest.current = { page, pageSize, onPageChange, onPageSizeChange }
  })

  const restored = useRef(false)

  // Sahifa effektlari (`setPage(1)` va h.k.) dan keyin tiklash — shuning uchun setTimeout.
  useEffect(() => {
    restored.current = !persistKey
    if (!persistKey) return
    const saved = readStoredPaging(persistKey)
    const timer = window.setTimeout(() => {
      const current = latest.current
      if (saved) {
        const sizeChanged =
          saved.size != null &&
          current.pageSize != null &&
          typeof current.onPageSizeChange === 'function' &&
          saved.size !== current.pageSize
        if (sizeChanged) current.onPageSizeChange?.(saved.size!)
        if (sizeChanged || saved.page !== current.page) current.onPageChange(saved.page)
      }
      restored.current = true
    }, 0)
    return () => window.clearTimeout(timer)
  }, [persistKey])

  useEffect(() => {
    if (!persistKey || !restored.current) return
    writeStoredPaging(persistKey, { page, size: pageSize })
  }, [persistKey, page, pageSize])

  useEffect(() => {
    if (!restored.current || !total || totalPages < 1 || page <= totalPages) return
    latest.current.onPageChange(totalPages)
  }, [page, total, totalPages])

  if (hideIfSingle && safeTotal <= 1 && !showSizeChanger && total == null) {
    return null
  }

  const go = (next: number) => {
    if (next !== safePage) onPageChange(next)
  }

  const submitJump = () => {
    const next = Number(jump)
    setJump('')
    if (Number.isInteger(next) && next >= 1 && next <= safeTotal) go(next)
  }

  const onJumpKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    submitJump()
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex shrink-0 flex-wrap items-center gap-2',
        total != null ? 'justify-between' : 'justify-end',
        className,
      )}
    >
      {total != null ? (
        <p className="m-0 text-[12px] text-muted">
          {t('common.total', { count: total })}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {showSizeChanger ? (
          <Select
            value={pageSize}
            options={pageSizeOptions.map((value) => ({
              value,
              label: String(value),
            }))}
            onChange={(e) => {
              const next = Number(e.target.value)
              if (!Number.isFinite(next) || next <= 0 || next === pageSize) return
              onPageSizeChange(next)
            }}
            className="min-w-18"
            placeholder={t('common.pageSize')}
          />
        ) : null}

        <div className="flex h-9 shrink-0 items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={safePage <= 1}
            onClick={() => go(Math.max(1, safePage - 1))}
            aria-label={t('common.pagePrev')}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-signal-soft px-2 text-[12px] leading-none font-semibold text-signal tabular-nums">
            {showTotal ? (
              <>
                {safePage}
                <span className="mx-0.5 font-medium text-muted">/</span>
                {safeTotal}
              </>
            ) : (
              safePage
            )}
          </span>

          <Button
            variant="outline"
            size="icon-sm"
            disabled={safePage >= safeTotal}
            onClick={() => go(Math.min(safeTotal, safePage + 1))}
            aria-label={t('common.pageNext')}
          >
            <ChevronRight className="size-4" />
          </Button>

          <div className="w-16" title={t('common.goToPage')}>
            <Input
              label=""
              aria-label={t('common.goToPage')}
              inputMode="numeric"
              autoComplete="off"
              placeholder={t('common.goToPagePlaceholder')}
              disabled={safeTotal <= 1}
              value={jump}
              onChange={(e) => setJump(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={onJumpKeyDown}
              onBlur={submitJump}
              className="px-2 text-center tabular-nums"
            />
          </div>
        </div>
      </div>
    </nav>
  )
}
