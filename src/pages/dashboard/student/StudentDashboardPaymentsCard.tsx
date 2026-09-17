import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, History, Wallet } from 'lucide-react'
import {
  Badge,
  Button,
  EmptyState,
  Modal,
  Panel,
  SkeletonLines,
} from '@/components/ui'
import { useMyProfilePaymentsQuery } from '@/features/dashboard'
import { cn, formatDate, formatNumber } from '@/lib'

export function StudentDashboardPaymentsCard() {
  const { t, i18n } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const { data, isLoading, isFetching, refetch } =
    useMyProfilePaymentsQuery(visible)

  const paid = Number(data?.sum_payment) || 0
  const total = Number(data?.price) || 0
  const debt =
    data?.debt != null ? Number(data.debt) : Math.max(total - paid, 0)
  const progress =
    total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0
  const list = data?.payments ?? []

  const mask = (value: string) => (visible ? value : '******')

  const handleToggle = () => {
    if (!visible) {
      setVisible(true)
      void refetch()
    } else {
      setVisible(false)
      setHistoryOpen(false)
    }
  }

  return (
    <>
      <Panel padding="sm" className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-teal-soft text-teal">
              <Wallet className="size-3.5" aria-hidden />
            </span>
            <p className="truncate text-[12px] font-semibold text-deep">
              {t('dashboard.student.myPayments')}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            {visible ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setHistoryOpen(true)}
                disabled={isLoading}
                aria-label={t('dashboard.student.paymentHistory')}
              >
                <History className="size-3.5" aria-hidden />
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="icon-sm"
              loading={isFetching && visible && !data}
              onClick={handleToggle}
              aria-label={
                visible
                  ? t('dashboard.student.hide')
                  : t('dashboard.student.show')
              }
            >
              {visible ? (
                <EyeOff className="size-3.5" aria-hidden />
              ) : (
                <Eye className="size-3.5" aria-hidden />
              )}
            </Button>
          </div>
        </div>

        {visible && isLoading ? <SkeletonLines lines={2} /> : null}

        {visible && !isLoading ? (
          <div>
            <div className="mb-0.5 flex justify-between text-[10px] text-muted">
              <span>{t('dashboard.student.paidProgress')}</span>
              <span className="font-semibold text-deep">{progress}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-fog">
              <div
                className="h-full rounded-full bg-teal transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              {
                key: 'paid',
                label: t('dashboard.student.paid'),
                value: paid,
                tone: 'teal',
              },
              {
                key: 'debt',
                label: t('dashboard.student.debt'),
                value: debt || total,
                tone: 'rose',
              },
              {
                key: 'total',
                label: t('dashboard.student.total'),
                value: total,
                tone: 'signal',
              },
            ] as const
          ).map((item) => (
            <div
              key={item.key}
              className="flex flex-col items-center justify-center rounded-lg border border-mist/60 bg-fog/40 px-1 py-1.5 text-center"
            >
              <p
                className={cn(
                  'text-[11px] font-semibold',
                  item.tone === 'teal' && 'text-teal',
                  item.tone === 'rose' && 'text-rose',
                  item.tone === 'signal' && 'text-signal',
                )}
              >
                {mask(formatNumber(item.value))}
                <span className="ml-0.5 text-[9px] font-normal text-muted">
                  {t('dashboard.student.currency')}
                </span>
              </p>
              <p className="text-[9px] text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Modal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title={t('dashboard.student.paymentHistory')}
        sizeClassName="max-w-lg"
      >
        {list.length === 0 ? (
          <EmptyState
            description={t('dashboard.student.paymentHistoryEmpty')}
          />
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto">
            {list.map((row, index) => (
              <li
                key={row.id ?? index}
                className="flex items-center justify-between gap-2 rounded-lg border border-mist/60 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-deep">
                    {row.payment_type?.name || '—'}
                  </p>
                  <p className="text-[11px] text-muted">
                    {formatDate(row.payment_date, i18n.language) ??
                      row.payment_date ??
                      '—'}
                  </p>
                </div>
                <Badge tone="teal">
                  {formatNumber(row.amount)} {t('dashboard.student.currency')}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  )
}
