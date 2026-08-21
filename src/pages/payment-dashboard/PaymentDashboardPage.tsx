import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RefreshCw, Wallet } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
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
import { studentPath } from '@/config'
import {
  isoMonthsAgo,
  isoToday,
  useDailyPaymentListQuery,
  usePaymentByTypeQuery,
} from '@/features/payment-dashboard'
import { formatDate, formatNumber, fullNameOf } from '@/lib'
import type { DailyPaymentByType } from '@/types'

function sumPayments(item: DailyPaymentByType): number {
  return (item.payments ?? []).reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0,
  )
}

function TypeCards({
  items,
  loading,
  error,
}: {
  items: DailyPaymentByType[]
  loading: boolean
  error: boolean
}) {
  const { t } = useTranslation()
  if (loading) {
    return (
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Panel key={i}>
            <Skeleton className="h-9 w-full" rounded="md" />
            <div className="flex items-center justify-between px-3 py-3">
              <Skeleton className="size-5" rounded="md" />
              <Skeleton className="h-5 w-24" />
            </div>
          </Panel>
        ))}
      </div>
    )
  }
  if (error) return <ErrorMessage />
  if (items.length === 0) {
    return <EmptyState description={t('common.empty')} />
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <Panel key={`${item.name}-${index}`}>
          <div className="border-b border-mist/70 bg-fog/80 px-3 py-2 text-sm font-semibold text-deep">
            {item.name || '—'}
          </div>
          <div className="flex items-center justify-between px-3 py-3">
            <Wallet className="size-5 text-signal" aria-hidden />
            <p className="font-display text-[15px] font-semibold text-deep">
              {formatNumber(sumPayments(item))} {t('dashboard.sum')}
            </p>
          </div>
        </Panel>
      ))}
    </div>
  )
}

export function PaymentDashboardPage() {
  const { t, i18n } = useTranslation()
  const today = isoToday()
  const fromMonth = isoMonthsAgo(1)

  const dailyTypes = usePaymentByTypeQuery(today, today)
  const monthlyTypes = usePaymentByTypeQuery(fromMonth, today)
  const dailyList = useDailyPaymentListQuery(today, today)

  const fetching =
    dailyTypes.isFetching || monthlyTypes.isFetching || dailyList.isFetching
  const rows = dailyList.data ?? []

  return (
    <>
      <Header
        title={t('paymentDashboardPage.title')}
        actions={
          <Button
            variant="outline"
            size="icon"
            aria-label={t('common.refresh')}
            loading={fetching}
            onClick={() => {
              void dailyTypes.refetch()
              void monthlyTypes.refetch()
              void dailyList.refetch()
            }}
          >
            <RefreshCw className="size-4" aria-hidden />
          </Button>
        }
      />
      <PageMain>
        <section className="flex flex-col gap-2">
          <h3 className="font-display text-[13px] font-semibold tracking-wide text-deep uppercase">
            {t('paymentDashboardPage.dailyIncomes')}
          </h3>
          <TypeCards
            items={dailyTypes.data ?? []}
            loading={dailyTypes.isLoading}
            error={dailyTypes.isError}
          />
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="font-display text-[13px] font-semibold tracking-wide text-deep uppercase">
            {t('paymentDashboardPage.monthlyIncomes')}
          </h3>
          <TypeCards
            items={monthlyTypes.data ?? []}
            loading={monthlyTypes.isLoading}
            error={monthlyTypes.isError}
          />
        </section>

        <section className="flex min-h-0 flex-1 flex-col gap-2">
          <h3 className="font-display text-[13px] font-semibold tracking-wide text-deep uppercase">
            {t('paymentDashboardPage.dailyList')}
          </h3>
          {dailyList.isLoading ? (
            <div className="grid gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-12 w-full" rounded="lg" />
              ))}
            </div>
          ) : dailyList.isError ? (
            <ErrorMessage />
          ) : (
            <Table storageKey="payment-dashboard-daily" className="min-w-160">
              <THead>
                <TR>
                  <TH className="w-12 text-center">№</TH>
                  <TH>{t('directorList.fio')}</TH>
                  <TH className="text-center">{t('directorList.date')}</TH>
                  <TH className="text-center">{t('paymentDashboardPage.amount')}</TH>
                  <TH>{t('directorList.type')}</TH>
                </TR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <TR>
                    <TD className="py-6 text-center" colSpan={5}>
                      <EmptyState
                        className="border-0 py-4 shadow-none"
                        description={t('common.empty')}
                      />
                    </TD>
                  </TR>
                ) : (
                  rows.map((row, index) => {
                    const name = fullNameOf(row.student) ?? '—'
                    const id = row.student?.id
                    return (
                      <TR key={row.id ?? `${id}-${index}`}>
                        <TD className="text-center text-muted">{index + 1}</TD>
                        <TD>
                          {id ? (
                            <Link
                              to={studentPath(id)}
                              className="font-semibold text-signal hover:underline"
                            >
                              {name}
                            </Link>
                          ) : (
                            name
                          )}
                        </TD>
                        <TD className="text-center text-muted">
                          {formatDate(row.payment_date, i18n.language) ?? '—'}
                        </TD>
                        <TD className="text-center font-semibold text-deep">
                          {formatNumber(row.amount)} {t('dashboard.sum')}
                        </TD>
                        <TD>
                          {row.pay_type?.name ? (
                            <Badge tone="signal">{row.pay_type.name}</Badge>
                          ) : (
                            '—'
                          )}
                        </TD>
                      </TR>
                    )
                  })
                )}
              </TBody>
            </Table>
          )}
        </section>
      </PageMain>
    </>
  )
}
