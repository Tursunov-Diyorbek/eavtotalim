import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, RefreshCw, Trash2 } from 'lucide-react'
import {
  deleteExtraLesson,
  queryKeys,
  syncStudentCameraAttendance,
  toggleExtraLessonAttendance,
} from '@/api'
import {
  Badge,
  Button,
  ConfirmDialog,
  DateInput,
  EmptyTR,
  ErrorMessage,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { useAuth } from '@/features/auth'
import { useStudentClassDatesQuery } from '@/features/students'
import { formatDate } from '@/lib/format'
import type { StudentGroup, StudentItem } from '@/types/student'
import { ExtraLessonCreateModal } from './ExtraLessonCreateModal'

export function ExtraLessonsPanel({
  studentId,
  student,
  group,
}: {
  studentId: string
  student: StudentItem
  group: StudentGroup | null
}) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { user, isSuperAdmin } = useAuth()
  const canToggle = isSuperAdmin || Boolean(user?.username?.includes('intalim_superadmin_operator'))
  const canAdd = Number(student.edu_status) === 2
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | string | null>(null)
  const query = useStudentClassDatesQuery(studentId, fromDate || undefined, toDate || undefined, true)
  const rows = query.data?.data ?? []

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: [...queryKeys.students.all, 'class-dates', studentId],
    })
  }

  const sync = useMutation({
    mutationFn: () => syncStudentCameraAttendance(studentId),
    onSuccess: (res) => {
      notify.success(res.message || t('students.showPage.syncAttendanceOk'))
      invalidate()
    },
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  })

  const toggle = useMutation({
    mutationFn: (id: number | string) => toggleExtraLessonAttendance(id),
    onSuccess: () => invalidate(),
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  })

  const remove = useMutation({
    mutationFn: (id: number | string) => deleteExtraLesson(id),
    onSuccess: () => {
      notify.success(t('common.deleted'))
      setDeleteId(null)
      invalidate()
    },
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  })

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold tracking-wide text-deep uppercase">
              {t('students.showPage.tabExtra')}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-signal!"
              loading={sync.isPending}
              onClick={() => sync.mutate()}
            >
              <RefreshCw className="size-3.5" aria-hidden />
              {t('students.showPage.resyncAttendance')}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-lg bg-fog px-2 py-1 text-xs font-medium text-deep">
              {t('students.showPage.fromDate')}:{' '}
              {formatDate(query.data?.from_date, i18n.language) ?? '—'}
            </span>
            <span className="rounded-lg bg-fog px-2 py-1 text-xs font-medium text-deep">
              {t('students.showPage.toDate')}:{' '}
              {formatDate(query.data?.to_date, i18n.language) ?? '—'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-40">
            <DateInput
              label={t('students.showPage.fromDate')}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="w-40">
            <DateInput
              label={t('students.showPage.toDate')}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          {canAdd ? (
            <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-3.5" aria-hidden />
              {t('common.add')}
            </Button>
          ) : null}
        </div>
      </div>

      {query.isLoading ? (
        <SkeletonLines lines={3} />
      ) : query.isError ? (
        <ErrorMessage className="!py-3" />
      ) : (
        <Table storageKey="student-show-extra" fill={false}>
          <THead>
            <TR>
              <TH className="w-10 px-2! py-1! text-center">№</TH>
              <TH className="px-2! py-1!">{t('students.showPage.date')}</TH>
              <TH className="px-2! py-1!">{t('students.showPage.time')}</TH>
              <TH className="px-2! py-1!">{t('students.showPage.note')}</TH>
              <TH className="px-2! py-1!">{t('students.showPage.attendanceCol')}</TH>
              <TH className="w-16 px-2! py-1!">{t('common.actions')}</TH>
            </TR>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <EmptyTR colSpan={6} plain description={t('common.empty')} />
            ) : (
              rows.map((row, index) => (
                <TR key={row.id ?? index}>
                  <TD className="px-2! py-1! text-center">{index + 1}</TD>
                  <TD className="px-2! py-1!">
                    {formatDate(row.lesson_date, i18n.language) ?? row.lesson_date ?? '—'}
                  </TD>
                  <TD className="px-2! py-1!">
                    {(row.start_time || '—').toString().slice(0, 5)} —{' '}
                    {(row.end_time || '—').toString().slice(0, 5)}
                  </TD>
                  <TD className="max-w-70 truncate px-2! py-1!">{row.note || '—'}</TD>
                  <TD className="px-2! py-1!">
                    {canToggle && row.id != null ? (
                      <Button
                        size="sm"
                        variant={row.is_attendance ? 'primary' : 'danger'}
                        loading={toggle.isPending}
                        onClick={() => toggle.mutate(row.id!)}
                      >
                        {row.is_attendance
                          ? t('students.showPage.attended')
                          : t('students.showPage.notAttended')}
                      </Button>
                    ) : (
                      <Badge tone={row.is_attendance ? 'teal' : 'rose'}>
                        {row.is_attendance
                          ? t('students.showPage.attended')
                          : t('students.showPage.notAttended')}
                      </Badge>
                    )}
                  </TD>
                  <TD className="px-2! py-1!">
                    {row.id != null ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t('common.delete')}
                        onClick={() => setDeleteId(row.id!)}
                      >
                        <Trash2 className="size-3.5 text-rose" />
                      </Button>
                    ) : (
                      '—'
                    )}
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      )}

      <ExtraLessonCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        studentId={studentId}
        groupId={group?.id ?? student.group?.id}
        onSaved={invalidate}
      />
      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId != null && remove.mutate(deleteId)}
        loading={remove.isPending}
        title={t('common.delete')}
      />
    </div>
  )
}
