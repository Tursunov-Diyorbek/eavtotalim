import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save } from 'lucide-react'
import {
  Button,
  DateInput,
  Input,
  Modal,
  Select,
  Textarea,
  notify,
} from '@/components/ui'
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
} from '@/features/expenses'
import type { ExpenseItem, ExpenseType } from '@/types/expenses'

function todayIso() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function ExpenseFormModal({
  open,
  onClose,
  types,
  editing,
}: {
  open: boolean
  onClose: () => void
  types: ExpenseType[]
  editing: ExpenseItem | null
}) {
  const { t } = useTranslation()
  const createMutation = useCreateExpenseMutation()
  const updateMutation = useUpdateExpenseMutation()
  const [typeId, setTypeId] = useState('')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const required = t('expensesPage.required')

  useEffect(() => {
    if (!open) return
    setTypeId(
      editing?.organization_expense_type_id != null
        ? String(editing.organization_expense_type_id)
        : '',
    )
    setDate(editing?.date ? String(editing.date).slice(0, 10) : '')
    setAmount(editing?.amount != null ? String(editing.amount) : '')
    setDescription(editing?.description ?? '')
    setErrors({})
  }, [open, editing])

  const pending = createMutation.isPending || updateMutation.isPending

  const submit = () => {
    const next: Record<string, string> = {}
    if (!typeId) next.typeId = required
    if (!date) next.date = required
    if (!amount.trim()) next.amount = required
    setErrors(next)
    if (Object.keys(next).length) {
      notify.error(required)
      return
    }

    const payload = {
      organization_expense_type_id: Number(typeId),
      date,
      amount: amount.trim(),
      description: description.trim() || undefined,
    }
    const onSuccess = () => {
      notify.success(t('common.saved'))
      onClose()
    }
    const onError = (err: Error) =>
      notify.error(err.message || t('common.loadError'))

    if (editing) {
      updateMutation.mutate({ id: editing.id, payload }, { onSuccess, onError })
    } else {
      createMutation.mutate(payload, { onSuccess, onError })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        editing
          ? t('expensesPage.editExpense')
          : t('expensesPage.addExpense')
      }
      sizeClassName="max-w-lg"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="w-full" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            className="w-full"
            loading={pending}
            onClick={submit}
          >
            <Save className="size-4" aria-hidden />
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <Select
          label={t('expensesPage.expenseTypes')}
          required
          value={typeId}
          error={errors.typeId}
          placeholder={t('expensesPage.expenseTypes')}
          options={types.map((item) => ({
            value: String(item.id),
            label: item.name || String(item.id),
          }))}
          onChange={(e) => {
            setTypeId(e.target.value)
            setErrors((prev) => ({ ...prev, typeId: '' }))
          }}
        />
        <DateInput
          label={t('expensesPage.date')}
          required
          value={date}
          max={todayIso()}
          error={errors.date}
          onChange={(e) => {
            setDate(e.target.value)
            setErrors((prev) => ({ ...prev, date: '' }))
          }}
        />
        <Input
          label={t('expensesPage.amount')}
          required
          inputMode="numeric"
          value={amount}
          error={errors.amount}
          placeholder={t('expensesPage.amountPlaceholder')}
          onChange={(e) => {
            setAmount(e.target.value.replace(/[^\d.]/g, ''))
            setErrors((prev) => ({ ...prev, amount: '' }))
          }}
        />
        <Textarea
          label={t('expensesPage.comment')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>
    </Modal>
  )
}
