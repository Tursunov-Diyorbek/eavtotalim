import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { KeyRound, Trash2 } from 'lucide-react'
import { assignGroupMentor, assignStudentMentor, queryKeys } from '@/api'
import { mentorDisplayName } from '@/api/mentor-students'
import {
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  EditButton,
  EmptyState,
  ErrorMessage,
  ExportButton,
  Modal,
  Panel,
  Select,
  ShowButton,
  SafeImage,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { PATH_PREFIX_FILE, studentEditPath, studentPath } from '@/config'
import { canAssignMentor } from '@/config/roles'
import { useAuth } from '@/features/auth'
import { useGroupCredentialsQuery, useGroupShowStudentsQuery } from '@/features/groups'
import { resolveFileUrl } from '@/features/lessons'
import { useActiveMentorsQuery } from '@/features/mentor-students'
import { studentAge } from '@/features/students'
import { useOpenedOnce } from '@/hooks'
import { asText } from '@/lib/apiPage'
import { downloadXls } from '@/lib/downloadXls'
import { formatDate } from '@/lib/format'
import { StudentAccessModal } from '@/pages/students/StudentAccessModal'
import type { GroupItem, GroupMentor, GroupStudentRow } from '@/types/groups'
import { DeleteStudentsModal } from './DeleteStudentsModal'

type GroupStudentsTabProps = {
  groupId: string
  group: GroupItem
}

function attendanceTone(percent: number) {
  if (percent < 70) return 'rose' as const
  if (percent < 90) return 'amber' as const
  return 'teal' as const
}

function fio(row: GroupStudentRow) {
  return [row.last_name, row.first_name, row.middle_name].filter(Boolean).join(' ') || '—'
}

function namedMentor(mentor: GroupMentor | null | undefined, mentorId?: number | null, fallback = '') {
  const id = mentor?.id ?? mentorId
  if (id == null) return null
  const name = mentorDisplayName(mentor) || fallback || String(id)
  return { id: Number(id), name }
}

type PendingMentor = {
  scope: 'group' | 'student'
  studentId?: number
  mentorId: number
  mentorName: string
}

/** Eski `GroupTables/StudentsTable` — guruh o‘quvchilari va login/parol ro‘yxati. */
export function GroupStudentsTab({ groupId, group }: GroupStudentsTabProps) {
  const { t, i18n } = useTranslation()
  const { user, hasPermission, hasRole, isSuperAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [credentialsMode, setCredentialsMode] = useState(false)
  const [mentorsEnabled, openMentors] = useOpenedOnce()
  const [pendingMentor, setPendingMentor] = useState<PendingMentor | null>(null)
  const [accessStudent, setAccessStudent] = useState<GroupStudentRow | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<{ src: string; title: string } | null>(
    null,
  )

  const studentsQuery = useGroupShowStudentsQuery(groupId)
  const credentialsQuery = useGroupCredentialsQuery(groupId, credentialsMode)

  const isTeacher = hasRole('teacher')
  const showMentorAssign = canAssignMentor(user)
  const mentorsQuery = useActiveMentorsQuery(showMentorAssign && mentorsEnabled)
  const canPassword = !isTeacher && (isSuperAdmin || hasPermission('show-user-password'))
  const canEdit =
    !isTeacher && Number(group.check_gai) !== 1 && hasPermission('update-student')
  const canRemove = !isTeacher
  const showPhoto = isSuperAdmin || hasRole('director')

  const rows = studentsQuery.data?.data ?? []
  const requiredHours = group.edu_type?.autodrome_hours ?? null
  const exportRows = useMemo(
    () =>
      rows.map((row, index) => {
        const stats = row.student_personal_attendance
        const percent = Number(stats?.average_attendance_percent)
        const autodromeHours = Number(stats?.autodrome_attendance_count ?? 0) * 2
        const today = row.today_monitoring_camera_attendance
        return [
          index + 1,
          fio(row),
          row.passport?.jshir ?? '',
          formatDate(row.birthday, i18n.language) ?? '',
          row.phone1 ? `+998${row.phone1}` : '',
          row.address ?? '',
          row.user?.last_seen ?? '',
          today?.attendance_time
            ? `${today.attendance_date ?? ''} ${today.attendance_time}`.trim()
            : '',
          Number.isFinite(percent) ? `${percent}%` : '',
          autodromeHours,
          requiredHours ?? '',
        ]
      }),
    [i18n.language, requiredHours, rows],
  )

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const selectedRows = useMemo(
    () => rows.filter((row) => selectedSet.has(row.id)),
    [rows, selectedSet],
  )
  const allSelected = rows.length > 0 && selectedRows.length === rows.length
  const someSelected = selectedRows.length > 0 && !allSelected
  const colCount = 10 + (showPhoto ? 1 : 0) + (canRemove ? 1 : 0) + (showMentorAssign ? 1 : 0)

  const groupMentor = namedMentor(group.mentor, group.mentor_id)
  const mentorOptions = useMemo(() => {
    const list = [...(mentorsQuery.data ?? [])]
    const extras = [
      groupMentor,
      ...rows.map((row) => namedMentor(row.mentor, row.mentor_id, row.mentor_name || '')),
    ]
    for (const extra of extras) {
      if (extra && !list.some((item) => item.id === extra.id)) list.unshift(extra)
    }
    return list.map((item) => ({ value: item.id, label: item.name }))
  }, [groupMentor, mentorsQuery.data, rows])

  const refreshMentors = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.groups.students(groupId) })
  }

  const assignMentor = useMutation({
    mutationFn: (pending: PendingMentor) =>
      pending.scope === 'group'
        ? assignGroupMentor(groupId, pending.mentorId)
        : assignStudentMentor(pending.studentId!, pending.mentorId),
    onSuccess: (res) => {
      notify.success(res.message || t('groupsPage.showPage.mentorAssigned'))
      setPendingMentor(null)
      refreshMentors()
    },
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  })

  const askMentor = (scope: PendingMentor['scope'], mentorId: number, studentId?: number) => {
    const student = rows.find((row) => row.id === studentId)
    const current =
      scope === 'group' ? groupMentor?.id : (student?.mentor?.id ?? student?.mentor_id)
    if (!mentorId || mentorId === Number(current)) return
    const name = mentorOptions.find((item) => Number(item.value) === mentorId)?.label
    setPendingMentor({
      scope,
      studentId,
      mentorId,
      mentorName: typeof name === 'string' ? name : String(name ?? mentorId),
    })
  }

  const toggleOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id]
      return prev.filter((item) => item !== id)
    })
  }

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? rows.map((row) => row.id) : [])
  }

  if (studentsQuery.isLoading) {
    return (
      <Panel padding="md">
        <SkeletonLines lines={8} />
      </Panel>
    )
  }
  if (studentsQuery.isError) return <ErrorMessage />

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {canRemove && selectedRows.length > 0 ? (
          <Badge tone="amber" className="px-2.5 py-1 text-xs font-semibold uppercase">
            {t('groupsPage.showPage.selected')}: {selectedRows.length}
          </Badge>
        ) : (
          <p className="text-sm text-muted">
            {t('groupsPage.showPage.studentsCount')}:{' '}
            <span className="font-semibold text-deep">
              {group.students_count ?? group.grouped_students_count ?? rows.length}
            </span>{' '}
            {t('groupsPage.pcs')}
          </p>
        )}
        <div className="flex flex-wrap items-end gap-2">
          {showMentorAssign ? (
            <Select
              size="sm"
              searchable
              value={groupMentor ? String(groupMentor.id) : ''}
              placeholder={t('groupsPage.showPage.assignGroupMentor')}
              options={mentorOptions}
              loading={mentorsQuery.isFetching && mentorOptions.length === 0}
              disabled={assignMentor.isPending}
              triggerClassName="min-w-56"
              onOpen={openMentors}
              onChange={(event) => askMentor('group', Number(event.target.value))}
            />
          ) : null}
          <ExportButton
            disabled={!exportRows.length}
            onClick={() =>
              downloadXls(
                'oquvchilar',
                [
                  '№',
                  t('directorList.fio'),
                  t('groupsPage.showPage.jshir'),
                  t('groupsPage.showPage.birthday'),
                  t('groupsPage.showPage.phone'),
                  t('groupsPage.showPage.address'),
                  t('groupsPage.showPage.lastSeen'),
                  t('groupsPage.showPage.todayArrived'),
                  t('groupsPage.colAttendance'),
                  t('groupsPage.showPage.autodromeHours'),
                  t('groupsPage.showPage.requiredAutodromeHours'),
                ],
                exportRows,
              )
            }
          />
          {!isTeacher ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCredentialsMode((prev) => !prev)}
            >
              <KeyRound className="size-3.5" aria-hidden />
              {credentialsMode
                ? t('groupsPage.showPage.hideCredentials')
                : t('groupsPage.showPage.showCredentials')}
            </Button>
          ) : null}
          {canRemove && selectedRows.length > 0 && !credentialsMode ? (
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-3.5" aria-hidden />
              {t('common.delete')} ({selectedRows.length})
            </Button>
          ) : null}
        </div>
      </div>

      {credentialsMode ? (
        credentialsQuery.isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={6} />
          </Panel>
        ) : credentialsQuery.isError ? (
          <ErrorMessage />
        ) : (
          <Table storageKey="group-show:credentials" className="min-w-150">
            <THead>
              <TR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('directorList.fio')}</TH>
                <TH>{t('login.login')}</TH>
                <TH>{t('login.password')}</TH>
              </TR>
            </THead>
            <TBody>
              {(credentialsQuery.data ?? []).length === 0 ? (
                <TR>
                  <TD className="py-6 text-center" colSpan={4}>
                    <EmptyState
                      className="border-0 py-4 shadow-none"
                      description={t('common.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                (credentialsQuery.data ?? []).map((row, index) => (
                  <TR key={`${row.username ?? index}`}>
                    <TD className="text-center text-muted">{index + 1}</TD>
                    <TD>{asText(row.student)}</TD>
                    <TD className="font-semibold text-signal">{asText(row.username)}</TD>
                    <TD className="font-semibold text-signal">{asText(row.password)}</TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        )
      ) : (
        <Table storageKey="group-show:students" className="min-w-320">
          <THead>
            <TR>
              {canRemove ? (
                <TH
                  className="w-10 text-center"
                  columnLabel={t('groupsPage.showPage.selectAll')}
                >
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    aria-label={t('groupsPage.showPage.selectAll')}
                    onChange={toggleAll}
                  />
                </TH>
              ) : null}
              <TH className="w-12 text-center">№</TH>
              {showPhoto ? (
                <TH className="w-16 text-center">{t('groupsPage.showPage.photo')}</TH>
              ) : null}
              <TH className="min-w-56">{t('directorList.fio')}</TH>
              <TH className="min-w-52">{t('groupsPage.showPage.personalInfo')}</TH>
              <TH className="min-w-52">{t('groupsPage.showPage.contactInfo')}</TH>
              <TH className="min-w-40">{t('groupsPage.showPage.lastSeen')}</TH>
              <TH className="min-w-32">{t('groupsPage.showPage.todayArrived')}</TH>
              <TH className="w-28 text-center">{t('groupsPage.colAttendance')}</TH>
              <TH className="w-28 text-center">
                {t('groupsPage.showPage.autodromeHours')}
              </TH>
              <TH className="w-28 text-center">
                {t('groupsPage.showPage.requiredAutodromeHours')}
              </TH>
              {showMentorAssign ? (
                <TH className="min-w-48">{t('groupsPage.showPage.mentor')}</TH>
              ) : null}
              <TH className="w-32 text-center">{t('common.actions')}</TH>
            </TR>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <TR>
                <TD className="py-6 text-center" colSpan={colCount}>
                  <EmptyState
                    className="border-0 py-4 shadow-none"
                    description={t('common.empty')}
                  />
                </TD>
              </TR>
            ) : (
              rows.map((row, index) => {
                const stats = row.student_personal_attendance
                const percent = Number(stats?.average_attendance_percent)
                const autodromeHours = Number(stats?.autodrome_attendance_count ?? 0) * 2
                const age = studentAge(row.birthday)
                const image = resolveFileUrl(row.image, PATH_PREFIX_FILE)
                const today = row.today_monitoring_camera_attendance

                return (
                  <TR
                    key={row.id}
                    className={selectedSet.has(row.id) ? 'bg-amber-soft/50' : undefined}
                  >
                    {canRemove ? (
                      <TD className="text-center">
                        <Checkbox
                          checked={selectedSet.has(row.id)}
                          aria-label={fio(row)}
                          onChange={(checked) => toggleOne(row.id, checked)}
                        />
                      </TD>
                    ) : null}
                    <TD className="text-center text-muted">{index + 1}</TD>
                    {showPhoto ? (
                      <TD>
                        <button
                          type="button"
                          disabled={!image}
                          aria-label={image ? fio(row) : undefined}
                          onClick={() => {
                            if (image) setPhotoPreview({ src: image, title: fio(row) })
                          }}
                          className={
                            image
                              ? 'mx-auto block cursor-pointer rounded-lg outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-signal/40'
                              : 'mx-auto block cursor-default'
                          }
                        >
                          <SafeImage
                            src={image}
                            alt={fio(row)}
                            size="sm"
                            className="size-10 rounded-lg ring-1 ring-mist/70"
                          />
                        </button>
                      </TD>
                    ) : null}
                    <TD>
                      <Link
                        to={studentPath(row.id)}
                        className="font-semibold text-signal hover:underline"
                      >
                        {fio(row)}
                      </Link>
                    </TD>
                    <TD className="text-xs">
                      <p>
                        <span className="text-muted">
                          {t('groupsPage.showPage.jshir')}:{' '}
                        </span>
                        {row.passport?.jshir || t('groupsPage.showPage.notIncluded')}
                      </p>
                      <p className="mt-1">
                        <span className="text-muted">
                          {t('groupsPage.showPage.birthday')}:{' '}
                        </span>
                        {formatDate(row.birthday, i18n.language) ??
                          t('groupsPage.showPage.notIncluded')}
                        {age != null ? ` / ${age} ${t('groupsPage.showPage.years')}` : ''}
                      </p>
                    </TD>
                    <TD className="text-xs">
                      <p>
                        <span className="text-muted">
                          {t('groupsPage.showPage.phone')}:{' '}
                        </span>
                        {row.phone1 ? (
                          `+998${row.phone1}`
                        ) : (
                          <Badge tone="rose">
                            {t('groupsPage.showPage.notIncluded')}
                          </Badge>
                        )}
                      </p>
                      <p className="mt-1">
                        <span className="text-muted">
                          {t('groupsPage.showPage.address')}:{' '}
                        </span>
                        {row.address ||
                          [row.constant_region?.name, row.constant_area?.name]
                            .filter(Boolean)
                            .join(', ') ||
                          t('groupsPage.showPage.notIncluded')}
                      </p>
                    </TD>
                    <TD className="text-xs">
                      {row.user?.last_seen || (
                        <span className="text-rose">
                          {t('groupsPage.showPage.notLoggedIn')}
                        </span>
                      )}
                    </TD>
                    <TD className="text-xs">
                      {today?.attendance_time
                        ? `${today.attendance_date ?? ''} ${today.attendance_time}`.trim()
                        : '—'}
                    </TD>
                    <TD className="text-center">
                      {Number.isFinite(percent) ? (
                        <Badge tone={attendanceTone(percent)}>{percent}%</Badge>
                      ) : (
                        <span className="text-xs text-muted">
                          {t('groupsPage.showPage.attendanceMissing')}
                        </span>
                      )}
                    </TD>
                    <TD className="text-center">
                      <Badge tone={autodromeHours ? 'indigo' : 'neutral'}>
                        {autodromeHours} {t('groupsPage.showPage.hours')}
                      </Badge>
                    </TD>
                    <TD className="text-center">
                      <Badge tone={requiredHours ? 'violet' : 'neutral'}>
                        {requiredHours ?? '—'} {t('groupsPage.showPage.hours')}
                      </Badge>
                    </TD>
                    {showMentorAssign ? (
                      <TD>
                        <Select
                          size="sm"
                          searchable
                          value={
                            row.mentor?.id != null || row.mentor_id != null
                              ? String(row.mentor?.id ?? row.mentor_id)
                              : ''
                          }
                          placeholder={t('groupsPage.showPage.selectMentor')}
                          options={mentorOptions}
                          loading={mentorsQuery.isFetching && mentorOptions.length === 0}
                          disabled={assignMentor.isPending}
                          triggerClassName="min-w-44"
                          onOpen={openMentors}
                          onChange={(event) =>
                            askMentor('student', Number(event.target.value), row.id)
                          }
                        />
                      </TD>
                    ) : null}
                    <TD>
                      <div className="flex justify-center gap-1">
                        {canPassword ? (
                          <Button
                            variant="soft"
                            size="icon-sm"
                            aria-label={t('login.showPassword')}
                            onClick={() => setAccessStudent(row)}
                          >
                            <KeyRound className="size-3.5" />
                          </Button>
                        ) : null}
                        <Link to={studentPath(row.id)}>
                          <ShowButton />
                        </Link>
                        {canEdit ? (
                          <Link to={studentEditPath(row.id)}>
                            <EditButton />
                          </Link>
                        ) : null}
                      </div>
                    </TD>
                  </TR>
                )
              })
            )}
          </TBody>
        </Table>
      )}

      <ConfirmDialog
        open={Boolean(pendingMentor)}
        title={
          pendingMentor?.scope === 'group'
            ? t('groupsPage.showPage.assignGroupMentor')
            : t('groupsPage.showPage.selectMentor')
        }
        description={pendingMentor?.mentorName}
        confirmLabel={t('dashboard.yes')}
        loading={assignMentor.isPending}
        onClose={() => {
          if (!assignMentor.isPending) setPendingMentor(null)
        }}
        onConfirm={() => {
          if (pendingMentor) assignMentor.mutate(pendingMentor)
        }}
      />
      <DeleteStudentsModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        groupId={groupId}
        students={selectedRows}
        onRemoveFromSelection={(id) => toggleOne(id, false)}
        onDeleted={() => {
          setSelectedIds([])
          setDeleteOpen(false)
        }}
      />
      <StudentAccessModal
        open={Boolean(accessStudent)}
        onClose={() => setAccessStudent(null)}
        student={accessStudent}
      />
      <Modal
        open={Boolean(photoPreview)}
        onClose={() => setPhotoPreview(null)}
        title={photoPreview?.title}
        sizeClassName="max-w-lg"
        bodyClassName="p-3 sm:p-4"
      >
        {photoPreview ? (
          <SafeImage
            src={photoPreview.src}
            alt={photoPreview.title}
            size="xl"
            fit="contain"
            className="mx-auto h-[min(70svh,640px)] w-full rounded-xl bg-fog"
          />
        ) : null}
      </Modal>
    </div>
  )
}
