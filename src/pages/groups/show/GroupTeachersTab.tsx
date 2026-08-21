import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { KeyRound, Plus } from 'lucide-react'
import {
  Button,
  ConfirmDialog,
  DeleteButton,
  EmptyState,
  ErrorMessage,
  ExportButton,
  Panel,
  ShowButton,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { teacherPath } from '@/config'
import { useAuth } from '@/features/auth'
import { useGroupTeachersQuery, useUnmergeTeacherMutation } from '@/features/groups'
import { downloadXls } from '@/lib/downloadXls'
import { asText } from '@/lib/apiPage'
import { fullNameOf } from '@/lib/format'
import { StudentAccessModal } from '@/pages/students/StudentAccessModal'
import type { GroupTeacherRow } from '@/types/groups'
import { AddTeacherModal } from './AddTeacherModal'
import { TabToolbar } from './TabToolbar'

type GroupTeachersTabProps = {
  groupId: string
  canMutate: boolean
}

/** Eski `GroupTables/GroupTeachers` — o‘qituvchilar, biriktirish, parol, o‘chirish, EXPORT. */
export function GroupTeachersTab({ groupId, canMutate }: GroupTeachersTabProps) {
  const { t } = useTranslation()
  const { hasPermission, isSuperAdmin } = useAuth()
  const query = useGroupTeachersQuery(groupId)
  const unmergeMutation = useUnmergeTeacherMutation()
  const [addOpen, setAddOpen] = useState(false)
  const [accessTeacher, setAccessTeacher] = useState<GroupTeacherRow['teacher']>(null)
  const [removeTeacher, setRemoveTeacher] = useState<GroupTeacherRow['teacher']>(null)

  const canPassword = canMutate && (isSuperAdmin || hasPermission('show-user-password'))
  const rows = query.data ?? []
  const exportRows = useMemo(
    () =>
      rows.map((row, index) => [
        index + 1,
        asText(row.type_teacher_for_group?.name),
        fullNameOf(row.teacher) ?? '',
      ]),
    [rows],
  )

  const onRemove = () => {
    if (!removeTeacher?.id) return
    unmergeMutation.mutate(
      { groupId, teacherId: removeTeacher.id },
      {
        onSuccess: () => {
          notify.success(t('common.deleted'))
          setRemoveTeacher(null)
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  if (query.isLoading) {
    return (
      <Panel padding="md">
        <SkeletonLines lines={5} />
      </Panel>
    )
  }
  if (query.isError) return <ErrorMessage />

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <TabToolbar
        title={t('groupsPage.showPage.teachersTitle')}
        actions={
          <>
            <ExportButton
              disabled={!exportRows.length}
              onClick={() =>
                downloadXls(
                  'oqituvchilar',
                  [
                    '№',
                    t('groupsPage.showPage.teacherType'),
                    t('groupsPage.showPage.teacherFio'),
                  ],
                  exportRows,
                )
              }
            />
            {canMutate ? (
              <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="size-3.5" aria-hidden />
                {t('groupsPage.showPage.attachTeacher')}
              </Button>
            ) : null}
          </>
        }
      />
      <Table storageKey="group-show:teachers" className="min-w-150">
        <THead>
          <TR>
            <TH className="w-12 text-center">№</TH>
            <TH>{t('groupsPage.showPage.teacherFio')}</TH>
            <TH>{t('groupsPage.showPage.teacherType')}</TH>
            <TH className="w-32 text-center">{t('common.actions')}</TH>
          </TR>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <TR>
              <TD className="py-6 text-center" colSpan={4}>
                <EmptyState
                  className="border-0 py-4 shadow-none"
                  description={t('common.empty')}
                />
              </TD>
            </TR>
          ) : (
            rows.map((row, index) => {
              const teacher = row.teacher
              const teacherId = teacher?.id
              const name = fullNameOf(teacher) ?? '—'
              return (
                <TR key={teacherId ?? index}>
                  <TD className="text-center text-muted">{index + 1}</TD>
                  <TD>
                    {teacherId ? (
                      <Link
                        to={teacherPath(teacherId)}
                        className="font-semibold text-signal hover:underline"
                      >
                        {name}
                      </Link>
                    ) : (
                      name
                    )}
                  </TD>
                  <TD>{asText(row.type_teacher_for_group?.name)}</TD>
                  <TD>
                    <div className="flex justify-center gap-1">
                      {canPassword && teacher?.user_id ? (
                        <Button
                          variant="soft"
                          size="icon-sm"
                          aria-label={t('groupsPage.showPage.showCredentials')}
                          onClick={() => setAccessTeacher(teacher)}
                        >
                          <KeyRound className="size-3.5" />
                        </Button>
                      ) : null}
                      {teacherId ? (
                        <Link to={teacherPath(teacherId)}>
                          <ShowButton />
                        </Link>
                      ) : null}
                      {canMutate && teacherId ? (
                        <DeleteButton onClick={() => setRemoveTeacher(teacher)} />
                      ) : null}
                    </div>
                  </TD>
                </TR>
              )
            })
          )}
        </TBody>
      </Table>
      <AddTeacherModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        groupId={groupId}
      />
      <StudentAccessModal
        open={Boolean(accessTeacher)}
        onClose={() => setAccessTeacher(null)}
        student={
          accessTeacher
            ? {
                id: accessTeacher.id ?? 0,
                user_id: accessTeacher.user_id,
                last_name: accessTeacher.last_name,
                first_name: accessTeacher.first_name,
                middle_name: accessTeacher.middle_name,
              }
            : null
        }
      />
      <ConfirmDialog
        open={Boolean(removeTeacher)}
        onClose={() => setRemoveTeacher(null)}
        onConfirm={onRemove}
        title={t('groupsPage.showPage.removeTeacher')}
        loading={unmergeMutation.isPending}
      />
    </div>
  )
}
