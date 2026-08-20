import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Checkbox, EmptyState, Modal, SearchInput, SkeletonLines, notify } from '@/components/ui'
import { routes } from '@/config'
import {
  useAddStudentsToGroupMutation,
  useGroupUngroupedStudentsQuery,
} from '@/features/groups'
import { asFio } from '@/lib/apiPage'
import { formatDate } from '@/lib/format'
import { studentAge } from '@/features/students'

type AddStudentsModalProps = {
  open: boolean
  onClose: () => void
  groupId: string
  currentCount: number
  canBypassLimit: boolean
}

/** Eski addStudentsModal — guruhga o‘quvchi biriktirish. */
export function AddStudentsModal({
  open,
  onClose,
  groupId,
  currentCount,
  canBypassLimit,
}: AddStudentsModalProps) {
  const { t, i18n } = useTranslation()
  const [selected, setSelected] = useState<number[]>([])
  const [search, setSearch] = useState('')
  const query = useGroupUngroupedStudentsQuery(groupId, open)
  const mutation = useAddStudentsToGroupMutation()

  const rows = (query.data ?? []).filter((row) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return asFio(row).toLowerCase().includes(q)
  })

  const overLimit = !canBypassLimit && currentCount + selected.length > 24

  const toggle = (id: number, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
  }

  const onSave = () => {
    if (!selected.length || overLimit) return
    mutation.mutate(
      { groupId, studentIds: selected },
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
      title={t('groupsPage.showPage.ungroupedList')}
      sizeClassName="max-w-3xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selected.length || overLimit}
            loading={mutation.isPending}
            onClick={onSave}
          >
            {t('common.save')} ({selected.length})
          </Button>
        </div>
      }
    >
      {overLimit ? (
        <p className="mb-3 text-sm font-semibold text-rose">
          {t('groupsPage.showPage.maxStudents')}
        </p>
      ) : null}
      <SearchInput
        placeholder={t('groupsPage.showPage.searchStudent')}
        debounceMs={0}
        defaultValue={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mb-3"
      />
      {query.isLoading ? (
        <SkeletonLines lines={6} />
      ) : rows.length === 0 ? (
        <EmptyState
          description={t('common.empty')}
          action={
            <Link to={routes.studentAdd}>
              <Button variant="primary" size="sm">
                {t('groupsPage.showPage.addNewStudent')}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-fog text-xs text-muted">
              <tr>
                <th className="w-10 px-2 py-2" />
                <th className="w-10 px-2 py-2">№</th>
                <th className="px-2 py-2">{t('directorList.fio')}</th>
                <th className="px-2 py-2">{t('groupsPage.showPage.birthday')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const age = studentAge(row.birthday)
                return (
                  <tr key={row.id} className="border-t border-mist/60">
                    <td className="px-2 py-2">
                      <Checkbox
                        checked={selected.includes(row.id)}
                        onChange={(checked) => toggle(row.id, checked)}
                      />
                    </td>
                    <td className="px-2 py-2 text-muted">{index + 1}</td>
                    <td className="px-2 py-2 font-medium">{asFio(row)}</td>
                    <td className="px-2 py-2 text-xs">
                      {formatDate(row.birthday, i18n.language) ?? '—'}
                      {age != null ? ` / ${age}` : ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}
