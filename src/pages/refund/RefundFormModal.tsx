import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save } from 'lucide-react'
import { PATH_PREFIX_FILE } from '@/config/env'
import {
  Button,
  ConfirmDialog,
  DateInput,
  DetailList,
  Input,
  Modal,
  Notification,
  SafeImage,
  Select,
  Textarea,
  notify,
} from '@/components/ui'
import { isRefundValidationError } from '@/api'
import { resolveFileUrl } from '@/features/lessons'
import {
  useRefundStudentsQuery,
  useStoreReturnedPaymentMutation,
} from '@/features/refund'
import { asLangName, formatNumber, fullNameOf } from '@/lib'
import type { RefundGroupOption, RefundStudentOption } from '@/types/refund'

function todayIso() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function money(value: number | string | null | undefined) {
  if (value == null || value === '') return ''
  return formatNumber(value)
}

export function RefundFormModal({
  open,
  onClose,
  groups,
}: {
  open: boolean
  onClose: () => void
  groups: RefundGroupOption[]
}) {
  const { t, i18n } = useTranslation()
  const storeMutation = useStoreReturnedPaymentMutation()
  const [groupId, setGroupId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayIso())
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmOpen, setConfirmOpen] = useState(false)

  const studentsQuery = useRefundStudentsQuery(groupId, open)
  const students = studentsQuery.data ?? []
  const student = students.find((item) => String(item.id) === studentId)
  const group = groups.find((item) => String(item.id) === groupId)

  useEffect(() => {
    if (!open) return
    setGroupId('')
    setStudentId('')
    setAmount('')
    setDate(todayIso())
    setDescription('')
    setErrors({})
    setConfirmOpen(false)
  }, [open])

  const reset = () => {
    setGroupId('')
    setStudentId('')
    setAmount('')
    setDate(todayIso())
    setDescription('')
    setErrors({})
    setConfirmOpen(false)
  }

  const close = () => {
    if (storeMutation.isPending) return
    reset()
    onClose()
  }

  const applyServerErrors = (fields: Record<string, string>) => {
    const next: Record<string, string> = {}
    if (fields.group_id) next.groupId = fields.group_id
    if (fields.student_id) next.studentId = fields.student_id
    if (fields.amount) next.amount = fields.amount
    if (fields.returned_date) next.date = fields.returned_date
    if (fields.description) next.description = fields.description
    setErrors(next)
  }

  const validate = () => {
    const required = t('refundPage.required')
    const next: Record<string, string> = {}
    if (!groupId) next.groupId = required
    if (!studentId) next.studentId = required
    if (!amount.trim()) next.amount = required
    if (!date) next.date = required
    if (!description.trim()) next.description = required
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = () => {
    if (!validate()) {
      notify.error(t('refundPage.required'))
      return
    }
    setConfirmOpen(true)
  }

  const confirm = () => {
    storeMutation.mutate(
      {
        studentId,
        amount: amount.trim(),
        description: description.trim(),
        returnedDate: date,
      },
      {
        onSuccess: (res) => {
          notify.success(res.message || t('common.saved'))
          setConfirmOpen(false)
          reset()
          onClose()
        },
        onError: (err) => {
          setConfirmOpen(false)
          if (isRefundValidationError(err)) {
            applyServerErrors(err.fields)
            notify.error(err.message || t('refundPage.required'))
            return
          }
          notify.error(err.message || t('common.loadError'))
        },
      },
    )
  }

  const groupLabel = (item: RefundGroupOption) =>
    asLangName(item, i18n.language)
  const studentLabel = (item: RefundStudentOption) =>
    fullNameOf(item) || String(item.id)
  const photo = student?.image
    ? resolveFileUrl(student.image, PATH_PREFIX_FILE)
    : ''

  return (
    <>
      <Modal
        open={open}
        onClose={close}
        title={t('refundPage.modalTitle')}
        sizeClassName="max-w-3xl"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full" onClick={close}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              className="w-full"
              loading={storeMutation.isPending}
              onClick={submit}
            >
              <Save className="size-4" aria-hidden />
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <Notification tone="warning" className="mb-3">
          {t('refundPage.warning')}
        </Notification>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Select
              label={t('refundPage.groups')}
              required
              value={groupId}
              placeholder={t('common.selectPlaceholder')}
              error={errors.groupId}
              options={groups.map((item) => ({
                value: String(item.id),
                label: groupLabel(item),
              }))}
              onChange={(e) => {
                setGroupId(e.target.value)
                setStudentId('')
                setErrors((prev) => ({ ...prev, groupId: '', studentId: '' }))
              }}
            />
            <Select
              label={t('refundPage.students')}
              required
              value={studentId}
              placeholder={t('common.selectPlaceholder')}
              error={errors.studentId}
              loading={studentsQuery.isFetching}
              options={students.map((item) => ({
                value: String(item.id),
                label: studentLabel(item),
              }))}
              onChange={(e) => {
                setStudentId(e.target.value)
                setErrors((prev) => ({ ...prev, studentId: '' }))
              }}
            />
            <Input
              label={t('refundPage.sum')}
              required
              type="number"
              min={0}
              value={amount}
              error={errors.amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setErrors((prev) => ({ ...prev, amount: '' }))
              }}
            />
            <DateInput
              label={t('refundPage.returnedDate')}
              required
              value={date}
              error={errors.date}
              onChange={(e) => {
                setDate(e.target.value)
                setErrors((prev) => ({ ...prev, date: '' }))
              }}
            />
            <Textarea
              label={t('refundPage.description')}
              required
              rows={4}
              value={description}
              error={errors.description}
              onChange={(e) => {
                setDescription(e.target.value)
                setErrors((prev) => ({ ...prev, description: '' }))
              }}
            />
          </div>
          <div>
            <p className="font-display mb-3 text-center text-sm font-semibold tracking-wide text-deep uppercase">
              {t('refundPage.studentInfo')}
            </p>
            <DetailList
              className="sm:grid-cols-1"
              items={[
                {
                  label: t('refundPage.group'),
                  value: group ? groupLabel(group) : '',
                },
                {
                  label: t('refundPage.fio'),
                  value: student ? studentLabel(student) : '',
                },
                {
                  label: t('refundPage.eduPrice'),
                  value: student ? money(student.education_price) : '',
                },
                {
                  label: t('refundPage.allPayments'),
                  value: student ? money(student.all_payments) : '',
                },
                {
                  label: t('refundPage.debt'),
                  value: student ? money(student.debt) : '',
                },
              ]}
            />
            {photo ? (
              <SafeImage
                src={photo}
                alt={student ? studentLabel(student) : ''}
                size="lg"
                className="mx-auto mt-4 size-36 rounded-lg"
              />
            ) : null}
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirm}
        title={t('refundPage.confirmTitle')}
        description={t('refundPage.warning')}
        confirmLabel={t('refundPage.confirmAction')}
        loading={storeMutation.isPending}
      />
    </>
  )
}
