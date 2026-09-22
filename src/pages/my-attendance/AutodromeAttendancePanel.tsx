import { useTranslation } from 'react-i18next'
import { Car } from 'lucide-react'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  Panel,
  Skeleton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { formatDate, formatDateTime } from '@/lib/format'
import { useAutodromeAttendanceQuery } from '@/features/my-attendance'
import { cn } from '@/lib/cn'

export function AutodromeAttendancePanel({ active }: { active: boolean }) {
  const { t, i18n } = useTranslation()
  const { data, isLoading, isError } = useAutodromeAttendanceQuery(active)

  if (!active) return null

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        <Skeleton className="h-24 w-full" rounded="xl" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" rounded="lg" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorMessage />

  const progress = data?.progress ?? {}
  const items = data?.items ?? []
  const completed = Number(progress.completed_hours ?? 0)
  const required = Number(progress.required_hours ?? 0)
  const percentage = Math.min(100, Math.round(Number(progress.percentage ?? 0)))
  const remaining = Math.max(required - completed, 0)
  const isDone = percentage >= 100

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      <Panel className="space-y-3 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-deep">
            <Car className="size-4 text-signal" aria-hidden />
            {t('myAttendance.autodromeProgress')}
          </p>
          <p
            className={cn(
              'text-[13px] font-bold',
              isDone ? 'text-teal' : 'text-signal',
            )}
          >
            {completed}/{required} {t('myAttendance.hours')} · {percentage}%
          </p>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-fog">
          <div
            className="h-full rounded-full bg-linear-to-r from-signal to-teal transition-[width]"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
          <span className="inline-flex items-center gap-1.5 text-muted">
            <span className="size-2 rounded-full bg-teal" />
            {t('myAttendance.completed')}:{' '}
            <strong className="text-deep">
              {completed} {t('myAttendance.hours')}
            </strong>
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted">
            <span className="size-2 rounded-full bg-amber" />
            {t('myAttendance.remaining')}:{' '}
            <strong className="text-deep">
              {remaining} {t('myAttendance.hours')}
            </strong>
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted">
            <span className="size-2 rounded-full bg-signal" />
            {t('myAttendance.required')}:{' '}
            <strong className="text-deep">
              {required} {t('myAttendance.hours')}
            </strong>
          </span>
        </div>
      </Panel>

      {items.length === 0 ? (
        <EmptyState description={t('myAttendance.emptyAutodrome')} />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH className="w-28">{t('myAttendance.date')}</TH>
              <TH>{t('myAttendance.autodrome')}</TH>
              <TH className="w-40">{t('myAttendance.entryTime')}</TH>
              <TH className="w-40">{t('myAttendance.exitTime')}</TH>
              <TH className="w-36">{t('myAttendance.visits')}</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((item, index) => {
              const visits = item.seans ?? (item.status ? 1 : 0)
              const hours = item.hours ?? (item.status ? 2 : 0)
              return (
                <TR key={item.id ?? index}>
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
                      {t('myAttendance.visitsCount', {
                        count: visits,
                        hours,
                      })}
                    </Badge>
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      )}
    </div>
  )
}
