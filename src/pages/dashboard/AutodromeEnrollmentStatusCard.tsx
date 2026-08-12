import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  OctagonX,
  Video,
} from 'lucide-react'
import { useAutodromeEnrollmentStatusQuery } from '@/features/dashboard'
import { StatusCardSkeleton } from '@/components/ui'
import { cn } from '@/lib'

const STATUS = { SENT: 1, FAILED: 2, PENDING: 3, ENDED: 4 } as const

function statusMeta(
  status: number | null | undefined,
  t: (key: string) => string,
) {
  switch (status) {
    case STATUS.SENT:
      return {
        key: 'sent' as const,
        label: t('dashboard.sent'),
        icon: CheckCircle2,
        badge: 'bg-teal-soft text-teal',
        panel: 'bg-teal-soft/70 text-teal',
      }
    case STATUS.FAILED:
      return {
        key: 'failed' as const,
        label: t('dashboard.failed'),
        icon: AlertTriangle,
        badge: 'bg-rose-soft text-rose',
        panel: 'bg-rose-soft/70 text-rose',
      }
    case STATUS.PENDING:
      return {
        key: 'pending' as const,
        label: t('dashboard.pending'),
        icon: Clock3,
        badge: 'bg-signal-soft text-brand-700',
        panel: 'bg-signal-soft/80 text-brand-700',
      }
    case STATUS.ENDED:
      return {
        key: 'ended' as const,
        label: t('dashboard.ended'),
        icon: OctagonX,
        badge: 'bg-fog text-muted',
        panel: 'bg-fog text-muted',
      }
    default:
      return {
        key: 'default' as const,
        label: t('dashboard.notSent'),
        icon: Video,
        badge: 'bg-fog text-muted',
        panel: 'bg-amber-soft/80 text-amber',
      }
  }
}

/** Avtodrom kamerasiga yuborilish holati (enrollment). */
export function AutodromeEnrollmentStatusCard() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useAutodromeEnrollmentStatusQuery()

  if (isLoading) return <StatusCardSkeleton />
  if (isError || !data?.autodrome) return null

  const autodrome = data.autodrome
  const aos = data.aos
  const group = data.group
  const status = aos?.status ?? null
  const isSent = status === STATUS.SENT
  const visual = statusMeta(status, t)
  const StatusIcon = visual.icon
  const statusLabel = aos?.status_label || visual.label

  let reason: string | null = null
  if (!isSent) {
    if (data.warning === 'image_missing' || data.has_image === false) {
      reason = t('dashboard.reasonNoImage')
    } else if (data.reason) {
      reason = data.reason
    } else if (group && group.synced === false) {
      reason = group.block_reason || t('dashboard.reasonPending')
    } else if (status === STATUS.FAILED) {
      reason = t('dashboard.reasonFailed')
    } else {
      reason = t('dashboard.reasonPending')
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-mist/70 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-signal">
            <Video className="size-3.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h4 className="text-[12px] font-semibold text-deep">
              {t('dashboard.enrollmentTitle')}
            </h4>
            <p className="truncate text-[11px] text-muted">
              {autodrome.name || '—'}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold',
            visual.badge,
          )}
        >
          <StatusIcon className="size-3" aria-hidden />
          {statusLabel}
        </span>
      </div>

      {!autodrome.is_face_control ? (
        <div className="border-t border-mist/40 px-3 py-1.5">
          <span className="inline-flex items-center gap-1 rounded bg-amber-soft px-1.5 py-0.5 text-[10px] font-medium text-amber">
            <AlertTriangle className="size-3" aria-hidden />
            {t('dashboard.noCameraInstalled')}
          </span>
        </div>
      ) : null}

      {isSent ? (
        <div
          className={cn(
            'flex items-start gap-2 border-t border-mist/40 px-3 py-2 text-[12px]',
            visual.panel,
          )}
        >
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">{t('dashboard.sentSuccessTitle')}</p>
            <p className="opacity-90">{t('dashboard.sentSuccessText')}</p>
          </div>
        </div>
      ) : reason ? (
        <div
          className={cn(
            'flex items-start gap-2 border-t border-mist/40 px-3 py-2 text-[12px]',
            visual.panel,
          )}
        >
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">{t('dashboard.whyNotSent')}</p>
            <p className="opacity-90">{reason}</p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
