import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  ConfirmDialog,
  DateInput,
  DeleteButton,
  EmptyState,
  ErrorMessage,
  Input,
  Panel,
  SafeImage,
  Select,
  Skeleton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { PATH_PREFIX_FILE, ROLE_CODE, routes } from '@/config'
import { useAuth } from '@/features/auth'
import { resolveFileUrl } from '@/features/lessons'
import {
  useDeleteStudentPaymentMutation,
  useStoreStudentPaymentMutation,
  useStudentForPaymentQuery,
} from '@/features/payment-history'
import { useSmartBack } from '@/hooks'
import { formatDate, formatNumber } from '@/lib'

export function StudentPaymentEditPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const goBack = useSmartBack(routes.paymentHistory)
  const { user } = useAuth()
  const showComment =
    user?.role === ROLE_CODE.DIRECTOR || user?.role === ROLE_CODE.SUPERADMIN

  const query = useStudentForPaymentQuery(id)
  const storeMutation = useStoreStudentPaymentMutation()
  const deleteMutation = useDeleteStudentPaymentMutation()
  const info = query.data
  const student = info?.student
  const payTypes = info?.pay_type ?? []
  const payments = student?.payments ?? []

  const [amount, setAmount] = useState('')
  const [payTypeId, setPayTypeId] = useState('')
  const [date, setDate] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const photo = resolveFileUrl(student?.image, PATH_PREFIX_FILE)
  const canSave =
    Number(amount) > 0 && Boolean(payTypeId) && Boolean(date) && !storeMutation.isPending

  const clear = () => {
    setAmount('')
    setPayTypeId('')
    setDate('')
  }

  const save = () => {
    if (!student?.id || !canSave) return
    storeMutation.mutate(
      {
        studentId: student.id,
        amount,
        paymentDate: date,
        payTypeId: Number(payTypeId),
      },
      {
        onSuccess: () => {
          notify.success(t('common.saved'))
          clear()
          void query.refetch()
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  return (
    <>
      <Header title={t('paymentHistoryPage.newPayment')} onBack={goBack} />
      <PageMain>
        {query.isLoading ? (
          <div className="grid gap-3 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <Skeleton className="h-72 w-full" rounded="xl" />
            <Skeleton className="h-72 w-full" rounded="xl" />
          </div>
        ) : query.isError || !student ? (
          <ErrorMessage />
        ) : (
          <div className="grid gap-3 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <Panel className="p-4">
              <div className="flex flex-col items-center gap-3">
                <SafeImage
                  src={photo}
                  size="xl"
                  label={t('common.noImage')}
                  className="size-36 rounded-xl ring-1 ring-mist/70"
                />
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="text-muted">{t('paymentHistoryPage.firstName')}</dt>
                  <dd className="font-semibold text-deep">{student.first_name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted">{t('paymentHistoryPage.lastName')}</dt>
                  <dd className="font-semibold text-deep">{student.last_name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted">{t('paymentHistoryPage.middleName')}</dt>
                  <dd className="font-semibold text-deep">{student.middle_name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted">{t('directorList.group')}</dt>
                  <dd className="font-semibold text-deep">
                    {student.group?.name_uz || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">{t('paymentHistoryPage.category')}</dt>
                  <dd className="font-semibold text-deep">
                    {student.edu_type?.name_uz || '—'}
                  </dd>
                </div>
              </dl>
            </Panel>

            <div className="flex min-w-0 flex-col gap-3">
              <Panel className="p-4">
                <p className="text-sm">
                  <span className="font-semibold text-deep">
                    {t('paymentHistoryPage.totalPaid')}:
                  </span>{' '}
                  {formatNumber(info?.payments_sum)}
                </p>
                <p className="mt-1 text-sm">
                  <span className="font-semibold text-deep">
                    {t('paymentHistoryPage.remainingDebt')}:
                  </span>{' '}
                  {Number(info?.debt) > 0
                    ? formatNumber(info?.debt)
                    : t('paymentHistoryPage.noDebt')}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Input
                    label={t('paymentHistoryPage.payAmount')}
                    inputMode="numeric"
                    placeholder={t('paymentHistoryPage.amountPlaceholder')}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
                  />
                  <Select
                    label={t('paymentHistoryPage.payTypes')}
                    value={payTypeId}
                    placeholder={t('paymentHistoryPage.payType')}
                    options={payTypes.map((item) => ({
                      value: String(item.id),
                      label: item.name || String(item.id),
                    }))}
                    onChange={(e) => setPayTypeId(e.target.value)}
                  />
                  <DateInput
                    label={t('paymentHistoryPage.payDate')}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <div className="flex items-end gap-2">
                    <Button className="flex-1" disabled={!canSave} onClick={save}>
                      {t('common.save')}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={clear}>
                      {t('common.clear')}
                    </Button>
                  </div>
                </div>
              </Panel>

              <Table storageKey="student-payment-records" className="min-w-160">
                <THead>
                  <TR>
                    <TH className="w-12 text-center">№</TH>
                    <TH>{t('paymentHistoryPage.qty')}</TH>
                    <TH>{t('paymentHistoryPage.payType')}</TH>
                    <TH className="text-center">{t('paymentHistoryPage.paidDate')}</TH>
                    {showComment ? <TH>{t('paymentHistoryPage.comment')}</TH> : null}
                    <TH className="w-20">{t('common.actions')}</TH>
                  </TR>
                </THead>
                <TBody>
                  {payments.length === 0 ? (
                    <TR>
                      <TD className="py-6 text-center" colSpan={showComment ? 6 : 5}>
                        <EmptyState
                          className="border-0 py-4 shadow-none"
                          description={t('paymentHistoryPage.noHistory')}
                        />
                      </TD>
                    </TR>
                  ) : (
                    payments.map((row, index) => (
                      <TR key={row.id}>
                        <TD className="text-center text-muted">{index + 1}</TD>
                        <TD>{formatNumber(row.amount)}</TD>
                        <TD>
                          {payTypes.find((item) => item.id === row.pay_type_id)?.name ||
                            '—'}
                        </TD>
                        <TD className="text-center">
                          {formatDate(row.payment_date, i18n.language) ?? '—'}
                        </TD>
                        {showComment ? (
                          <TD>{row.description || '—'}</TD>
                        ) : null}
                        <TD>
                          <DeleteButton onClick={() => setDeleteId(row.id)} />
                        </TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            </div>
          </div>
        )}
      </PageMain>

      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId == null) return
          deleteMutation.mutate(deleteId, {
            onSuccess: () => {
              notify.success(t('common.deleted'))
              setDeleteId(null)
              void query.refetch()
            },
            onError: (err) => notify.error(err.message || t('common.loadError')),
          })
        }}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
