import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  EmptyState,
  Modal,
  Notification,
  SkeletonLines,
  Textarea,
  notify,
} from '@/components/ui'
import { useAuth } from '@/features/auth'
import { useAvailableGroupCarsQuery, useReplaceGroupCarMutation } from '@/features/groups'
import { asText } from '@/lib/apiPage'
import type { GroupCarRow, GroupItem } from '@/types/groups'
import { CarPickTable } from './CarPickTable'

type ReplaceCarModalProps = {
  open: boolean
  onClose: () => void
  groupId: string
  group: GroupItem
  oldCar: GroupCarRow | null
}

/** Eski ReplaceCarModal — guruhdagi mashinani almashtirish. */
export function ReplaceCarModal({
  open,
  onClose,
  groupId,
  group,
  oldCar,
}: ReplaceCarModalProps) {
  const { t } = useTranslation()
  const { isSuperAdmin } = useAuth()
  const [newCarId, setNewCarId] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [page, setPage] = useState(1)
  const query = useAvailableGroupCarsQuery(groupId, open)
  const mutation = useReplaceGroupCarMutation()
  const rows = (query.data ?? []).filter((row) => row.id !== oldCar?.id)
  const category = asText(group.car_category_edu_type_access) || asText(group.edu_type?.short_name)

  const onSave = () => {
    if (!oldCar || !newCarId) return
    mutation.mutate(
      { groupId, oldCarId: oldCar.id, newCarId, reason },
      {
        onSuccess: () => {
          notify.success(t('common.saved'))
          setNewCarId(null)
          setReason('')
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
      title={`${t('groupsPage.showPage.replaceCarWindow')} (${t('groupsPage.showPage.eduCategory')}: ${category})`}
      sizeClassName="max-w-6xl"
      maxHeightClassName="max-h-[min(92svh,900px)]"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="danger" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!newCarId}
            loading={mutation.isPending}
            onClick={onSave}
          >
            {t('groupsPage.showPage.replaceCar')}
          </Button>
        </div>
      }
    >
      <Notification tone="info" className="mb-3">
        <p>
          {t('groupsPage.showPage.replacingCar')}: {asText(oldCar?.name)} — {asText(oldCar?.number)}
        </p>
        <p className="mt-1">{t('groupsPage.showPage.replaceCarHint')}</p>
      </Notification>
      {query.isLoading ? (
        <SkeletonLines lines={6} />
      ) : rows.length === 0 ? (
        <EmptyState description={t('common.empty')} />
      ) : (
        <CarPickTable
          rows={rows}
          group={group}
          bypass={isSuperAdmin}
          page={page}
          onPageChange={setPage}
          mode="radio"
          selectedIds={newCarId ? [newCarId] : []}
          onToggle={(id) => setNewCarId(id)}
        />
      )}
      <div className="mt-3">
        <Textarea
          label={t('groupsPage.showPage.replaceReasonOptional')}
          name="reason"
          value={reason}
          placeholder={t('groupsPage.showPage.replaceReasonHint')}
          onChange={(event) => setReason(event.target.value)}
        />
      </div>
    </Modal>
  )
}
