import type { ComponentType, HTMLAttributes, ReactNode, SVGProps } from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/cn'

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  /** Asosiy sarlavha. Yo‘q bo‘lsa `description` yoki `common.empty`. */
  title?: string
  description?: ReactNode
  action?: ReactNode
  /** Default: Inbox */
  icon?: IconComponent
}

/**
 * Bo‘sh ro‘yxat / modul — yagona «ma’lumot yo‘q» UI.
 * Doim shu komponentni ishlating (jadval `EmptyTR` ham shunga bog‘langan).
 */
export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  className,
  children,
  ...props
}: EmptyStateProps) {
  const { t } = useTranslation()
  const hasTitle = title != null && title !== ''
  const hasDesc = description != null && description !== ''
  const headline =
    (hasTitle ? title : null) ??
    (typeof description === 'string' ? description : null) ??
    t('common.empty')
  const sub = hasTitle && hasDesc
    ? description
    : !hasTitle && hasDesc && typeof description !== 'string'
      ? description
      : !hasTitle && !hasDesc
        ? t('common.emptyHint')
        : null

  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-mist/90 bg-linear-to-b from-fog/80 to-white px-6 py-12 text-center',
        className,
      )}
      {...props}
    >
      <div
        className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-signal-soft text-signal shadow-[0_8px_20px_rgba(47,126,160,0.12)] ring-1 ring-signal/15"
        aria-hidden
      >
        <Icon className="size-7" />
      </div>
      <p className="font-display m-0 max-w-sm text-[15px] font-semibold tracking-tight text-deep">
        {headline}
      </p>
      {sub ? (
        <div className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted">
          {sub}
        </div>
      ) : null}
      {children}
      {action ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action}
        </div>
      ) : null}
    </div>
  )
}
