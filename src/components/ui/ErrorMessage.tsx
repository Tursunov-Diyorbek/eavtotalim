import type { HTMLAttributes, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CloudOff } from 'lucide-react'
import { cn } from '@/lib/cn'

type ErrorMessageProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** true bo‘lsa common.loadError */
  fallback?: boolean
  children?: ReactNode
}

/** Yuklash xatosi — EmptyState bilan bir xil visual til. */
export function ErrorMessage({
  children,
  fallback = true,
  className,
  ...props
}: ErrorMessageProps) {
  const { t } = useTranslation()
  const text = children ?? (fallback ? t('common.loadError') : null)
  if (!text) return null

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose/25 bg-linear-to-b from-rose-soft/50 to-white px-6 py-12 text-center',
        className,
      )}
      {...props}
    >
      <div
        className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-rose-soft text-rose shadow-[0_8px_20px_rgba(201,95,110,0.14)] ring-1 ring-rose/20"
        aria-hidden
      >
        <CloudOff className="size-7" />
      </div>
      <p className="font-display m-0 max-w-sm text-[15px] font-semibold tracking-tight text-deep">
        {text}
      </p>
      <p className="m-0 mt-1.5 max-w-md text-[13px] leading-relaxed text-muted">
        {t('common.loadErrorHint')}
      </p>
    </div>
  )
}
