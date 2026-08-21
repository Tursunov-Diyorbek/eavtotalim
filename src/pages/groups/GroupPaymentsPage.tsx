import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Save } from 'lucide-react'
import {
  Button,
  EditButton,
  EmptyTR,
  ErrorMessage,
  ExportButton,
  Input,
  Panel,
  Select,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { Header, PageMain } from '@/components/layout'
import { PAYMENT_TYPES, ROLE_CODE, groupShowPath, routes, studentPath } from '@/config'
import { useAuth } from '@/features/auth'
import { useGroupPaymentsQuery } from '@/features/groups'
import { useStoreStudentPaymentMutation } from '@/features/payment-history'
import { downloadXls } from '@/lib/downloadXls'
import { formatNumber, fullNameOf } from '@/lib'
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

function todayIso() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Eski `/groupdetails/:id` — guruh to‘lovlar tarixi. */
export function GroupPaymentsPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const goBack = useSmartBack(id ? groupShowPath(id) : routes.groups)
  const { user } = useAuth()
  const isAccountant = user?.role === ROLE_CODE.ACCOUNTANT
  const query = useGroupPaymentsQuery(id)
  const storeMutation = useStoreStudentPaymentMutation()
  const rows = query.data?.rows ?? []
  const group = query.data?.group
  const payTypes = (query.data?.payTypes?.length ? query.data.payTypes : PAYMENT_TYPES).map(
    (item) => ({ value: String(item.id), label: item.name || String(item.id) }),
  )
  const groupName = group?.name_uz || group?.name || ''

  const [editId, setEditId] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [payTypeId, setPayTypeId] = useState('')
  const [amountError, setAmountError] = useState('')
  const [payTypeError, setPayTypeError] = useState('')

  const startEdit = (studentId: number) => {
    setEditId(studentId)
    setAmount('')
    setPayTypeId('')
    setAmountError('')
    setPayTypeError('')
  }

  const savePayment = (studentId: number) => {
    const raw = amount.trim()
    const value = Number(raw)
    let nextAmount = ''
    let nextType = ''
    if (raw === '' || Number.isNaN(value)) {
      nextAmount = t('paymentHistoryPage.required')
    } else if (isAccountant && value < 0) {
      nextAmount = t('groupsPage.showPage.negativeAmount')
    } else if (value > 10_000_000) {
      nextAmount = t('paymentHistoryPage.amountMax')
    }
    if (!payTypeId) nextType = t('paymentHistoryPage.pickPayType')
    setAmountError(nextAmount)
    setPayTypeError(nextType)
    if (nextAmount || nextType) return

    storeMutation.mutate(
      {
        studentId,
        amount: String(value),
        payTypeId: Number(payTypeId),
        paymentDate: todayIso(),
      },
      {
        onSuccess: () => {
          notify.success(t('common.saved'))
          setEditId(null)
          setAmount('')
          setPayTypeId('')
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

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
        title={
          groupName
            ? `${t('groupsPage.showPage.paymentHistory')}: ${groupName}`
            : t('groupsPage.showPage.paymentHistory')
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportButton
              disabled={query.isLoading || rows.length === 0}
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
            />
            <Button variant="outline" size="sm" onClick={goBack}>
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
                <EmptyTR colSpan={6} />
              ) : (
                rows.map((row, index) => {
                  const cells = paymentCells(row)
                  const name = fullNameOf(row) ?? '—'
                  const editing = editId === row.id
                  return (
                    <TR
                      key={row.id ?? index}
                      className={
                        cells.price > cells.paid ? 'bg-rose-soft/45' : 'bg-teal-soft/35'
                      }
                    >
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
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="min-w-20">
                            {cells.unpaid
                              ? t('groupsPage.showPage.unpaid')
                              : formatNumber(cells.paid)}
                          </span>
                          {editing ? (
                            <>
                              <div className="w-28 shrink-0">
                                <Input
                                  size="sm"
                                  label=""
                                  aria-label={t('paymentHistoryPage.amount')}
                                  type="number"
                                  min={isAccountant ? 0 : undefined}
                                  value={amount}
                                  error={amountError}
                                  onChange={(e) => {
                                    setAmount(e.target.value)
                                    setAmountError('')
                                  }}
                                />
                              </div>
                              <Select
                                size="sm"
                                className="w-36 shrink-0"
                                placeholder={t('paymentHistoryPage.payType')}
                                value={payTypeId}
                                error={payTypeError}
                                options={payTypes}
                                onChange={(e) => {
                                  setPayTypeId(e.target.value)
                                  setPayTypeError('')
                                }}
                              />
                              <Button
                                variant="outline"
                                size="icon-sm"
                                aria-label={t('common.save')}
                                loading={storeMutation.isPending}
                                onClick={() => savePayment(row.id)}
                              >
                                <Save className="size-3.5" aria-hidden />
                              </Button>
                            </>
                          ) : (
                            <EditButton
                              className="ml-auto"
                              onClick={() => startEdit(row.id)}
                            />
                          )}
                        </div>
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
