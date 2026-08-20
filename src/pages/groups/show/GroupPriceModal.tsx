import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { queryKeys } from '@/api'
import { Button, Input, Modal, notify } from '@/components/ui'
import { useUpdateGroupMutation } from '@/features/groups'

type GroupPriceModalProps = {
  open: boolean
  onClose: () => void
  groupId: string
  price: number | string | null | undefined
}

/** Eski `UpdateGroupEduPriceModalV2` — guruh ta'lim narxini o‘zgartirish. */
export function GroupPriceModal({ open, onClose, groupId, price }: GroupPriceModalProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const mutation = useUpdateGroupMutation(groupId)
  const [value, setValue] = useState('')
  const [wasOpen, setWasOpen] = useState(open)

  // Modal ochilganda joriy narxni qayta yuklaymiz (render paytida moslash).
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setValue(price == null ? '' : String(price))
  }

  const onSave = () => {
    mutation.mutate(
      { education_price: value },
      {
        onSuccess: () => {
          notify.success(t('common.saved'))
          void queryClient.invalidateQueries({
            queryKey: queryKeys.groups.detail(groupId),
          })
          onClose()
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('groupsPage.showPage.changePrice')}
      sizeClassName="max-w-md"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" size="md" className="flex-1" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            loading={mutation.isPending}
            onClick={onSave}
          >
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <Input
        label={t('groupsPage.colPrice')}
        name="education_price"
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </Modal>
  )
}
