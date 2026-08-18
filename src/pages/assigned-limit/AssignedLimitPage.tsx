import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, CheckCircle2, Database, History, PieChart, TrendingUp } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Panel,
  Skeleton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { useAssignedLimitQuery } from '@/features/assigned-limit'
import { cn, formatDate, formatNumber } from '@/lib'

function usageBarClass(percent: number) {
  if (percent >= 90) return 'bg-rose'
  if (percent >= 70) return 'bg-amber'
  return 'bg-signal'
}

function AssignedLimitSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel padding="sm" className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full" rounded="lg" />
            ))}
          </div>
          <Skeleton className="h-3 w-full" rounded="md" />
        </Panel>
        <Panel padding="sm">
          <Skeleton className="h-28 w-full" rounded="lg" />
        </Panel>
      </div>
      <ListPageSkeleton rows={5} />
    </div>
  )
}

export function AssignedLimitPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useAssignedLimitQuery(id)
  const active = data?.active_limit
  const rows = data?.limits ?? []

  const limit = Number(active?.limit) || 0
  const used = Number(active?.used_limit) || 0
  const usagePercent =
    limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0

  const stats = [
    {
      key: 'limit',
      label: t('assignedLimit.allocated'),
      value: active?.limit,
      tone: 'bg-signal-soft text-signal',
      icon: <PieChart className="size-4" aria-hidden />,
    },
    {
      key: 'used_limit',
      label: t('assignedLimit.used'),
      value: active?.used_limit,
      tone: 'bg-teal-soft text-teal',
      icon: <CheckCircle2 className="size-4" aria-hidden />,
    },
    {
      key: 'free_limit',
      label: t('assignedLimit.remaining'),
      value: active?.free_limit,
      tone: 'bg-amber-soft text-amber',
      icon: <TrendingUp className="size-4" aria-hidden />,
    },
  ]

  const meta = [
    {
      label: t('assignedLimit.recordsCount'),
      value: formatNumber(active?.records_count),
      icon: <Database className="size-3.5" aria-hidden />,
    },
    {
      label: t('assignedLimit.firstGiven'),
      value: formatDate(active?.first_given_at, i18n.language) ?? '—',
      icon: <Calendar className="size-3.5" aria-hidden />,
    },
    {
      label: t('assignedLimit.lastGiven'),
      value: formatDate(active?.last_given_at, i18n.language) ?? '—',
      icon: <History className="size-3.5" aria-hidden />,
    },
  ]

  return (
    <>
      <Header title={t('assignedLimit.title')} />
      <main className="space-y-3 p-3 sm:p-4">
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <AssignedLimitSkeleton />
        ) : !active ? (
          <EmptyState description={t('assignedLimit.noActive')} />
        ) : (
          <>
            <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <Panel padding="sm">
                <div className="grid grid-cols-3 gap-2">
                  {stats.map((item) => (
                    <div
                      key={item.key}
                      className={cn(
                        'flex items-center justify-between rounded-lg px-2.5 py-2',
                        item.tone,
                      )}
                    >
                      <div>
                        <p className="text-[11px] font-medium opacity-80">
                          {item.label}
                        </p>
                        <p className="font-display text-lg font-semibold">
                          {formatNumber(item.value)}
                        </p>
                      </div>
                      {item.icon}
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t border-mist/70 pt-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted">
                      {t('assignedLimit.usage')}
                    </span>
                    <Badge tone="neutral">
                      {formatNumber(used)} / {formatNumber(limit)}
                    </Badge>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-fog">
                    <div
                      className={cn('h-full rounded-full', usageBarClass(usagePercent))}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] text-muted">
                    <span>0%</span>
                    <span className="font-semibold text-deep">
                      {t('assignedLimit.usedPercent', { percent: usagePercent })}
                    </span>
                    <span>100%</span>
                  </div>
                </div>
              </Panel>

              <Panel padding="none">
                <p className="border-b border-mist/70 px-3 py-2 text-xs font-semibold text-muted">
                  {t('assignedLimit.history')}
                </p>
                <ul className="divide-y divide-mist/60">
                  {meta.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center justify-between gap-3 px-3 py-2.5"
                    >
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                        {item.icon}
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-deep">
                        {item.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>

            {rows.length === 0 ? (
              <EmptyState description={t('common.empty')} />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>{t('assignedLimit.allocated')}</TH>
                    <TH>{t('assignedLimit.used')}</TH>
                    <TH>{t('assignedLimit.remaining')}</TH>
                    <TH>{t('assignedLimit.givenAt')}</TH>
                    <TH>{t('assignedLimit.status')}</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((row, index) => {
                    const activeRow = Boolean(row.is_active)
                    return (
                      <TR key={`${row.created_at ?? 'row'}-${index}`}>
                        <TD>{formatNumber(row.limit)}</TD>
                        <TD>{formatNumber(row.used_limit)}</TD>
                        <TD>{formatNumber(row.free_limit)}</TD>
                        <TD>
                          {formatDate(row.created_at, i18n.language) ?? '—'}
                        </TD>
                        <TD>
                          <Badge tone={activeRow ? 'teal' : 'rose'}>
                            {activeRow
                              ? t('assignedLimit.active')
                              : t('assignedLimit.inactive')}
                          </Badge>
                        </TD>
                      </TR>
                    )
                  })}
                </TBody>
              </Table>
            )}
          </>
        )}
      </main>
    </>
  )
}
