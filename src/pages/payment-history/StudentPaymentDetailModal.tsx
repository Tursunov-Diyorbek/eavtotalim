import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  DateInput,
  EmptyTR,
  ErrorMessage,
  HeaderTR,
  Input,
  Modal,
  Select,
  Skeleton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Textarea,
  notify,
} from '@/components/ui'
import { PAYMENT_TYPES } from '@/config'
import { useAuth } from '@/features/auth'
import {
  useAccountingPaymentShowQuery,
  useSetAccountingBonusMutation,
  useStoreAccountingPaymentMutation,
} from '@/features/payment-history'
import { formatDate, formatNumber } from '@/lib'
import { cn } from '@/lib/cn'
import type { StudentPaymentDetail } from '@/types/payment-history'
import { CheckOpenButton, PrintCheckModal, type CheckPayload } from './PrintCheckModal'

const MAX_BONUS = 500_000
const BONUS_NOTE_MAX = 255

const PERM_BONUS = 'moliya.payment.bonus.add'
const PERM_ADD = 'moliya.payment.add'

function todayIso() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function digitsOf(value: string) {
  return value.replace(/\D/g, '')
}

function SetBonusModal({
  open,
  studentId,
  onClose,
}: {
  open: boolean
  studentId: number
  onClose: () => void
}) {
  const { t } = useTranslation()
  const mutation = useSetAccountingBonusMutation()
  const [bonus, setBonus] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<{ bonus?: string; note?: string }>({})

  const close = () => {
    setBonus('')
    setNote('')
    setErrors({})
    onClose()
  }

  const submit = () => {
    const amount = Number(bonus)
    const next: { bonus?: string; note?: string } = {}
    if (!bonus || !amount) next.bonus = t('paymentHistoryPage.pdBonusRequired')
    else if (amount > MAX_BONUS) next.bonus = t('paymentHistoryPage.pdBonusMax')
    if (!note.trim()) next.note = t('paymentHistoryPage.pdNoteRequired')
    setErrors(next)
    if (next.bonus || next.note) return
    mutation.mutate(
      { student_id: studentId, bonus: amount, bonus_description: note.trim() },
      {
        onSuccess: () => {
          notify.success(t('common.saved'))
          close()
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={t('paymentHistoryPage.pdAddBonus')}
      sizeClassName="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button loading={mutation.isPending} onClick={submit}>
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <Input
          label={t('paymentHistoryPage.pdBonusAmount')}
          required
          inputMode="numeric"
          maxLength={7}
          value={bonus ? formatNumber(bonus) : ''}
          placeholder={t('paymentHistoryPage.pdBonusPlaceholder', {
            max: formatNumber(MAX_BONUS),
          })}
          error={errors.bonus}
          onChange={(e) => {
            const raw = digitsOf(e.target.value)
            setBonus(raw ? String(Math.min(Number(raw), MAX_BONUS)) : '')
            setErrors((prev) => ({ ...prev, bonus: undefined }))
          }}
        />
        <Textarea
          label={t('paymentHistoryPage.pdNote')}
          required
          rows={3}
          maxLength={BONUS_NOTE_MAX}
          value={note}
          placeholder={t('paymentHistoryPage.pdNotePlaceholder')}
          error={errors.note}
          onChange={(e) => {
            setNote(e.target.value)
            setErrors((prev) => ({ ...prev, note: undefined }))
          }}
        />
      </div>
    </Modal>
  )
}

function AddPaymentModal({
  open,
  studentId,
  payTypes,
  onClose,
}: {
  open: boolean
  studentId: number
  payTypes: StudentPaymentDetail['payTypes']
  onClose: () => void
}) {
  const { t } = useTranslation()
  const mutation = useStoreAccountingPaymentMutation()
  const [amount, setAmount] = useState('')
  const [payTypeId, setPayTypeId] = useState('')
  const [date, setDate] = useState(todayIso)
  const [errors, setErrors] = useState<{ amount?: string; payType?: string; date?: string }>({})

  const options = (payTypes.length ? payTypes : PAYMENT_TYPES).map((item) => ({
    value: String(item.id),
    label: item.name,
  }))

  const close = () => {
    setAmount('')
    setPayTypeId('')
    setDate(todayIso())
    setErrors({})
    onClose()
  }

  const submit = () => {
    const next: typeof errors = {}
    if (!Number(amount)) next.amount = t('paymentHistoryPage.pdAmountRequired')
    if (!payTypeId) next.payType = t('paymentHistoryPage.pickPayType')
    if (!date) next.date = t('paymentHistoryPage.pdDateRequired')
    setErrors(next)
    if (Object.keys(next).length) return
    mutation.mutate(
      {
        student_id: studentId,
        pay_type_id: Number(payTypeId),
        amount: Number(amount),
        payment_date: date,
      },
      {
        onSuccess: () => {
          notify.success(t('common.saved'))
          close()
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={t('paymentHistoryPage.pdNewPayment')}
      sizeClassName="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button loading={mutation.isPending} onClick={submit}>
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <Input
          label={t('paymentHistoryPage.pdPayAmount')}
          required
          inputMode="numeric"
          value={amount ? formatNumber(amount) : ''}
          placeholder="0"
          error={errors.amount}
          onChange={(e) => {
            setAmount(digitsOf(e.target.value))
            setErrors((prev) => ({ ...prev, amount: undefined }))
          }}
        />
        <Select
          label={t('paymentHistoryPage.payMethod')}
          required
          options={options}
          value={payTypeId}
          placeholder={t('paymentHistoryPage.payMethod')}
          error={errors.payType}
          onChange={(e) => {
            setPayTypeId(e.target.value)
            setErrors((prev) => ({ ...prev, payType: undefined }))
          }}
        />
        <DateInput
          label={t('paymentHistoryPage.pdPayDate')}
          value={date}
          max={todayIso()}
          error={errors.date}
          onChange={(e) => {
            setDate(e.target.value)
            setErrors((prev) => ({ ...prev, date: undefined }))
          }}
        />
      </div>
    </Modal>
  )
}

function SummaryCard({
  label,
  value,
  className,
  valueClassName,
  action,
  note,
}: {
  label: string
  value: number
  className: string
  valueClassName?: string
  action?: React.ReactNode
  note?: string
}) {
  return (
    <div className={cn('rounded-xl px-4 py-3', className)}>
      <p className="text-xs text-muted">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className={cn('text-xl font-bold tabular-nums text-ink', valueClassName)}>
          {formatNumber(value)}
        </p>
        {action}
      </div>
      {note ? (
        <p className="mt-1 line-clamp-2 text-xs text-muted" title={note}>
          {note}
        </p>
      ) : null}
    </div>
  )
}

export function StudentPaymentDetailModal({
  studentId,
  onClose,
}: {
  studentId: number | null
  onClose: () => void
}) {
  const { t, i18n } = useTranslation()
  const { hasPermission, me } = useAuth()
  const query = useAccountingPaymentShowQuery(studentId)
  const detail = query.data
  const [bonusOpen, setBonusOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [check, setCheck] = useState<CheckPayload | null>(null)

  const canBonus = hasPermission(PERM_BONUS) && Boolean(detail) && (detail?.bonus ?? 0) <= 0
  const canAdd = hasPermission(PERM_ADD) && Boolean(detail)
  const orgName =
    me?.profession?.organization?.name_uz || me?.profession?.organization?.name || ''

  const close = () => {
    setCheck(null)
    onClose()
  }

  return (
    <>
      <Modal
        open={Boolean(studentId)}
        onClose={close}
        sizeClassName="max-w-3xl"
        title={
          detail ? (
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{detail.name}</p>
              <p className="text-xs font-normal text-muted">
                {t('paymentHistoryPage.pdMeta', {
                  group: detail.groupName,
                  edu: detail.eduType,
                })}
              </p>
            </div>
          ) : (
            <Skeleton className="h-5 w-64" />
          )
        }
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={close}>
              {t('paymentHistoryPage.close')}
            </Button>
            {canBonus ? (
              <Button variant="outline" onClick={() => setBonusOpen(true)}>
                {t('paymentHistoryPage.pdAddBonus')}
              </Button>
            ) : null}
            {canAdd ? (
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="size-4" aria-hidden />
                {t('paymentHistoryPage.pdNewPayment')}
              </Button>
            ) : null}
          </div>
        }
      >
        {query.isLoading ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" rounded="xl" />
              ))}
            </div>
            <Skeleton className="h-2 w-full" rounded="full" />
            <Skeleton className="h-40 w-full" rounded="xl" />
          </div>
        ) : query.isError || !detail ? (
          <ErrorMessage />
        ) : (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                label={t('paymentHistoryPage.psTotalPrice')}
                value={detail.totalPrice}
                className="bg-fog"
              />
              <SummaryCard
                label={t('paymentHistoryPage.psPaidCol')}
                value={detail.paid}
                className="bg-teal-soft"
                valueClassName="text-teal"
              />
              <SummaryCard
                label={t('paymentHistoryPage.pdDebtLeft')}
                value={detail.debt}
                className="bg-rose-soft"
                valueClassName="text-rose"
              />
              <SummaryCard
                label={t('paymentHistoryPage.psBonus')}
                value={detail.bonus}
                className="bg-amber-soft"
                valueClassName="text-amber"
                note={detail.bonusDescription}
                action={
                  canBonus ? (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="border-amber text-amber"
                      aria-label={t('paymentHistoryPage.pdAddBonus')}
                      title={t('paymentHistoryPage.pdAddBonus')}
                      onClick={() => setBonusOpen(true)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  ) : null
                }
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-fog">
                <div
                  className={cn(
                    'h-full rounded-full transition-[width]',
                    detail.percent >= 100 ? 'bg-teal' : 'bg-rose',
                  )}
                  style={{ width: `${detail.percent}%` }}
                />
              </div>
              <span className="shrink-0 text-sm font-semibold text-muted">
                {detail.percentLabel ||
                  t('paymentHistoryPage.pdPercentPaid', { value: detail.percent })}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {t('paymentHistoryPage.pdHistory')}
              </h3>
              <Table storageKey="student-payment-detail-history">
                <THead>
                  <HeaderTR>
                    <TH>{t('paymentHistoryPage.psDate')}</TH>
                    <TH className="text-right">{t('paymentHistoryPage.pdSum')}</TH>
                    <TH>{t('paymentHistoryPage.pdMethod')}</TH>
                    <TH>{t('paymentHistoryPage.pdWho')}</TH>
                    <TH className="w-16 text-center">{t('paymentHistoryPage.check')}</TH>
                  </HeaderTR>
                </THead>
                <TBody>
                  {detail.history.length === 0 ? (
                    <EmptyTR colSpan={5} />
                  ) : (
                    detail.history.map((item) => (
                      <TR key={item.key}>
                        <TD>
                          {item.date ? (formatDate(item.date, i18n.language) ?? item.date) : '—'}
                        </TD>
                        <TD className="text-right font-semibold tabular-nums">
                          {formatNumber(item.amount)}
                        </TD>
                        <TD>{item.payType}</TD>
                        <TD>{item.createdBy}</TD>
                        <TD className="text-center">
                          <CheckOpenButton
                            onClick={() =>
                              setCheck({
                                id: item.id || undefined,
                                org: item.org || orgName,
                                group: item.group || detail.groupName,
                                student: detail.name,
                                paymentDate: item.createdAt || item.date,
                                payType: item.payType,
                                amount: item.amount,
                                cashier: item.createdBy,
                              })
                            }
                          />
                        </TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            </div>
          </div>
        )}
      </Modal>

      {studentId ? (
        <>
          <SetBonusModal
            open={bonusOpen}
            studentId={studentId}
            onClose={() => setBonusOpen(false)}
          />
          <AddPaymentModal
            open={addOpen}
            studentId={studentId}
            payTypes={detail?.payTypes ?? []}
            onClose={() => setAddOpen(false)}
          />
        </>
      ) : null}
      <PrintCheckModal open={Boolean(check)} payload={check} onClose={() => setCheck(null)} />
    </>
  )
}
