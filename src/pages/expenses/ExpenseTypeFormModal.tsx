import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save } from 'lucide-react'
import { Button, Input, Modal, Textarea, notify } from '@/components/ui'
import {
  useCreateExpenseTypeMutation,
  useUpdateExpenseTypeMutation,
} from '@/features/expenses'
import type { ExpenseType } from '@/types/expenses'

export function ExpenseTypeFormModal({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing: ExpenseType | null
}) {
  const { t } = useTranslation()
  const createMutation = useCreateExpenseTypeMutation()
  const updateMutation = useUpdateExpenseTypeMutation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    if (!open) return
    setName(editing?.name ?? '')
    setDescription(editing?.description ?? '')
    setNameError('')
  }, [open, editing])

  const pending = createMutation.isPending || updateMutation.isPending

  const submit = () => {
    if (!name.trim()) {
      const msg = t('expensesPage.required')
      setNameError(msg)
      notify.error(msg)
      return
    }
    const payload = {
      name: name.trim(),
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
        editing ? t('expensesPage.editType') : t('expensesPage.addType')
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
        <Input
          label={t('expensesPage.name')}
          required
          value={name}
          error={nameError}
          onChange={(e) => {
            setName(e.target.value)
            setNameError('')
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
