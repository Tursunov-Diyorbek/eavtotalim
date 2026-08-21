import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { KeyRound, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  Checkbox,
  EditButton,
  EmptyState,
  ErrorMessage,
  ExportButton,
  Panel,
  ShowButton,
  SafeImage,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { PATH_PREFIX_FILE, studentEditPath, studentPath } from '@/config'
import { useAuth } from '@/features/auth'
import { useGroupCredentialsQuery, useGroupShowStudentsQuery } from '@/features/groups'
import { resolveFileUrl } from '@/features/lessons'
import { studentAge } from '@/features/students'
import { asText } from '@/lib/apiPage'
import { downloadXls } from '@/lib/downloadXls'
import { formatDate } from '@/lib/format'
import { StudentAccessModal } from '@/pages/students/StudentAccessModal'
import type { GroupItem, GroupStudentRow } from '@/types/groups'
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

/** Eski `GroupTables/StudentsTable` — guruh o‘quvchilari va login/parol ro‘yxati. */
export function GroupStudentsTab({ groupId, group }: GroupStudentsTabProps) {
  const { t, i18n } = useTranslation()
  const { hasPermission, hasRole, isSuperAdmin } = useAuth()
  const [credentialsMode, setCredentialsMode] = useState(false)
  const [accessStudent, setAccessStudent] = useState<GroupStudentRow | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [deleteOpen, setDeleteOpen] = useState(false)

  const studentsQuery = useGroupShowStudentsQuery(groupId)
  const credentialsQuery = useGroupCredentialsQuery(groupId, credentialsMode)

  const isTeacher = hasRole('teacher')
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
  const colCount = 10 + (showPhoto ? 1 : 0) + (canRemove ? 1 : 0)

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
        <div className="flex flex-wrap items-center gap-2">
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
                        <SafeImage
                          src={image}
                          size="sm"
                          className="mx-auto size-10 rounded-lg ring-1 ring-mist/70"
                        />
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
    </div>
  )
}
