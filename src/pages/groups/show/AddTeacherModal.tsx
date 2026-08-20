import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Modal, Select, notify } from '@/components/ui'
import {
  useAddTeacherToGroupMutation,
  useGroupTeacherTypesQuery,
  useMergeTeachersQuery,
} from '@/features/groups'
import { fullNameOf } from '@/lib/format'
import type { GroupTeacherType } from '@/types/groups'

type AddTeacherModalProps = {
  open: boolean
  onClose: () => void
  groupId: string
}

/** Eski AddTeacherModal — guruhga o‘qituvchi biriktirish. */
export function AddTeacherModal({ open, onClose, groupId }: AddTeacherModalProps) {
  const { t } = useTranslation()
  const [typeId, setTypeId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const typesQuery = useGroupTeacherTypesQuery(groupId, open)
  const teachersQuery = useMergeTeachersQuery(open)
  const mutation = useAddTeacherToGroupMutation()

  const onSave = () => {
    if (!typeId || !teacherId) return
    mutation.mutate(
      { groupId, teacherId: Number(teacherId), typeId: Number(typeId) },
      {
        onSuccess: () => {
          notify.success(t('common.saved'))
          setTypeId('')
          setTeacherId('')
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
      title={t('groupsPage.showPage.attachTeacher')}
      sizeClassName="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!typeId || !teacherId}
            loading={mutation.isPending}
            onClick={onSave}
          >
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <Select
          label={t('groupsPage.showPage.teacherType')}
          options={(typesQuery.data ?? [])
            .filter((row): row is GroupTeacherType & { id: number } => row.id != null)
            .map((row) => ({
              value: row.id,
              label: row.name || String(row.id),
            }))}
          value={typeId}
          onChange={(event) => setTypeId(event.target.value)}
        />
        <Select
          label={t('groupsPage.showPage.teacherFio')}
          options={(teachersQuery.data ?? []).map((row) => ({
            value: row.id,
            label: fullNameOf(row) || String(row.id),
          }))}
          value={teacherId}
          onChange={(event) => setTeacherId(event.target.value)}
        />
      </div>
    </Modal>
  )
}
