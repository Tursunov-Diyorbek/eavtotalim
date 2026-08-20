import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, DateInput, Modal, Notification, notify } from '@/components/ui'
import { useMoveTimetableMutation } from '@/features/groups'

type MoveTimetableModalProps = {
  open: boolean
  onClose: () => void
  groupId: string
}

/** Eski LessonSchedule — dars jadvalini sanadan sanaga ko‘chirish. */
export function MoveTimetableModal({
  open,
  onClose,
  groupId,
}: MoveTimetableModalProps) {
  const { t } = useTranslation()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const mutation = useMoveTimetableMutation()

  const onSave = () => {
    if (!fromDate || !toDate) return
    mutation.mutate(
      { groupId, fromDate, toDate },
      {
        onSuccess: () => {
          notify.success(t('common.saved'))
          setFromDate('')
          setToDate('')
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
      title={t('groupsPage.showPage.moveTimetable')}
      sizeClassName="max-w-lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!fromDate || !toDate}
            loading={mutation.isPending}
            onClick={onSave}
          >
            {t('groupsPage.showPage.moveTimetable')}
          </Button>
        </div>
      }
    >
      <Notification tone="warning" className="mb-3">
        {t('groupsPage.showPage.moveTimetableWarn')}
      </Notification>
      <div className="grid gap-3 sm:grid-cols-2">
        <DateInput
          label={t('groupsPage.showPage.fromDate')}
          name="from_date"
          value={fromDate}
          onChange={(event) => setFromDate(event.target.value)}
        />
        <DateInput
          label={t('groupsPage.showPage.toDate')}
          name="to_date"
          value={toDate}
          onChange={(event) => setToDate(event.target.value)}
        />
      </div>
    </Modal>
  )
}
