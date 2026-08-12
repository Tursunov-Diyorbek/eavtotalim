import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { Button } from './Button'
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
}: PaginationProps) {
  const { t } = useTranslation()
  const safeTotal = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(1, page), safeTotal)
  const showSizeChanger =
    pageSize != null && typeof onPageSizeChange === 'function'

  if (hideIfSingle && safeTotal <= 1 && !showSizeChanger && total == null) {
    return null
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-wrap items-center gap-2',
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
              if (!Number.isFinite(next) || next <= 0) return
              onPageSizeChange(next)
            }}
            className="min-w-18"
            placeholder={t('common.pageSize')}
          />
        ) : null}

        <div className="flex h-10 shrink-0 items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={safePage <= 1}
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            aria-label={t('common.pagePrev')}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-signal-soft px-2 text-[12px] leading-none font-semibold text-signal tabular-nums">
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
            onClick={() => onPageChange(Math.min(safeTotal, safePage + 1))}
            aria-label={t('common.pageNext')}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
