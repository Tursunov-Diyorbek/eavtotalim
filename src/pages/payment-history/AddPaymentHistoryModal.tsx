import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Magnet, Save } from 'lucide-react'
import {
  Button,
  DateInput,
  Input,
  Modal,
  Select,
  notify,
} from '@/components/ui'
import { GROUP_STATUSES, PAYMENT_TYPES } from '@/config'
import { useCreatePaymentHistoryMutation } from '@/features/payment-history'
import { formatNumber } from '@/lib'
import type { PaymentGroupOption } from '@/types/payment-history'

function todayIso() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function isoToApiDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}-${m}-${y}` : iso
}

function digits(value: string) {
  return value.replace(/\D/g, '')
}

export function AddPaymentHistoryModal({
  open,
  onClose,
  groups,
}: {
  open: boolean
  onClose: () => void
  groups: PaymentGroupOption[]
}) {
  const { t } = useTranslation()
  const createMutation = useCreatePaymentHistoryMutation()
  const [status, setStatus] = useState('1')
  const [groupId, setGroupId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayIso())
  const [payTypeId, setPayTypeId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filtered = useMemo(
    () =>
      groups.filter((g) =>
        status === '' ? true : String(g.edu_status ?? '') === status,
      ),
    [groups, status],
  )
  const group = filtered.find((g) => String(g.id) === groupId)
  const students = group?.students ?? []
  const student = students.find((s) => String(s.id) === studentId)
  const debt = Math.max(
    0,
    Number(group?.education_price ?? 0) - Number(student?.payment ?? 0),
  )
  const amountNum = Number(digits(amount)) || 0
  const amountError =
    amountNum > 10_000_000 ? t('paymentHistoryPage.amountMax') : ''

  const reset = () => {
    setStatus('1')
    setGroupId('')
    setStudentId('')
    setAmount('')
    setDate(todayIso())
    setPayTypeId('')
    setErrors({})
  }

  const submit = () => {
    const next: Record<string, string> = {}
    if (!groupId) next.groupId = t('paymentHistoryPage.pickGroup')
    if (!studentId) next.studentId = t('paymentHistoryPage.pickStudent')
    if (!payTypeId) next.payTypeId = t('paymentHistoryPage.pickPayType')
    setErrors(next)
    if (Object.keys(next).length || amountError) {
      notify.error(t('paymentHistoryPage.required'))
      return
    }
    createMutation.mutate(
      {
        group_id: Number(groupId),
        student_id: Number(studentId),
        amount: String(amountNum || 0),
        payment_date: isoToApiDate(date),
        pay_type_id: Number(payTypeId),
      },
      {
        onSuccess: () => {
          notify.success(t('common.saved'))
          reset()
          onClose()
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title={t('paymentHistoryPage.addHistory')}
      sizeClassName="max-w-lg"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="danger"
            className="w-full"
            onClick={() => {
              reset()
              onClose()
            }}
          >
            {t('paymentHistoryPage.cancelPayment')}
          </Button>
          <Button
            className="w-full"
            loading={createMutation.isPending}
            onClick={submit}
          >
            <Save className="size-4" aria-hidden />
            {t('paymentHistoryPage.savePayment')}
          </Button>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label={t('paymentHistoryPage.groupStatus')}
          value={status}
          options={GROUP_STATUSES.map((item) => ({
            value: String(item.id),
            label: t(item.nameKey),
          }))}
          onChange={(e) => {
            setStatus(e.target.value)
            setGroupId('')
            setStudentId('')
          }}
        />
        <Select
          label={t('paymentHistoryPage.group')}
          required
          value={groupId}
          error={errors.groupId}
          placeholder={t('paymentHistoryPage.group')}
          options={filtered.map((item) => ({
            value: String(item.id),
            label: item.name_uz || item.name || String(item.id),
          }))}
          onChange={(e) => {
            setGroupId(e.target.value)
            setStudentId('')
            setAmount('')
            setErrors((prev) => ({ ...prev, groupId: '' }))
          }}
        />
        <div>
          <Select
            label={t('paymentHistoryPage.student')}
            required
            value={studentId}
            error={errors.studentId}
            placeholder={t('paymentHistoryPage.pickStudent')}
            options={students.map((item) => ({
              value: String(item.id),
              label:
                [item.last_name, item.first_name, item.middle_name]
                  .filter(Boolean)
                  .join(' ') || String(item.id),
            }))}
            onChange={(e) => {
              setStudentId(e.target.value)
              setAmount('')
              setErrors((prev) => ({ ...prev, studentId: '' }))
            }}
          />
          {studentId ? (
            <p className="mt-1 text-right text-xs font-semibold text-rose">
              {t('paymentHistoryPage.debt')}: {formatNumber(debt)}{' '}
              {t('dashboard.sum')}
            </p>
          ) : null}
        </div>
        <Input
          label={t('paymentHistoryPage.amount')}
          value={amount}
          error={amountError}
          inputMode="numeric"
          onChange={(e) => setAmount(formatNumber(digits(e.target.value)))}
          rightSlot={
            <Button
              variant="outline"
              size="icon-sm"
              className="size-7"
              disabled={debt <= 0}
              aria-label={t('paymentHistoryPage.fillDebt')}
              onClick={() => setAmount(formatNumber(debt))}
            >
              <Magnet className="size-3.5" />
            </Button>
          }
        />
        <DateInput
          label={t('paymentHistoryPage.paidAt')}
          value={date}
          max={todayIso()}
          onChange={(e) => setDate(e.target.value)}
        />
        <Select
          label={t('paymentHistoryPage.payMethod')}
          required
          value={payTypeId}
          error={errors.payTypeId}
          placeholder={t('paymentHistoryPage.payMethod')}
          options={PAYMENT_TYPES.map((item) => ({
            value: String(item.id),
            label: item.name,
          }))}
          onChange={(e) => {
            setPayTypeId(e.target.value)
            setErrors((prev) => ({ ...prev, payTypeId: '' }))
          }}
        />
      </div>
    </Modal>
  )
}
