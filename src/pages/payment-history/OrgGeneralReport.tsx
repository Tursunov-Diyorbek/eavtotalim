import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  HeaderTR,
  Panel,
  Skeleton,
  SkeletonCard,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { formatNumber } from '@/lib'
import { cn } from '@/lib/cn'
import type { GeneralReport, GeneralReportCard } from '@/types/payment-history'

type Tone = 'indigo' | 'amber' | 'teal' | 'violet'

const TONE_BORDER: Record<Tone, string> = {
  indigo: 'border-l-indigo',
  amber: 'border-l-amber',
  teal: 'border-l-teal',
  violet: 'border-l-violet',
}

function StatCard({
  tone,
  title,
  card,
  subtitle,
}: {
  tone: Tone
  title: string
  card: GeneralReportCard
  subtitle: string
}) {
  const down = card.grow === false
  const trend = card.grow !== null
  return (
    <Panel className={cn('border-l-4 px-4 py-3', TONE_BORDER[tone])}>
      <p className="truncate text-sm text-muted" title={title}>
        {title}
      </p>
      <p className="mt-1 text-2xl font-bold text-ink tabular-nums">
        {formatNumber(card.amount)}
      </p>
      {subtitle ? (
        <p
          className={cn(
            'mt-1 flex items-center gap-1 text-xs',
            !trend ? 'text-muted' : down ? 'text-rose' : 'text-teal',
          )}
        >
          {trend ? (
            down ? (
              <ArrowDownRight className="size-3.5" aria-hidden />
            ) : (
              <ArrowUpRight className="size-3.5" aria-hidden />
            )
          ) : null}
          <span className="truncate">{subtitle}</span>
        </p>
      ) : null}
    </Panel>
  )
}

function DynamicsChart({ report }: { report: GeneralReport }) {
  const { t } = useTranslation()
  const max = Math.max(1, ...report.months.flatMap((m) => [m.income, m.expense]))
  return (
    <Panel className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-ink">
          {t('paymentHistoryPage.grChartTitle', { year: report.year })}
        </h3>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-indigo" />
            {t('paymentHistoryPage.grIncome')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber" />
            {t('paymentHistoryPage.grExpense')}
          </span>
        </div>
      </div>
      <div className="flex h-56 items-end gap-2">
        {report.months.map((m) => {
          const label = t(`expensesPage.month_${m.month}`)
          return (
            <div key={m.month} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1.5">
              <div
                className="flex w-full flex-1 items-end justify-center gap-1"
                title={`${label}: ${t('paymentHistoryPage.grIncome')} ${formatNumber(m.income)} · ${t('paymentHistoryPage.grExpense')} ${formatNumber(m.expense)}`}
              >
                <div
                  className="w-full max-w-4 rounded-t bg-indigo transition-[height]"
                  style={{ height: `${(m.income / max) * 100}%` }}
                />
                <div
                  className="w-full max-w-4 rounded-t bg-amber transition-[height]"
                  style={{ height: `${(m.expense / max) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted">{label.slice(0, 3)}</span>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function cell(value: number, empty: boolean) {
  return empty ? '—' : formatNumber(value)
}

export function OrgGeneralReport({
  report,
  loading,
}: {
  report: GeneralReport | undefined
  loading: boolean
}) {
  const { t } = useTranslation()

  if (loading || !report) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </SkeletonCard>
          ))}
        </div>
        <SkeletonCard>
          <Skeleton className="h-64 w-full" />
        </SkeletonCard>
        <SkeletonCard>
          <Skeleton className="h-80 w-full" />
        </SkeletonCard>
      </div>
    )
  }

  const monthName = report.monthName || t(`expensesPage.month_${report.month}`)
  const period = `${monthName} ${report.year}`
  const rentability =
    report.income.amount > 0
      ? Math.round((report.profit.amount / report.income.amount) * 100)
      : 0
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          tone="indigo"
          title={report.income.label || `${period} — ${t('paymentHistoryPage.grTotalIncome')}`}
          card={report.income}
          subtitle={report.income.subtitle}
        />
        <StatCard
          tone="amber"
          title={report.expense.label || `${period} — ${t('paymentHistoryPage.grTotalExpense')}`}
          card={report.expense}
          subtitle={report.expense.subtitle}
        />
        <StatCard
          tone="teal"
          title={report.profit.label || t('paymentHistoryPage.grNetProfit')}
          card={report.profit}
          subtitle={
            report.profit.subtitle ||
            t('paymentHistoryPage.grRentability', { value: rentability })
          }
        />
        <StatCard
          tone="violet"
          title={report.yearProfit.label || t('paymentHistoryPage.grYearProfit')}
          card={report.yearProfit}
          subtitle={
            report.yearProfit.subtitle ||
            `${t('expensesPage.month_1')} — ${monthName} ${report.year}`
          }
        />
      </div>

      <DynamicsChart report={report} />

      <div className="space-y-2">
        <h3 className="font-semibold text-ink">{t('paymentHistoryPage.grTableTitle')}</h3>
        <Table storageKey="payment-history-general-report" className="min-w-220">
          <THead>
            <HeaderTR>
              <TH>{t('paymentHistoryPage.grMonth')}</TH>
              <TH className="text-right">{t('paymentHistoryPage.grCash')}</TH>
              <TH className="text-right">{t('paymentHistoryPage.grCard')}</TH>
              <TH className="text-right">{t('paymentHistoryPage.grBank')}</TH>
              <TH className="text-right">{t('paymentHistoryPage.grTotalIncome')}</TH>
              <TH className="text-right">{t('paymentHistoryPage.grTotalExpense')}</TH>
              <TH className="text-right">{t('paymentHistoryPage.grNetProfit')}</TH>
            </HeaderTR>
          </THead>
          <TBody>
            {report.months.map((m) => (
              <TR key={m.month} className={cn(m.empty && 'text-muted')}>
                <TD className="font-medium">
                  {m.name || t(`expensesPage.month_${m.month}`)}
                </TD>
                <TD className="text-right tabular-nums">{cell(m.cash, m.empty)}</TD>
                <TD className="text-right tabular-nums">{cell(m.card, m.empty)}</TD>
                <TD className="text-right tabular-nums">{cell(m.bank, m.empty)}</TD>
                <TD className="text-right font-semibold tabular-nums">
                  {cell(m.income, m.empty)}
                </TD>
                <TD className="text-right tabular-nums">{cell(m.expense, m.empty)}</TD>
                <TD
                  className={cn(
                    'text-right font-semibold tabular-nums',
                    !m.empty && (m.profit < 0 ? 'text-rose' : 'text-teal'),
                  )}
                >
                  {cell(m.profit, m.empty)}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  )
}
