import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { Icons } from '../icons'
import { cn } from '@/lib/cn'

export function SmToast({
  text,
  type = 'warning',
  onClose,
}: {
  text?: string | null
  type?: 'warning' | 'success' | 'error'
  onClose?: () => void
}) {
  useEffect(() => {
    if (!text) return undefined
    const timer = window.setTimeout(() => onClose?.(), 3200)
    return () => window.clearTimeout(timer)
  }, [text, onClose])

  if (!text) return null

  return (
    <div className={`sm-toast sm-toast--${type}`} role="status">
      <span className="sm-toast__icon" aria-hidden>
        {type === 'success' ? (
          <CheckCircle2 size={22} />
        ) : (
          <AlertTriangle size={22} />
        )}
      </span>
      <p className="sm-toast__text">{text}</p>
    </div>
  )
}

export function PageHead({
  title,
  onBack,
  right,
}: {
  title: ReactNode
  onBack?: () => void
  right?: ReactNode
}) {
  const { t } = useTranslation()
  const Back = Icons.back
  return (
    <div className="sm-page__head">
      <button
        type="button"
        className="sm-icon-btn"
        onClick={onBack}
        aria-label={t('common.back')}
      >
        <Back size={18} />
      </button>
      <h1 className="sm-page__title">{title}</h1>
      {right ? (
        <div className="sm-page__head-right">{right}</div>
      ) : (
        <span style={{ width: 40 }} />
      )}
    </div>
  )
}

export function PageLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="sm-page__body">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="mb-2.5 h-12 w-full rounded-xl" />
      ))}
    </div>
  )
}

export function PageEmpty({ text }: { text?: string }) {
  const { t } = useTranslation()
  const Inbox = Icons.inbox
  return (
    <div className="sm-empty">
      <div className="sm-empty__icon">
        <Inbox size={36} color="#9aabb7" />
      </div>
      <p>{text ?? t('common.noData')}</p>
    </div>
  )
}

export function ListRow({
  icon,
  iconTone = 'blue',
  title,
  desc,
  badge,
  onClick,
  right,
  showArrow = false,
}: {
  icon?: ReactNode
  iconTone?: string
  title: ReactNode
  desc?: ReactNode
  badge?: ReactNode
  onClick?: () => void
  right?: ReactNode
  showArrow?: boolean
}) {
  const Right = Icons.right
  return (
    <button type="button" className="sm-list-row" onClick={onClick}>
      {icon ? (
        <span
          className={cn('sm-list-row__icon', `sm-list-row__icon--${iconTone}`)}
        >
          {icon}
        </span>
      ) : null}
      <span className="sm-list-row__text">
        <p className="sm-list-row__title">{title}</p>
        {desc ? <p className="sm-list-row__desc">{desc}</p> : null}
      </span>
      {badge ? <span className="sm-badge">{badge}</span> : null}
      {right}
      {showArrow ? <Right size={14} color="#9aa3b2" /> : null}
    </button>
  )
}
