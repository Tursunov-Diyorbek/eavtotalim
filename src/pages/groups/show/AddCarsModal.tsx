import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  EmptyState,
  Modal,
  Notification,
  SkeletonLines,
  notify,
} from '@/components/ui'
import { useAuth } from '@/features/auth'
import { useAttachCarsMutation, useAvailableGroupCarsQuery } from '@/features/groups'
import { asText } from '@/lib/apiPage'
import type { GroupItem } from '@/types/groups'
import { CarPickTable } from './CarPickTable'

type AddCarsModalProps = {
  open: boolean
  onClose: () => void
  groupId: string
  group: GroupItem
}

/** Eski AddCarModal — guruhga avtomobil biriktirish. */
export function AddCarsModal({ open, onClose, groupId, group }: AddCarsModalProps) {
  const { t } = useTranslation()
  const { isSuperAdmin } = useAuth()
  const [selected, setSelected] = useState<number[]>([])
  const [page, setPage] = useState(1)
  const query = useAvailableGroupCarsQuery(groupId, open)
  const mutation = useAttachCarsMutation()
  const rows = query.data ?? []
  const category = asText(group.car_category_edu_type_access) || asText(group.edu_type?.short_name)

  const onSave = () => {
    if (!selected.length) return
    mutation.mutate(
      { groupId, carIds: selected },
      {
        onSuccess: () => {
          notify.success(t('common.saved'))
          setSelected([])
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
      title={`${t('groupsPage.showPage.attachCarWindow')} (${t('groupsPage.showPage.eduCategory')}: ${category})`}
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
            disabled={!selected.length}
            loading={mutation.isPending}
            onClick={onSave}
          >
            {t('groupsPage.showPage.attachSelectedCar')}
          </Button>
        </div>
      }
    >
      <Notification tone="warning" className="mb-3">
        <p className="font-semibold">{t('groupsPage.showPage.carPickRulesTitle')}</p>
        <ul className="mt-1 list-disc pl-4">
          <li>{t('groupsPage.showPage.carPickRule1')}</li>
          <li>{t('groupsPage.showPage.carPickRule2')}</li>
          <li>{t('groupsPage.showPage.carPickRule3')}</li>
          <li>{t('groupsPage.showPage.carPickRule4')}</li>
          <li>{t('groupsPage.showPage.carPickRule5')}</li>
        </ul>
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
          mode="checkbox"
          selectedIds={selected}
          onToggle={(id, checked) =>
            setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
          }
        />
      )}
    </Modal>
  )
}
