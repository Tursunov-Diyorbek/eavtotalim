import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronDown,
  RefreshCw,
  Send,
  Video,
} from 'lucide-react'
import {
  Badge,
  Button,
  EmptyState,
  Panel,
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
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/lib/format'
import { useAgreementCamerasQuery } from '@/features/autodrome-agreement'
import type { AutodromeCameraItem } from '@/types/autodrome-camera'

const TELEGRAM_BOT = 'https://t.me/intalim_bot'

const STATUS_VALUES = [
  '',
  'online',
  'degraded',
  'offline',
  'syncing',
  'idle',
  'never_synced',
] as const

type CameraAutodrome = {
  id: number
  name?: string | null
  inn?: string | null
}

function humanizeSeconds(
  sec: number | null | undefined,
  t: (key: string, opts?: Record<string, unknown>) => string,
) {
  if (sec == null) return null
  const s = Number(sec)
  if (!Number.isFinite(s) || s < 0) return null
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return t('dashboard.offlineForDays', { days: d, hours: h })
  if (h > 0) return t('dashboard.offlineForHours', { hours: h, minutes: m })
  if (m > 0) return t('dashboard.offlineForMinutes', { minutes: m })
  return t('dashboard.offlineForSeconds', { seconds: s })
}

function cameraVisual(
  c: AutodromeCameraItem,
  t: (key: string, opts?: Record<string, unknown>) => string,
) {
  const status = (c.status || '').toLowerCase()
  const labels: Record<string, string> = {
    online: 'Online',
    offline: 'Offline',
    degraded: t('dashboard.camDegraded'),
    syncing: t('dashboard.camSyncing'),
    idle: t('dashboard.camIdle'),
    never_synced: t('dashboard.camNever'),
  }
  const used = c.used_slots ?? 0
  const max = c.max_users_count
  const full = c.free_slots === 0 || (max != null && used >= max)
  const percent =
    c.usage_percent != null
      ? Math.round(c.usage_percent)
      : max
        ? Math.round((used / max) * 100)
        : 0
  let tone: 'teal' | 'amber' | 'rose' | 'neutral' = 'neutral'
  if (status === 'online') tone = 'teal'
  else if (status === 'offline' || status === 'never_synced') tone = 'rose'
  else if (status === 'degraded' || status === 'syncing') tone = 'amber'
  return {
    label: labels[status] || status || t('dashboard.unknown'),
    used,
    max,
    full,
    percent,
    tone,
    offlineText: humanizeSeconds(c.offline_seconds, t),
  }
}

function CameraCard({ autodrome }: { autodrome: CameraAutodrome }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const query = useAgreementCamerasQuery(
    autodrome.id,
    {
      search: search.trim() || undefined,
      status: status || undefined,
    },
    open,
  )
  const cameras = query.data ?? []
  const title = autodrome.inn
    ? `${autodrome.name ?? ''} (INN: ${autodrome.inn})`
    : autodrome.name ?? ''

  return (
    <Panel padding="none" className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-mist/70 px-3 py-2.5">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={() => setOpen((prev) => !prev)}
        >
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-muted transition',
              !open && '-rotate-90',
            )}
            aria-hidden
          />
          <Video className="size-4 shrink-0 text-signal" aria-hidden />
          <span className="font-display min-w-0 truncate text-sm font-semibold text-deep">
            {t('autodromeAgreementPage.camerasTitle')} — {title}
          </span>
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('autodromeAgreementPage.cameraSearch')}
            className="w-48"
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_VALUES.map((value) => ({
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
            loading={query.isFetching}
            onClick={() => void query.refetch()}
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      </div>

      {open ? (
        <div className="p-3">
          <a
            href={TELEGRAM_BOT}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 flex items-center gap-2 rounded-lg border border-signal/20 bg-signal-soft/40 px-3 py-2 no-underline"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-signal text-white">
              <Send className="size-3.5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 text-[12px] leading-snug">
              <b className="text-deep">@intalim_bot</b>
              <span className="text-muted">
                {' '}
                {t('autodromeAgreementPage.botHint')}
              </span>
            </span>
            <span className="shrink-0 text-[11px] font-semibold text-signal">
              {t('autodromeAgreementPage.openBot')}
            </span>
          </a>

          {query.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" rounded="lg" />
              <SkeletonLines lines={4} />
            </div>
          ) : cameras.length === 0 ? (
            <EmptyState
              className="border-0 py-6 shadow-none"
              description={t('autodromeAgreementPage.noCameras')}
            />
          ) : (
            <Table
              bordered={false}
              storageKey={`autodrome-agreement-cameras-${autodrome.id}`}
              className="min-w-180"
            >
              <THead>
                <TR>
                  <TH>{t('autodromeAgreementPage.camera')}</TH>
                  <TH className="text-center">
                    {t('autodromeAgreementPage.camStatus')}
                  </TH>
                  <TH className="w-44 text-center">
                    {t('autodromeAgreementPage.capacity')}
                  </TH>
                  <TH className="text-center">
                    {t('autodromeAgreementPage.technical')}
                  </TH>
                </TR>
              </THead>
              <TBody>
                {cameras.map((camera, index) => {
                  const visual = cameraVisual(camera, t)
                  return (
                    <TR key={camera.id ?? camera.camera_id ?? index}>
                      <TD>
                        <p className="font-semibold text-deep">
                          {camera.ip_address || '—'}
                        </p>
                        {camera.model_name ? (
                          <p className="text-[11px] text-muted">
                            {camera.model_name}
                          </p>
                        ) : null}
                        {camera.description ? (
                          <p className="text-[11px] text-muted">
                            {camera.description}
                          </p>
                        ) : null}
                      </TD>
                      <TD className="text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <Badge tone={visual.tone}>{visual.label}</Badge>
                          {camera.reason ? (
                            <span className="text-[11px] text-muted">
                              {camera.reason}
                            </span>
                          ) : null}
                          {visual.offlineText &&
                          (camera.status || '').toLowerCase() !== 'online' ? (
                            <span className="text-[11px] text-rose">
                              {visual.offlineText}
                            </span>
                          ) : null}
                          <span className="text-[11px] text-muted">
                            {t('autodromeAgreementPage.lastOnline')}:{' '}
                            {formatDateTime(
                              camera.last_online_at,
                              i18n.language,
                            ) || '—'}
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
                              {t('autodromeAgreementPage.freeSlots')}:{' '}
                              {camera.free_slots}
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
                              {t('autodromeAgreementPage.latency')}:{' '}
                              {camera.latency_ms} ms
                            </span>
                          ) : null}
                          <span>
                            {t('autodromeAgreementPage.synced')}:{' '}
                            {formatDateTime(
                              camera.last_synced_at,
                              i18n.language,
                            ) || '—'}
                          </span>
                          {camera.is_auto_send === false ? (
                            <Badge tone="neutral">
                              {t('autodromeAgreementPage.autoSendOff')}
                            </Badge>
                          ) : null}
                        </div>
                      </TD>
                    </TR>
                  )
                })}
              </TBody>
            </Table>
          )}
        </div>
      ) : null}
    </Panel>
  )
}

export function AgreementCamerasPanel({
  autodromes,
}: {
  autodromes: CameraAutodrome[]
}) {
  const { t } = useTranslation()
  if (!autodromes.length) return null

  return (
    <Panel padding="sm" className="space-y-3">
      <div className="flex items-center gap-2">
        <Video className="size-4 text-signal" aria-hidden />
        <p className="font-display text-sm font-semibold text-deep">
          {t('autodromeAgreementPage.camerasSection')}
        </p>
      </div>
      {autodromes.map((item) => (
        <CameraCard key={item.id} autodrome={item} />
      ))}
    </Panel>
  )
}
