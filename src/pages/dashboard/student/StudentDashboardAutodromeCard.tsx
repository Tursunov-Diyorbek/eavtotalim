import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, Gauge } from 'lucide-react'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  Modal,
  Panel,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { routes } from '@/config'
import { useAutodromeAttendanceQuery } from '@/features/my-attendance'
import { cn, formatDate, formatDateTime } from '@/lib'
import type { AutodromeAttendanceItem } from '@/types'

function visitStats(item: AutodromeAttendanceItem) {
  const visits = item.seans ?? (item.status ? 1 : 0)
  const hours = item.hours ?? (item.status ? 2 : 0)
  return { visits, hours }
}

function ProgressRing({ percent }: { percent: number }) {
  const gradId = `adp-${useId().replace(/:/g, '')}`
  const size = 48
  const stroke = 5
  const center = size / 2
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.min(100, Math.max(0, percent))
  const filled = (clamped / 100) * c

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="size-12 shrink-0"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-signal)" />
          <stop offset="100%" stopColor="var(--color-teal)" />
        </linearGradient>
      </defs>
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        className="stroke-fog"
        strokeWidth={stroke}
      />
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${c}`}
        transform={`rotate(-90 ${center} ${center})`}
      />
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-deep"
        style={{ fontSize: 11, fontWeight: 700 }}
      >
        {clamped}%
      </text>
    </svg>
  )
}

const metricBoxClass =
  'flex h-14 min-w-0 flex-col items-center justify-center rounded-lg border border-mist/60 bg-fog/30 px-1 text-center'

export function StudentDashboardAutodromeCard() {
  const { t, i18n } = useTranslation()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const { data, isLoading, isError } = useAutodromeAttendanceQuery()

  const progress = data?.progress ?? {}
  const items = data?.items ?? []
  const completed = Number(progress.completed_hours ?? 0)
  const required = Number(progress.required_hours ?? 0)
  const percentage = Math.min(100, Math.round(Number(progress.percentage ?? 0)))
  const remaining = Math.max(required - completed, 0)

  return (
    <>
      <Panel padding="sm" className="flex h-full flex-col gap-2">
        <div className="flex h-6 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-signal/10 text-signal">
              <Gauge className="size-3.5" aria-hidden />
            </span>
            <p className="truncate text-[12px] font-semibold text-deep">
              {t('dashboard.student.autodromeTitle')}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-signal hover:bg-fog"
            onClick={() => setDetailsOpen(true)}
            disabled={isLoading || isError}
          >
            <Eye className="size-3" aria-hidden />
            {t('dashboard.student.details')}
          </button>
        </div>

        {isLoading ? <SkeletonLines lines={3} /> : null}
        {isError ? <ErrorMessage /> : null}

        {!isLoading && !isError ? (
          <>
            <div className="flex items-center gap-2.5">
              <ProgressRing percent={percentage} />
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <p className="text-right text-[10px] font-semibold leading-none text-deep">
                  {completed}/{required} {t('myAttendance.hours')}
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-fog">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-signal to-teal transition-[width]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  {
                    key: 'done',
                    label: t('myAttendance.completed'),
                    value: completed,
                    dot: 'bg-teal',
                    tone: 'text-teal',
                  },
                  {
                    key: 'left',
                    label: t('myAttendance.remaining'),
                    value: remaining,
                    dot: 'bg-amber',
                    tone: 'text-amber',
                  },
                  {
                    key: 'need',
                    label: t('myAttendance.required'),
                    value: required,
                    dot: 'bg-signal',
                    tone: 'text-signal',
                  },
                ] as const
              ).map((item) => (
                <div key={item.key} className={metricBoxClass}>
                  <p className={cn('text-sm font-semibold leading-none', item.tone)}>
                    {item.value}
                    <span className="ml-0.5 text-[9px] font-normal text-muted">
                      {t('myAttendance.hours')}
                    </span>
                  </p>
                  <p className="mt-1 flex min-h-4 items-center justify-center gap-1 text-[9px] leading-tight text-muted">
                    <span className={cn('size-1.5 shrink-0 rounded-full', item.dot)} />
                    <span className="line-clamp-2">{item.label}</span>
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </Panel>

      <Modal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={t('dashboard.student.autodromeTitle')}
        sizeClassName="max-w-4xl"
        headerExtra={
          <Link
            to={`${routes.myAttendance}?tab=autodrome`}
            className="text-[12px] font-medium text-signal hover:underline"
          >
            {t('myAttendance.tabAutodrome')}
          </Link>
        }
      >
        {items.length === 0 ? (
          <EmptyState description={t('myAttendance.emptyAutodrome')} />
        ) : (
          <Table
            storageKey="student-dashboard-autodrome"
            columnToggle={false}
          >
            <THead>
              <TR>
                <TH className="w-10 text-center">№</TH>
                <TH className="w-28">{t('myAttendance.date')}</TH>
                <TH>{t('myAttendance.autodrome')}</TH>
                <TH className="w-40">{t('myAttendance.entryTime')}</TH>
                <TH className="w-40">{t('myAttendance.exitTime')}</TH>
                <TH className="w-36">{t('myAttendance.visits')}</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((item, index) => {
                const { visits, hours } = visitStats(item)
                return (
                  <TR key={item.id ?? index}>
                    <TD className="text-center">{index + 1}</TD>
                    <TD>
                      <Badge tone="indigo">
                        {formatDate(item.date, i18n.language) || '—'}
                      </Badge>
                    </TD>
                    <TD>{item.autodrome?.name || '—'}</TD>
                    <TD>
                      {item.first_entry ? (
                        <Badge tone="signal">
                          {formatDateTime(item.first_entry, i18n.language)}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TD>
                    <TD>
                      {item.last_exit ? (
                        <Badge tone="rose">
                          {formatDateTime(item.last_exit, i18n.language)}
                        </Badge>
                      ) : (
                        <Badge tone="amber">—</Badge>
                      )}
                    </TD>
                    <TD>
                      <Badge tone="violet">
                        {t('myAttendance.visitsCount', { count: visits, hours })}
                      </Badge>
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        )}
      </Modal>
    </>
  )
}
