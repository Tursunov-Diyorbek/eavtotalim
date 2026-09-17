import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  OctagonX,
  Video,
} from 'lucide-react'
import {
  useAutodromeCameraStatusQuery,
  useAutodromeEnrollmentStatusQuery,
} from '@/features/dashboard'
import { StatusCardSkeleton } from '@/components/ui'
import { cn } from '@/lib'

const STATUS = { SENT: 1, FAILED: 2, PENDING: 3, ENDED: 4 } as const

function enrollmentMeta(
  status: number | null | undefined,
  t: (key: string) => string,
) {
  switch (status) {
    case STATUS.SENT:
      return {
        label: t('dashboard.sent'),
        icon: CheckCircle2,
        badge: 'bg-teal-soft text-teal',
      }
    case STATUS.FAILED:
      return {
        label: t('dashboard.failed'),
        icon: AlertTriangle,
        badge: 'bg-rose-soft text-rose',
      }
    case STATUS.PENDING:
      return {
        label: t('dashboard.pending'),
        icon: Clock3,
        badge: 'bg-signal-soft text-brand-700',
      }
    case STATUS.ENDED:
      return {
        label: t('dashboard.ended'),
        icon: OctagonX,
        badge: 'bg-fog text-muted',
      }
    default:
      return {
        label: t('dashboard.notSent'),
        icon: Video,
        badge: 'bg-fog text-muted',
      }
  }
}

/** Yuqori qator: enrollment + kamera holati — bitta ixcham strip. */
export function StudentDashboardStatusStrip() {
  const { t } = useTranslation()
  const enrollment = useAutodromeEnrollmentStatusQuery()
  const camera = useAutodromeCameraStatusQuery()

  if (enrollment.isLoading) return <StatusCardSkeleton />

  const data = enrollment.data
  const hasEnrollment = Boolean(data?.autodrome) && !enrollment.isError
  const cameraPayload =
    !camera.isError && camera.data?.status === 'found'
      ? camera.data.data
      : null

  if (!hasEnrollment && !cameraPayload && !camera.data) return null

  const autodrome = data?.autodrome
  const aos = data?.aos
  const status = aos?.status ?? null
  const visual = enrollmentMeta(status, t)
  const StatusIcon = visual.icon
  const statusLabel = aos?.status_label || visual.label
  const camerasOk = cameraPayload?.cameras_ok
  const camerasTotal = cameraPayload?.cameras_total

  return (
    <section className="flex h-full min-h-0 flex-wrap items-center gap-2 rounded-xl border border-mist/70 bg-white px-2.5 py-1.5">
      {hasEnrollment && autodrome ? (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-50 text-signal">
            <Video className="size-3.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold text-deep">
              {t('dashboard.enrollmentTitle')}
            </p>
            <p className="truncate text-[10px] text-muted">
              {autodrome.name || '—'}
              {status === STATUS.SENT
                ? ` · ${t('dashboard.sentSuccessTitle')}`
                : ''}
            </p>
          </div>
          <span
            className={cn(
              'ml-auto inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
              visual.badge,
            )}
          >
            <StatusIcon className="size-3" aria-hidden />
            {statusLabel}
          </span>
        </div>
      ) : null}

      {cameraPayload || camera.data ? (
        <div className="flex items-center gap-1.5 border-l border-mist/50 pl-2">
          <span className="text-[10px] text-muted">
            {t('dashboard.cameraStatusTitle')}
          </span>
          {cameraPayload && camerasTotal != null ? (
            <span
              className={cn(
                'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                camerasOk != null &&
                  camerasTotal > 0 &&
                  camerasOk >= camerasTotal
                  ? 'bg-teal-soft text-teal'
                  : 'bg-amber-soft text-amber',
              )}
            >
              {camerasOk ?? 0}/{camerasTotal}
            </span>
          ) : (
            <span className="rounded-md bg-fog px-1.5 py-0.5 text-[10px] font-semibold text-muted">
              {camera.data?.status || t('dashboard.unknown')}
            </span>
          )}
        </div>
      ) : null}
    </section>
  )
}
