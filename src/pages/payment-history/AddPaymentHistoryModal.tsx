import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save } from 'lucide-react'
import {
  Button,
  DateInput,
  Field,
  Modal,
  Select,
  Skeleton,
  notify,
} from '@/components/ui'
import { PAYMENT_TYPES } from '@/config'
import {
  fetchGroupShow,
  fetchGroupShowStudents,
  fetchGroupsSelect,
} from '@/api'
import { useCreatePaymentHistoryMutation } from '@/features/payment-history'
import { cn, formatNumber } from '@/lib'
import moneyMagnitImg from '@/assets/images/money-magnit.png'
import type { PaymentGroupOption, PaymentGroupStudent } from '@/types/payment-history'

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

function studentPaid(student: PaymentGroupStudent | undefined) {
  return Number(student?.payment ?? 0) || 0
}

/**
 * To‘lov tarixi qo‘shish — eski Header `AddPaymentHistory` (Guruh | O‘quvchi …).
 */
export function AddPaymentHistoryModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const createMutation = useCreatePaymentHistoryMutation()
  const [groups, setGroups] = useState<PaymentGroupOption[]>([])
  const [groupsLoading, setGroupsLoading] = useState(false)
  const [students, setStudents] = useState<PaymentGroupStudent[]>([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [eduPrice, setEduPrice] = useState(0)
  const [groupId, setGroupId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayIso())
  const [payTypeId, setPayTypeId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const student = students.find((s) => String(s.id) === studentId)
  const debt = Math.max(0, eduPrice - studentPaid(student))
  const amountNum = Number(digits(amount)) || 0
  const amountError =
    amountNum > 10_000_000 ? t('paymentHistoryPage.amountMax') : ''

  const reset = () => {
    setGroupId('')
    setStudentId('')
    setStudents([])
    setEduPrice(0)
    setAmount('')
    setDate(todayIso())
    setPayTypeId('')
    setErrors({})
  }

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setGroupsLoading(true)
    void fetchGroupsSelect()
      .then((list) => {
        if (!cancelled) setGroups(list)
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setGroups([])
          notify.error(err.message || t('common.loadError'))
        }
      })
      .finally(() => {
        if (!cancelled) setGroupsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, t])

  useEffect(() => {
    if (!open || !groupId) {
      setStudents([])
      setEduPrice(0)
      return
    }
    let cancelled = false
    setStudentsLoading(true)
    void Promise.all([
      fetchGroupShowStudents(groupId, 1, 500),
      fetchGroupShow(groupId),
    ])
      .then(([page, show]) => {
        if (cancelled) return
        setStudents(
          (page.data ?? []).map((row) => ({
            id: row.id,
            last_name: row.last_name,
            first_name: row.first_name,
            middle_name: row.middle_name,
            payment:
              (row as { payment?: number | string | null }).payment ??
              (row as { all_payment?: number | string | null }).all_payment ??
              0,
          })),
        )
        setEduPrice(Number(show.education_price ?? 0) || 0)
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setStudents([])
          notify.error(err.message || t('common.loadError'))
        }
      })
      .finally(() => {
        if (!cancelled) setStudentsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, groupId, t])

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

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('paymentHistoryPage.addHistory')}
      sizeClassName="max-w-[600px]"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="danger" className="w-full" onClick={handleClose}>
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
      {groupsLoading && groups.length === 0 ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label={t('paymentHistoryPage.group')}
            required
            value={groupId}
            error={errors.groupId}
            placeholder={t('paymentHistoryPage.group')}
            options={groups.map((item) => ({
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
              placeholder={t('paymentHistoryPage.selectStudent')}
              disabled={!groupId || studentsLoading}
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
          <Field
            label={t('paymentHistoryPage.amount')}
            htmlFor="payment-amount"
            error={amountError}
          >
            <input
              id="payment-amount"
              inputMode="numeric"
              value={amount}
              placeholder="0"
              onChange={(e) =>
                setAmount(formatNumber(digits(e.target.value)))
              }
              className={cn(
                'h-9 w-full min-w-0 bg-transparent py-0 pl-3 pr-24 text-[14px] font-semibold tabular-nums leading-none text-deep outline-none placeholder:font-normal placeholder:text-muted/40',
              )}
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
              <span className="pointer-events-none text-[11px] font-medium text-muted">
                {t('dashboard.sum')}
              </span>
              <button
                type="button"
                disabled={debt <= 0}
                title={t('paymentHistoryPage.fillDebt')}
                aria-label={t('paymentHistoryPage.fillDebt')}
                onClick={() => setAmount(formatNumber(debt))}
                className={cn(
                  'inline-flex size-7 shrink-0 items-center justify-center rounded-md transition',
                  debt > 0
                    ? 'bg-amber-soft/80 hover:bg-amber-soft hover:ring-1 hover:ring-amber/30'
                    : 'cursor-not-allowed opacity-40',
                )}
              >
                <img
                  src={moneyMagnitImg}
                  alt=""
                  className="size-5 object-contain"
                  draggable={false}
                />
              </button>
            </div>
          </Field>
          <DateInput
            label={t('paymentHistoryPage.paidAt')}
            value={date}
            max={todayIso()}
            placeholder={t('paymentHistoryPage.paidAt')}
            onChange={(e) => setDate(e.target.value)}
          />
          <Select
            className="sm:col-span-2"
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
      )}
    </Modal>
  )
}
