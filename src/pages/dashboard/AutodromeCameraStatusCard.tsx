import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  ImageIcon,
  Video,
  AlertTriangle,
} from 'lucide-react'
import { useAutodromeCameraStatusQuery } from '@/features/dashboard'
import { StatusCardSkeleton } from '@/components/ui'
import { cn, formatDateTime } from '@/lib'

function statusTone(raw: string | null | undefined) {
  const v = (raw || '').toLowerCase()
  if (v.includes('ok') || v.includes('success') || v.includes('sent')) {
    return 'success' as const
  }
  if (v.includes('fail') || v.includes('error') || v.includes('not_found')) {
    return 'error' as const
  }
  if (v.includes('pending') || v.includes('wait') || v.includes('queue')) {
    return 'pending' as const
  }
  return 'default' as const
}

const TONE_BADGE = {
  success: 'bg-teal-soft text-teal',
  error: 'bg-rose-soft text-rose',
  pending: 'bg-amber-soft text-amber',
  default: 'bg-fog text-muted',
} as const

/** Ixcham: avtodrom kamerasidagi holat. */
export function AutodromeCameraStatusCard() {
  const { t, i18n } = useTranslation()
  const { data: result, isLoading, isError } = useAutodromeCameraStatusQuery()

  if (isLoading) return <StatusCardSkeleton />
  if (isError || !result) return null

  const payload = result.data
  const isFound = result.status === 'found' && payload

  // not_found / boshqa holat — baribir ko‘rsatamiz
  if (!isFound) {
    return (
      <section className="overflow-hidden rounded-xl border border-mist/70 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
          <div className="flex min-w-0 items-start gap-2">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-signal">
              <Video className="size-3.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h4 className="text-[12px] font-semibold text-deep">
                {t('dashboard.cameraStatusTitle')}
              </h4>
              <p className="text-[11px] text-muted">
                {result.message || t('dashboard.cameraNotFound')}
              </p>
            </div>
          </div>
          <span className="rounded-md bg-fog px-2 py-1 text-[10px] font-semibold text-muted">
            {result.status || t('dashboard.unknown')}
          </span>
        </div>
      </section>
    )
  }

  const cameras = Array.isArray(payload.cameras) ? payload.cameras : []
  const camerasOk = payload.cameras_ok ?? 0
  const camerasTotal = payload.cameras_total ?? cameras.length
  const allOk = camerasTotal > 0 && camerasOk >= camerasTotal
  const overallTone = statusTone(payload.overall_status)
  const overallLabel =
    payload.overall_status_uz || payload.overall_status || t('dashboard.unknown')
  const adviceList = Array.isArray(payload.advice) ? payload.advice : []

  return (
    <section className="overflow-hidden rounded-xl border border-mist/70 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-mist/50 px-3 py-2.5">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-signal">
            <Video className="size-3.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h4 className="text-[12px] font-semibold text-deep">
              {t('dashboard.cameraStatusTitle')}
            </h4>
            <div className="mt-1 flex flex-wrap gap-1">
              {payload.has_photo ? (
                <span className="inline-flex items-center gap-1 rounded bg-teal-soft px-1.5 py-0.5 text-[10px] font-medium text-teal">
                  <ImageIcon className="size-3" aria-hidden />
                  {t('dashboard.hasPhoto')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-amber-soft px-1.5 py-0.5 text-[10px] font-medium text-amber">
                  <AlertTriangle className="size-3" aria-hidden />
                  {t('dashboard.noPhoto')}
                </span>
              )}
              <span className="rounded bg-signal-soft px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                {t('dashboard.camerasCount', {
                  ok: camerasOk,
                  total: camerasTotal,
                })}
              </span>
              {payload.grace_days_left != null ? (
                <span className="rounded bg-amber-soft px-1.5 py-0.5 text-[10px] font-medium text-amber">
                  {t('dashboard.graceDays', { days: payload.grace_days_left })}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <span
          className={cn(
            'rounded-md px-2 py-1 text-[10px] font-semibold',
            TONE_BADGE[overallTone],
          )}
        >
          {overallLabel}
        </span>
      </div>

      {allOk ? (
        <div className="flex items-center gap-2 bg-teal-soft/60 px-3 py-2 text-[12px] text-teal">
          <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
          {t('dashboard.allCamerasOk')}
        </div>
      ) : null}

      {adviceList.length > 0 ? (
        <ul className="space-y-1 border-t border-mist/40 px-3 py-2 text-[11px] text-muted">
          {adviceList.map((item) => (
            <li key={item} className="list-inside list-disc">
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {cameras.length > 0 ? (
        <ul className="divide-y divide-mist/40 border-t border-mist/50">
          {cameras.map((cam, index) => {
            const tone = statusTone(cam.status)
            const label = cam.status_uz || cam.status || '—'
            const tried = formatDateTime(cam.last_tried_at, i18n.language)
            return (
              <li
                key={cam.camera_id ?? `${cam.ip_address}-${index}`}
                className="px-3 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-deep">
                      {cam.ip_address || '—'}
                    </p>
                    {cam.description ? (
                      <p className="truncate text-[10px] text-muted">
                        {cam.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[10px] font-medium',
                        TONE_BADGE[tone],
                      )}
                    >
                      {label}
                    </span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[10px] font-medium',
                        cam.is_sent
                          ? 'bg-teal-soft text-teal'
                          : 'bg-fog text-muted',
                      )}
                    >
                      {cam.is_sent
                        ? t('dashboard.sent')
                        : t('dashboard.notSent')}
                    </span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[10px] font-medium',
                        cam.is_face_sent
                          ? 'bg-teal-soft text-teal'
                          : 'bg-fog text-muted',
                      )}
                    >
                      {cam.is_face_sent
                        ? t('dashboard.faceSent')
                        : t('dashboard.faceNotSent')}
                    </span>
                  </div>
                </div>
                {cam.error ? (
                  <p className="mt-1 text-[11px] text-rose">{cam.error}</p>
                ) : null}
                {cam.advice ? (
                  <p className="mt-1 text-[11px] text-muted">{cam.advice}</p>
                ) : null}
                {tried ? (
                  <p className="mt-1 text-[10px] text-muted">
                    {t('dashboard.lastTried')}: {tried}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
