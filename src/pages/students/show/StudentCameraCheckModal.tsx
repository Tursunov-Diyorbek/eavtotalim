import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, ImageIcon, RefreshCw, Send, ShieldCheck, Video } from 'lucide-react'
import { fetchStudentAutodromeCameraCheck, queryKeys } from '@/api'
import {
  Badge,
  Button,
  EmptyState,
  Modal,
  SearchInput,
  Select,
  Skeleton,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  type BadgeTone,
} from '@/components/ui'
import { useAgreementCamerasQuery } from '@/features/autodrome-agreement'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/lib/format'
import type { AutodromeCameraItem } from '@/types/autodrome-camera'
import {
  CAMERA_STATUS_VALUES,
  cameraVisual,
  TELEGRAM_BOT,
} from '@/pages/autodrome-agreement/AgreementCamerasPanel'

function ndtTone(raw: string | null | undefined): BadgeTone {
  const v = (raw || '').toLowerCase()
  if (v.includes('ok') || v.includes('success') || v.includes('sent')) return 'teal'
  if (v.includes('fail') || v.includes('error')) return 'rose'
  if (v.includes('pending') || v.includes('wait')) return 'amber'
  return 'neutral'
}

function cameraBlockReason(
  camera: AutodromeCameraItem | undefined,
  t: (key: string) => string,
) {
  if (!camera) return null
  const status = (camera.status || '').toLowerCase()
  const used = camera.used_slots ?? 0
  const max = camera.max_users_count
  const full = camera.free_slots === 0 || (max != null && used >= max)
  if (full) return camera.reason || t('students.showPage.capacityFull')
  if (status === 'offline') return camera.reason || t('students.showPage.cameraOffline')
  if (status === 'never_synced') return camera.reason || t('students.showPage.cameraUnsynced')
  return null
}

export function StudentCameraCheckModal({
  open,
  onClose,
  studentId,
  autodromeId,
  autodromeName,
}: {
  open: boolean
  onClose: () => void
  studentId: string
  autodromeId?: number
  autodromeName?: string | null
}) {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const check = useQuery({
    queryKey: [...queryKeys.students.autodromeCamera(studentId), 'camera-status'],
    queryFn: () => fetchStudentAutodromeCameraCheck(studentId),
    enabled: open && Boolean(studentId),
    retry: false,
  })

  const cameras = useAgreementCamerasQuery(
    autodromeId,
    {
      search: search.trim() || undefined,
      status: status || undefined,
    },
    open && Boolean(autodromeId),
  )

  const updatedAt =
    cameras.isSuccess && cameras.dataUpdatedAt
      ? formatDateTime(new Date(cameras.dataUpdatedAt).toISOString(), i18n.language)
      : null

  const result = check.data
  const payload = result?.status === 'found' ? result.data : null
  const faceCameras = payload?.cameras ?? []
  const advice = Array.isArray(payload?.advice) ? payload.advice : []
  const byIp = new Map(
    (cameras.data ?? [])
      .filter((item) => item.ip_address)
      .map((item) => [item.ip_address as string, item]),
  )
  const blocked = faceCameras
    .filter((item) => !item.is_sent)
    .map((item) => ({
      ip: item.ip_address || '—',
      reason: cameraBlockReason(
        item.ip_address ? byIp.get(item.ip_address) : undefined,
        t,
      ),
    }))
    .filter((item) => item.reason)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('students.showPage.cameraCheckTitle')}
      sizeClassName="max-w-4xl"
      maxHeightClassName="max-h-[min(92svh,820px)]"
      closeClassName="text-rose"
      footer={
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      }
    >
      {check.isLoading ? (
        <SkeletonLines lines={5} />
      ) : check.isError ? (
        <EmptyState
          className="border-0 py-6 shadow-none"
          description={
            check.error instanceof Error ? check.error.message : t('common.loadError')
          }
        />
      ) : result?.status === 'not_found' || !payload ? (
        <EmptyState
          className="border-0 py-6 shadow-none"
          description={result?.message || t('dashboard.cameraNotFound')}
        />
      ) : (
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={ndtTone(payload.overall_status)}>
              <ShieldCheck className="size-3" aria-hidden />
              {payload.overall_status_uz || payload.overall_status || t('dashboard.unknown')}
            </Badge>
            {payload.has_photo ? (
              <Badge tone="teal">
                <ImageIcon className="size-3" aria-hidden />
                {t('students.showPage.photoPresent')}
              </Badge>
            ) : (
              <Badge tone="amber">
                <AlertCircle className="size-3" aria-hidden />
                {t('students.showPage.photoMissing')}
              </Badge>
            )}
            <Badge tone="signal">
              {t('dashboard.camerasCount', {
                ok: payload.cameras_ok ?? 0,
                total: payload.cameras_total ?? faceCameras.length,
              })}
            </Badge>
            {payload.grace_days_left != null ? (
              <Badge tone="amber">
                {t('dashboard.graceDays', { days: payload.grace_days_left })}
              </Badge>
            ) : null}
          </div>

          {payload.full_name ? (
            <p className="mt-3 text-sm font-semibold text-deep">{payload.full_name}</p>
          ) : null}

          {advice.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-muted">
              {advice.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}

          {blocked.length > 0 ? (
            <div className="mt-3 rounded-lg border border-rose/30 bg-rose-soft/50 px-3 py-2 text-[13px] text-rose">
              <p className="font-semibold">
                <AlertCircle className="mr-1 inline size-3.5" aria-hidden />
                {t('students.showPage.queueBlocked')}
              </p>
              <ul className="mt-1 list-disc pl-5">
                {blocked.map((item) => (
                  <li key={item.ip}>
                    <b>{item.ip}</b> — {item.reason}
                  </li>
                ))}
              </ul>
              <p className="mt-1">{t('students.showPage.autoSendAfterFix')}</p>
            </div>
          ) : null}

          {faceCameras.length > 0 ? (
            <div className="mt-3">
              <p className="text-sm font-semibold text-deep">
                {t('students.showPage.camerasByState')}
              </p>
              <div className="mt-2 overflow-hidden rounded-lg border border-mist/80">
                {faceCameras.map((camera, index) => {
                  const reason = !camera.is_sent
                    ? cameraBlockReason(
                        camera.ip_address ? byIp.get(camera.ip_address) : undefined,
                        t,
                      )
                    : null
                  const tried = formatDateTime(camera.last_tried_at, i18n.language)
                  return (
                    <div
                      key={camera.camera_id ?? `${camera.ip_address}-${index}`}
                      className="grid border-t border-mist/70 first:border-t-0 sm:grid-cols-[180px_1fr]"
                    >
                      <div className="bg-fog/70 px-3 py-2 sm:border-r sm:border-mist/70">
                        <p className="text-sm font-semibold text-deep">
                          {camera.ip_address || '—'}
                        </p>
                        {camera.description ? (
                          <p className="text-[12px] text-muted">{camera.description}</p>
                        ) : null}
                      </div>
                      <div className="space-y-1 px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          <Badge tone={ndtTone(camera.status)}>
                            {camera.status_uz || camera.status || '—'}
                          </Badge>
                          <Badge tone={camera.is_sent ? 'teal' : 'neutral'}>
                            {camera.is_sent ? t('dashboard.sent') : t('dashboard.notSent')}
                          </Badge>
                          <Badge tone={camera.is_face_sent ? 'teal' : 'neutral'}>
                            {camera.is_face_sent
                              ? t('dashboard.faceSent')
                              : t('dashboard.faceNotSent')}
                          </Badge>
                        </div>
                        {reason ? (
                          <p className="text-[12px] font-medium text-rose">
                            {t('students.showPage.cameraNotSending')}: {reason}
                          </p>
                        ) : null}
                        {camera.error ? (
                          <p className="text-[12px] text-rose">{camera.error}</p>
                        ) : null}
                        {camera.advice && !reason ? (
                          <p className="text-[12px] text-muted">{camera.advice}</p>
                        ) : null}
                        {tried ? (
                          <p className="text-[12px] text-muted">
                            {t('dashboard.lastTried')}: {tried}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {autodromeId ? (
        <div className="mt-4 border-t border-mist/70 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-deep">
              <Video className="size-4 shrink-0 text-signal" aria-hidden />
              <span className="truncate">
                {t('autodromeAgreementPage.camerasTitle')}
                {autodromeName ? ` — ${autodromeName}` : ''}
              </span>
            </p>
            {updatedAt ? (
              <p className="text-[12px] text-muted">
                {t('common.updated')}: {updatedAt}
              </p>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('autodromeAgreementPage.cameraSearch')}
              className="w-48"
            />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={CAMERA_STATUS_VALUES.map((value) => ({
                value,
                label:
                  value === ''
                    ? t('autodromeAgreementPage.allStatuses')
                    : t(`autodromeAgreementPage.camStatus_${value}`),
              }))}
              triggerClassName="min-w-40"
            />
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={t('common.refresh')}
              loading={cameras.isFetching}
              onClick={() => void cameras.refetch()}
            >
              <RefreshCw className="size-3.5" />
            </Button>
          </div>

          <a
            href={TELEGRAM_BOT}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 rounded-lg border border-signal/20 bg-signal-soft/40 px-3 py-2 no-underline"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-signal text-white">
              <Send className="size-3.5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 text-[12px] leading-snug">
              <b className="text-deep">@intalim_bot</b>
              <span className="text-muted"> {t('autodromeAgreementPage.botHint')}</span>
            </span>
            <span className="shrink-0 text-[11px] font-semibold text-signal">
              {t('autodromeAgreementPage.openBot')}
            </span>
          </a>

          <div className="mt-3">
            {cameras.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" rounded="lg" />
                <SkeletonLines lines={4} />
              </div>
            ) : cameras.isError ? (
              <EmptyState
                className="border-0 py-6 shadow-none"
                description={
                  cameras.error instanceof Error
                    ? cameras.error.message
                    : t('common.loadError')
                }
              />
            ) : (cameras.data ?? []).length === 0 ? (
              <EmptyState
                className="border-0 py-6 shadow-none"
                description={t('autodromeAgreementPage.noCameras')}
              />
            ) : (
              <Table
                bordered={false}
                columnToggle={false}
                storageKey={`student-camera-check-${autodromeId}`}
                className="min-w-160"
              >
                <THead>
                  <TR>
                    <TH>{t('autodromeAgreementPage.camera')}</TH>
                    <TH className="text-center">{t('autodromeAgreementPage.camStatus')}</TH>
                    <TH className="w-44 text-center">{t('autodromeAgreementPage.capacity')}</TH>
                    <TH className="text-center">{t('autodromeAgreementPage.technical')}</TH>
                  </TR>
                </THead>
                <TBody>
                  {(cameras.data ?? []).map((camera, index) => {
                    const visual = cameraVisual(camera, t)
                    return (
                      <TR key={camera.id ?? camera.camera_id ?? index}>
                        <TD>
                          <p className="font-semibold text-deep">{camera.ip_address || '—'}</p>
                          {camera.model_name ? (
                            <p className="text-[11px] text-muted">{camera.model_name}</p>
                          ) : null}
                          {camera.description ? (
                            <p className="text-[11px] text-muted">{camera.description}</p>
                          ) : null}
                        </TD>
                        <TD className="text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <Badge tone={visual.tone}>{visual.label}</Badge>
                            {camera.reason ? (
                              <span className="text-[11px] text-muted">{camera.reason}</span>
                            ) : null}
                            {visual.offlineText &&
                            (camera.status || '').toLowerCase() !== 'online' ? (
                              <span className="text-[11px] text-rose">{visual.offlineText}</span>
                            ) : null}
                            <span className="text-[11px] text-muted">
                              {t('autodromeAgreementPage.lastOnline')}:{' '}
                              {formatDateTime(camera.last_online_at, i18n.language) || '—'}
                            </span>
                          </div>
                        </TD>
                        <TD>
                          <div className="space-y-1">
                            <p className="text-center text-sm">
                              {visual.used}
                              {visual.max != null ? ` / ${visual.max}` : ''}
                            </p>
                            <div className="h-1.5 overflow-hidden rounded-full bg-mist">
                              <div
                                className={cn(
                                  'h-full',
                                  visual.full ? 'bg-rose' : 'bg-signal',
                                )}
                                style={{
                                  width: `${Math.min(100, Math.max(0, visual.percent))}%`,
                                }}
                              />
                            </div>
                            {camera.free_slots != null ? (
                              <p className="text-center text-[11px] text-muted">
                                {t('autodromeAgreementPage.freeSlots')}: {camera.free_slots}
                              </p>
                            ) : null}
                          </div>
                        </TD>
                        <TD className="text-center">
                          <div className="flex flex-col items-center gap-0.5 text-[11px] text-muted">
                            {camera.fail_streak ? (
                              <Badge tone="amber">
                                {t('autodromeAgreementPage.failStreak', {
                                  count: camera.fail_streak,
                                })}
                              </Badge>
                            ) : null}
                            {camera.latency_ms != null ? (
                              <span>
                                {t('autodromeAgreementPage.latency')}: {camera.latency_ms} ms
                              </span>
                            ) : null}
                            <span>
                              {t('autodromeAgreementPage.synced')}:{' '}
                              {formatDateTime(camera.last_synced_at, i18n.language) || '—'}
                            </span>
                          </div>
                        </TD>
                      </TR>
                    )
                  })}
                </TBody>
              </Table>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
