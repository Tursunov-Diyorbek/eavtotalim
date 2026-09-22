import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  CalendarDays,
  Car,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Users,
  Video,
  WifiOff,
  XCircle,
} from 'lucide-react'
import { Panel, Popover, PopoverRow, Skeleton } from '@/components/ui'
import { useDirectorCamerasQuery } from '@/features/dashboard'
import { cn, formatDate, formatDateTime } from '@/lib'
import type { AutodromeCameraItem, AutodromeFreeSpace } from '@/types'

const CATEGORIES = [
  { key: 'a' as const, short: 'A', titleKey: 'dashboard.catA' },
  { key: 'b' as const, short: 'B', titleKey: 'dashboard.catB' },
  { key: 'e' as const, short: 'E', titleKey: 'dashboard.catE' },
]

function toSpace(value: unknown): boolean | undefined {
  if (value === true || value === 1 || value === '1') return true
  if (value === false || value === 0 || value === '0') return false
  return undefined
}

function daysUntil(value?: string | null): number | null {
  if (!value) return null
  const end = new Date(value)
  if (Number.isNaN(end.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.round((end.getTime() - today.getTime()) / 86400000)
}

function endDateMeta(
  endDate: string | null | undefined,
  t: (k: string, opts?: Record<string, unknown>) => string,
) {
  const days = daysUntil(endDate)
  if (days == null) {
    return { tone: 'mute' as const, text: t('dashboard.endDateMissing') }
  }
  if (days < 0) {
    return { tone: 'bad' as const, text: t('dashboard.endDateExpired') }
  }
  if (days === 0) {
    return { tone: 'warn' as const, text: t('dashboard.endDateToday') }
  }
  if (days <= 30) {
    return { tone: 'warn' as const, text: t('dashboard.endDateLeft', { days }) }
  }
  return { tone: 'ok' as const, text: t('dashboard.endDateUntil', { days }) }
}

function humanizeSeconds(
  sec: number | null | undefined,
  t: (k: string, opts?: Record<string, unknown>) => string,
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

function cameraMeta(
  c: AutodromeCameraItem,
  t: (k: string, opts?: Record<string, unknown>) => string,
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
  let tone: 'ok' | 'warn' | 'bad' = 'warn'
  if (status === 'online') tone = 'ok'
  if (status === 'offline' || status === 'never_synced') tone = 'bad'
  return {
    label: labels[status] || status || t('dashboard.unknown'),
    tone,
    offlineText: humanizeSeconds(c.offline_seconds, t),
  }
}

/** Toifa chipi — A / B / E «Joy bor». */
function SpaceChip({
  short,
  hasSpace,
  title,
}: {
  short: string
  hasSpace: boolean | undefined
  title: string
}) {
  const { t } = useTranslation()
  const known = typeof hasSpace === 'boolean'
  const open = hasSpace === true
  const tone = !known ? 'mute' : open ? 'ok' : 'bad'
  const status = !known
    ? t('dashboard.spaceUnknown')
    : open
      ? t('dashboard.spaceOpen')
      : t('dashboard.spaceClosed')
  const Icon = !known ? HelpCircle : open ? CheckCircle2 : XCircle

  return (
    <Popover
      className="flex-1"
      align="center"
      side="top"
      widthClassName="w-44"
      title={title}
      content={
        <PopoverRow label={t('dashboard.infoStatus')}>
          <span
            className={cn(
              'font-semibold',
              tone === 'ok' && 'text-teal',
              tone === 'bad' && 'text-rose',
              tone === 'mute' && 'text-muted',
            )}
          >
            {status}
          </span>
        </PopoverRow>
      }
    >
      <div
        className={cn(
          'flex w-full items-center justify-center gap-1.5 rounded-lg border px-1.5 py-1 shadow-[0_1px_2px_rgba(15,36,48,0.03)] transition hover:shadow-[0_2px_6px_rgba(15,36,48,0.06)]',
          tone === 'ok' && 'border-teal/30 bg-teal-soft/25',
          tone === 'bad' && 'border-rose/30 bg-rose-soft/30',
          tone === 'mute' && 'border-mist/70 bg-fog/60',
        )}
      >
        <span
          className={cn(
            'flex size-4.5 shrink-0 items-center justify-center rounded-[5px] text-[11px] font-extrabold',
            tone === 'ok' && 'bg-teal text-white',
            tone === 'bad' && 'bg-rose text-white',
            tone === 'mute' && 'bg-mist text-muted',
          )}
        >
          {short}
        </span>
        <span
          className={cn(
            'inline-flex min-w-0 items-center gap-1 text-[10px] font-bold whitespace-nowrap',
            tone === 'ok' && 'text-teal',
            tone === 'bad' && 'text-rose',
            tone === 'mute' && 'text-muted',
          )}
        >
          <Icon className="size-3 shrink-0" aria-hidden />
          {status}
        </span>
      </div>
    </Popover>
  )
}

/** Kamera kartasi — hoverda IP / model / oxirgi online tooltip. */
function CameraCard({ cam }: { cam: AutodromeCameraItem }) {
  const { t, i18n } = useTranslation()
  const a = cameraMeta(cam, t)
  const lastOnline = formatDateTime(cam.last_online_at, i18n.language)

  return (
    <Popover
      side="top"
      widthClassName="w-56"
      title={
        <span className="inline-flex items-center gap-1.5">
          <Video className="size-3.5 text-signal" aria-hidden />
          {cam.ip_address || t('dashboard.cameraStatus')}
        </span>
      }
      content={
        <>
          {cam.model_name ? (
            <PopoverRow label={t('dashboard.infoName')}>
              <span className="font-semibold">{cam.model_name}</span>
            </PopoverRow>
          ) : null}
          <PopoverRow label={t('dashboard.infoStatus')}>
            <span
              className={cn(
                'font-semibold',
                a.tone === 'ok' && 'text-teal',
                a.tone === 'warn' && 'text-amber',
                a.tone === 'bad' && 'text-rose',
              )}
            >
              {a.label}
            </span>
          </PopoverRow>
          <PopoverRow label={t('dashboard.camLastOnline')}>
            <span className="font-semibold">{lastOnline || '—'}</span>
          </PopoverRow>
          {cam.reason ? (
            <PopoverRow label={t('dashboard.camReason')}>
              <span className="font-semibold text-amber">{cam.reason}</span>
            </PopoverRow>
          ) : null}
        </>
      }
    >
      <div
        className={cn(
          'flex min-w-40 flex-col gap-1 rounded-md border bg-white px-2 py-1.5 transition',
          a.tone === 'ok' && 'border-teal/25',
          a.tone === 'warn' && 'border-amber/30 bg-amber-soft/20',
          a.tone === 'bad' && 'border-rose/30 bg-rose-soft/20',
        )}
      >
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-[12px] font-semibold',
            a.tone === 'ok' && 'text-teal',
            a.tone === 'warn' && 'text-amber',
            a.tone === 'bad' && 'text-rose',
          )}
        >
          <span
            className={cn(
              'size-1.75 shrink-0 rounded-full',
              a.tone === 'ok' && 'bg-teal',
              a.tone === 'warn' && 'bg-amber',
              a.tone === 'bad' && 'bg-rose',
            )}
          />
          {t('dashboard.cameraStatus')}: {a.label}
        </span>

        {a.tone === 'bad' ? (
          <span className="flex flex-col gap-px rounded bg-rose-soft/70 px-1.5 py-1 text-[10px] font-semibold text-rose">
            <span className="inline-flex items-center gap-1">
              <WifiOff className="size-3" aria-hidden />
              {t('dashboard.camNeedNet')}
            </span>
            {a.offlineText ? <span>{a.offlineText}</span> : null}
          </span>
        ) : null}
      </div>
    </Popover>
  )
}

type Props = {
  enabled: boolean
}

/** Avtodrom holati — chapda kameralar, o‘ngda qabul holati + muddat + A/B/E. */
export function DirectorAutodromeStatusCard({ enabled }: Props) {
  const { t, i18n } = useTranslation()
  const {
    data: rows = [],
    isLoading,
    isFetching,
    refetch,
  } = useDirectorCamerasQuery(enabled)

  if (!enabled) return null
  if (!isLoading && rows.length === 0) return null

  return (
    <Panel padding="none">
      <div className="flex items-center justify-between gap-2 border-b border-mist/50 px-3 py-2 sm:px-4">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase">
          <Car className="size-3.5 text-signal" aria-hidden />
          {t('dashboard.autodromeStatus')}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-mist/70 bg-white text-muted transition hover:text-signal disabled:opacity-50"
          aria-label={t('common.refresh')}
        >
          <RefreshCw
            className={cn('size-3.5', isFetching && 'animate-spin')}
            aria-hidden
          />
        </button>
      </div>

      <div className="space-y-2 p-3 sm:px-4">
        {isLoading ? (
          <Skeleton className="h-20 w-full rounded-lg" />
        ) : (
          rows.map((row) => {
            const dateMeta = endDateMeta(row.endDate, t)
            const cameras = row.cameras ?? []
            const problems = cameras.filter(
              (c) => cameraMeta(c, t).tone === 'bad',
            ).length

            return (
              <div
                key={row.id}
                className="flex flex-col rounded-lg border border-mist/60 bg-fog/25 lg:flex-row lg:items-center"
              >
                <div className="min-w-0 flex-1 space-y-1.5 p-3 lg:py-2">
                  <p className="flex items-center gap-1.5 text-[13px] font-bold text-deep uppercase">
                    {problems > 0 ? (
                      <AlertTriangle
                        className="size-3.5 shrink-0 text-rose"
                        aria-hidden
                      />
                    ) : null}
                    <span className="truncate">{row.name || '—'}</span>
                  </p>

                  <div className="flex flex-wrap items-stretch gap-1.5">
                    {cameras.length === 0 ? (
                      <span className="text-[12px] text-muted">
                        {t('dashboard.noCameras')}
                      </span>
                    ) : (
                      cameras.map((cam, i) => (
                        <CameraCard
                          key={cam.id ?? `${cam.ip_address}-${i}`}
                          cam={cam}
                        />
                      ))
                    )}
                  </div>
                </div>

                <aside className="shrink-0 border-t border-dashed border-mist/80 bg-linear-to-b from-white to-fog/40 p-3 lg:w-95 lg:rounded-r-lg lg:border-t-0 lg:border-l lg:py-2">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-indigo-soft text-indigo ring-1 ring-indigo/15">
                      <Users className="size-2.75" aria-hidden />
                    </span>
                    <span className="text-[11px] font-bold whitespace-nowrap text-deep">
                      {t('dashboard.admissionStatus')}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border bg-white py-0.5 pr-1.5 pl-0.5 text-[10px] whitespace-nowrap shadow-[0_1px_2px_rgba(15,36,48,0.04)]',
                        dateMeta.tone === 'ok' && 'border-mist/70',
                        dateMeta.tone === 'warn' && 'border-amber/30',
                        dateMeta.tone === 'bad' && 'border-rose/30',
                        dateMeta.tone === 'mute' && 'border-mist/70',
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex size-4 shrink-0 items-center justify-center rounded-full',
                          dateMeta.tone === 'ok' && 'bg-teal-soft text-teal',
                          dateMeta.tone === 'warn' &&
                            'bg-amber-soft text-amber',
                          dateMeta.tone === 'bad' && 'bg-rose-soft text-rose',
                          dateMeta.tone === 'mute' && 'bg-fog text-muted',
                        )}
                      >
                        <CalendarDays className="size-2.5" aria-hidden />
                      </span>
                      <span className="font-semibold text-ink">
                        {formatDate(row.endDate, i18n.language) || '—'}
                      </span>
                      <b
                        className={cn(
                          dateMeta.tone === 'ok' && 'text-teal',
                          dateMeta.tone === 'warn' && 'text-amber',
                          dateMeta.tone === 'bad' && 'text-rose',
                          dateMeta.tone === 'mute' && 'font-medium text-muted',
                        )}
                      >
                        {dateMeta.text}
                      </b>
                    </span>
                  </div>

                  <div className="flex w-full gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <SpaceChip
                        key={cat.key}
                        short={cat.short}
                        title={t(cat.titleKey)}
                        hasSpace={toSpace(
                          (row.freeSpace as AutodromeFreeSpace | undefined)?.[
                            cat.key
                          ],
                        )}
                      />
                    ))}
                  </div>
                </aside>
              </div>
            )
          })
        )}
      </div>
    </Panel>
  )
}
