import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, Send, Video } from 'lucide-react'
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
} from '@/components/ui'
import { useAgreementCamerasQuery } from '@/features/autodrome-agreement'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/lib/format'
import {
  CAMERA_STATUS_VALUES,
  cameraVisual,
  TELEGRAM_BOT,
} from '@/pages/autodrome-agreement/AgreementCamerasPanel'

export function StudentCameraCheckModal({
  open,
  onClose,
  autodromeId,
  autodromeName,
}: {
  open: boolean
  onClose: () => void
  autodromeId?: number
  autodromeName?: string | null
}) {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('students.showPage.cameraCheckTitle')}
      sizeClassName="max-w-4xl"
      maxHeightClassName="max-h-[min(92svh,820px)]"
    >
      {autodromeId ? (
        <div>
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
                              {visual.full ? (
                                <Badge tone="rose" className="ml-1">
                                  {t('dashboard.camFull')}
                                </Badge>
                              ) : null}
                            </p>
                            <div className="h-1.5 overflow-hidden rounded-full bg-mist">
                              <div
                                className={cn(
                                  'h-full',
                                  visual.full ? 'bg-rose' : 'bg-teal',
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
