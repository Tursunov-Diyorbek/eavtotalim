import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Button,
  EmptyState,
  ErrorMessage,
  Panel,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { Header, PageMain } from '@/components/layout'
import { groupShowPath, studentPath, routes } from '@/config'
import { useGroupPaymentsQuery } from '@/features/groups'
import { downloadXls } from '@/lib/downloadXls'
import { formatNumber, fullNameOf } from '@/lib/format'
import { useSmartBack } from '@/hooks'
import type { GroupPaymentRow } from '@/types/groups'

function paidSum(row: GroupPaymentRow) {
  return (row.payments ?? []).reduce((sum, item) => sum + Number(item.amount ?? 0), 0)
}

function paymentCells(row: GroupPaymentRow) {
  const price = Number(row.education_price ?? 0)
  const paid = paidSum(row)
  const diff = price - paid
  return {
    price,
    paid,
    debt: diff > 0 ? diff : 0,
    overpay: diff < 0 ? -diff : 0,
    unpaid: (row.payments ?? []).length === 0,
  }
}

/** Eski `/groupdetails/:id` — guruh to‘lovlar tarixi. */
export function GroupPaymentsPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const goBack = useSmartBack(id ? groupShowPath(id) : routes.groups)
  const query = useGroupPaymentsQuery(id)
  const rows = query.data ?? []

  const exportRows = rows.map((row, index) => {
    const cells = paymentCells(row)
    return [
      index + 1,
      fullNameOf(row) ?? '',
      cells.price,
      cells.unpaid ? '' : cells.paid,
      cells.debt || '',
      cells.overpay || '',
    ]
  })

  return (
    <>
      <Header
        title={t('groupsPage.showPage.paymentHistory')}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="soft"
              size="sm"
              onClick={() =>
                downloadXls(
                  'guruh-tolovlari',
                  [
                    '№',
                    t('directorList.fio'),
                    t('groupsPage.showPage.tuition'),
                    t('groupsPage.showPage.paid'),
                    t('groupsPage.showPage.debt'),
                    t('groupsPage.showPage.overpay'),
                  ],
                  exportRows,
                )
              }
            >
              {t('groupsPage.showPage.exportXls')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goBack}
            >
              {t('common.back')}
            </Button>
          </div>
        }
      />
      <PageMain fill>
        {query.isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={8} />
          </Panel>
        ) : query.isError || !id ? (
          <ErrorMessage />
        ) : (
          <Table storageKey="group-payments" className="min-w-200">
            <THead>
              <TR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('directorList.fio')}</TH>
                <TH>{t('groupsPage.showPage.tuition')}</TH>
                <TH>{t('groupsPage.showPage.paid')}</TH>
                <TH>{t('groupsPage.showPage.debt')}</TH>
                <TH>{t('groupsPage.showPage.overpay')}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD className="py-6 text-center" colSpan={6}>
                    <EmptyState
                      className="border-0 py-4 shadow-none"
                      description={t('common.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => {
                  const cells = paymentCells(row)
                  const name = fullNameOf(row) ?? '—'
                  return (
                    <TR key={row.id ?? index}>
                      <TD className="text-center text-muted">{index + 1}</TD>
                      <TD>
                        <Link
                          to={studentPath(row.id)}
                          className="font-semibold text-signal hover:underline"
                        >
                          {name}
                        </Link>
                      </TD>
                      <TD>{formatNumber(cells.price)}</TD>
                      <TD>
                        {cells.unpaid
                          ? t('groupsPage.showPage.unpaid')
                          : formatNumber(cells.paid)}
                      </TD>
                      <TD>{cells.debt ? formatNumber(cells.debt) : '—'}</TD>
                      <TD>{cells.overpay ? formatNumber(cells.overpay) : '—'}</TD>
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        )}
      </PageMain>
    </>
  )
}
