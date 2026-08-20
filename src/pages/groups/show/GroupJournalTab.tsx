import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  FileSignature,
  HelpCircle,
  Info,
  Pencil,
  RefreshCw,
  UserCheck,
  UserX,
  X,
} from 'lucide-react'
import {
  Button,
  DateInput,
  EmptyState,
  ErrorMessage,
  Modal,
  Notification,
  Panel,
  SkeletonLines,
  Tabs,
  Textarea,
  notify,
} from '@/components/ui'
import { PATH_PREFIX_FILE, studentPath } from '@/config'
import {
  useEditGroupMonitoringMutation,
  useGroupMonitoringQuery,
  useRefreshGroupDayAttendanceMutation,
  useStoreStudentAbsenceReasonMutation,
} from '@/features/groups'
import { resolveFileUrl } from '@/features/lessons'
import { fullNameOf } from '@/lib/format'
import { cn } from '@/lib/cn'
import type {
  GroupMonitoringDay,
  GroupMonitoringMark,
  GroupMonitoringStudent,
  GroupMonitoringTodayStudent,
} from '@/types/groups'

type Mode = 'davomat' | 'baholash'
type AttendanceValue = '' | '-' | '*'
type EditingCell = { studentId: number; dayId: number }

function isoDay(value?: string | null) {
  if (!value) return ''
  return value.slice(0, 10)
}

function shortDate(iso?: string | null) {
  if (!iso) return ''
  const date = new Date(iso.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return iso
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yy = String(date.getFullYear()).slice(-2)
  return `${dd}.${mm}.${yy}`
}

function todayIso() {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `${now.getFullYear()}-${mm}-${dd}`
}

function markKind(mark: GroupMonitoringMark | undefined) {
  const type = Number(mark?.type)
  const value = String(mark?.value ?? '')
  if (type === 1) return 'grade' as const
  if (type === 2 && (value === '-' || value === '+')) return 'absent' as const
  if (type === 3 && value === '*') return 'excused' as const
  return 'present' as const
}

function attendanceValue(mark: GroupMonitoringMark | undefined): AttendanceValue {
  const kind = markKind(mark)
  if (kind === 'absent') return '-'
  if (kind === 'excused') return '*'
  return ''
}

function dayCounts(students: GroupMonitoringStudent[], day: GroupMonitoringDay) {
  let present = 0
  let absent = 0
  let excused = 0
  students.forEach((student) => {
    const kind = markKind(student.mark_monitoring?.[String(day.id)])
    if (kind === 'absent') absent += 1
    else if (kind === 'excused') excused += 1
    else present += 1
  })
  return { present, absent, excused }
}

function todayRow(
  todays: GroupMonitoringTodayStudent[] | null | undefined,
  studentId: number,
) {
  return todays?.find((row) => Number(row.student_id) === studentId) ?? null
}

function attendancePhoto(path?: string | null) {
  return resolveFileUrl(path, PATH_PREFIX_FILE)
}

function AttendanceIcon({ kind }: { kind: ReturnType<typeof markKind> }) {
  if (kind === 'absent') return <UserX className="size-4 text-rose" aria-hidden />
  if (kind === 'excused') return <FileSignature className="size-4 text-amber" aria-hidden />
  return <UserCheck className="size-4 text-teal" aria-hidden />
}

/** Eski `ElectronNotebook` — davomat / baholash, tahrir, sababli qilish. */
export function GroupJournalTab({
  groupId,
  canMutate,
}: {
  groupId: string
  canMutate: boolean
}) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('davomat')
  const [editing, setEditing] = useState<EditingCell | null>(null)
  const [gradeDraft, setGradeDraft] = useState('')
  const [commentOpen, setCommentOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [pendingSave, setPendingSave] = useState<{
    studentId: number
    dayId: number
    type: number
    value: string
    previous: string
  } | null>(null)
  const [excuseOpen, setExcuseOpen] = useState(false)
  const [excuseStudent, setExcuseStudent] = useState<GroupMonitoringStudent | null>(null)
  const [excuseFrom, setExcuseFrom] = useState('')
  const [excuseTo, setExcuseTo] = useState('')
  const [excuseReason, setExcuseReason] = useState('')
  const [excuseFile, setExcuseFile] = useState<File | null>(null)
  const [faceId, setFaceId] = useState<GroupMonitoringTodayStudent | null>(null)
  const todayColRef = useRef<HTMLTableCellElement | null>(null)

  const query = useGroupMonitoringQuery(groupId)
  const editMutation = useEditGroupMonitoringMutation()
  const refreshDayMutation = useRefreshGroupDayAttendanceMutation()
  const excuseMutation = useStoreStudentAbsenceReasonMutation()

  const students = query.data?.students ?? []
  const today = todayIso()
  const todayStudents = query.data?.todays_attendances?.students ?? []
  const todayPresent = new Set(
    todayStudents.map((row) => Number(row.student_id)).filter((id) => Number.isFinite(id)),
  )
  const days = useMemo(() => {
    const list = [...(query.data?.data ?? [])]
    list.sort((a, b) => String(b.start_time ?? '').localeCompare(String(a.start_time ?? '')))
    return list
  }, [query.data?.data])
  const summaries = useMemo(
    () => Object.fromEntries(days.map((day) => [day.id, dayCounts(students, day)])),
    [days, students],
  )

  useEffect(() => {
    todayColRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [days, query.isFetched])

  const saveMark = (
    studentId: number,
    dayId: number,
    type: number,
    value: string,
    note = '',
  ) => {
    editMutation.mutate(
      { groupId, studentId, classDateId: dayId, type, value, comment: note },
      {
        onSuccess: () => {
          notify.success(t('common.saved'))
          setEditing(null)
          setCommentOpen(false)
          setPendingSave(null)
          setComment('')
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  const requestAttendance = (
    student: GroupMonitoringStudent,
    day: GroupMonitoringDay,
    next: AttendanceValue,
  ) => {
    const current = attendanceValue(student.mark_monitoring?.[String(day.id)])
    if (next === '*') {
      setExcuseStudent(student)
      setExcuseFrom(isoDay(day.start_time))
      setExcuseTo(isoDay(day.start_time))
      setExcuseReason('')
      setExcuseFile(null)
      setExcuseOpen(true)
      setEditing(null)
      return
    }
    if (current !== next && current !== '') {
      setPendingSave({
        studentId: student.id,
        dayId: day.id,
        type: 2,
        value: next,
        previous: current,
      })
      setComment('')
      setCommentOpen(true)
      return
    }
    saveMark(student.id, day.id, 2, next)
  }

  const requestGrade = (student: GroupMonitoringStudent, day: GroupMonitoringDay, value: string) => {
    const previous = String(student.mark_monitoring?.[String(day.id)]?.value ?? '')
    if (previous && previous !== value) {
      setPendingSave({
        studentId: student.id,
        dayId: day.id,
        type: 1,
        value,
        previous,
      })
      setComment('')
      setCommentOpen(true)
      return
    }
    saveMark(student.id, day.id, 1, value)
  }

  const onExcuseSave = () => {
    if (!excuseStudent || !excuseFrom || !excuseTo || !excuseReason.trim() || !excuseFile) {
      notify.error(t('groupsPage.showPage.journalExcuseRequired'))
      return
    }
    const form = new FormData()
    form.append('student_id', String(excuseStudent.id))
    form.append('from_date', excuseFrom)
    form.append('to_date', excuseTo)
    form.append('reason', excuseReason.trim())
    form.append('document', excuseFile)
    excuseMutation.mutate(form, {
      onSuccess: () => {
        notify.success(t('groupsPage.showPage.journalExcuseSaved'))
        setExcuseOpen(false)
        void query.refetch()
      },
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  if (query.isLoading) {
    return (
      <Panel padding="md">
        <SkeletonLines lines={8} />
      </Panel>
    )
  }
  if (query.isError) return <ErrorMessage />

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5" title={t('groupsPage.showPage.journalPresentHint')}>
            <span className="flex size-7 items-center justify-center rounded-lg bg-teal-soft">
              <UserCheck className="size-3.5 text-teal" aria-hidden />
            </span>
            {t('groupsPage.showPage.journalPresent')}
            <Info className="size-3.5 text-signal" aria-hidden />
          </span>
          <span className="inline-flex items-center gap-1.5" title={t('groupsPage.showPage.journalAbsentHint')}>
            <span className="flex size-7 items-center justify-center rounded-lg bg-rose-soft">
              <UserX className="size-3.5 text-rose" aria-hidden />
            </span>
            {t('groupsPage.showPage.journalAbsent')}
            <Info className="size-3.5 text-signal" aria-hidden />
          </span>
          <span className="inline-flex items-center gap-1.5" title={t('groupsPage.showPage.journalExcusedHint')}>
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-soft">
              <FileSignature className="size-3.5 text-amber" aria-hidden />
            </span>
            {t('groupsPage.showPage.journalExcusedDoc')}
            <Info className="size-3.5 text-signal" aria-hidden />
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          loading={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RefreshCw className="size-3.5" aria-hidden />
          {t('common.refresh')}
        </Button>
      </div>

      <Tabs
        items={[
          { value: 'davomat' as const, label: t('groupsPage.showPage.journalAttendance') },
          { value: 'baholash' as const, label: t('groupsPage.showPage.journalGrading') },
        ]}
        value={mode}
        onChange={(value) => {
          setMode(value)
          setEditing(null)
        }}
      />

      {students.length === 0 ? (
        <EmptyState description={t('common.empty')} />
      ) : (
        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-mist/70 bg-white">
          <table className="w-max min-w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-20 bg-fog">
              <tr>
                <th className="sticky left-0 z-30 w-12 border-b border-r border-mist/70 bg-fog px-2 py-2 text-center text-muted">
                  №
                </th>
                <th className="sticky left-12 z-30 min-w-48 border-b border-r border-mist/70 bg-fog px-2 py-2">
                  {t('directorList.fio')}
                </th>
                {days.map((day) => {
                  const dayKey = isoDay(day.start_time)
                  const isToday = dayKey === today
                  const isFuture = dayKey > today
                  return (
                    <th
                      key={day.id}
                      ref={isToday ? todayColRef : undefined}
                      className={cn(
                        'min-w-20 w-20 border-b border-mist/70 px-1 py-2 text-center',
                        isToday && 'bg-teal-soft',
                      )}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="rounded-md bg-signal-soft px-1.5 py-0.5 text-[11px] font-semibold text-signal">
                          {shortDate(day.start_time)}
                        </span>
                        {canMutate && !isFuture ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="size-6"
                            loading={
                              refreshDayMutation.isPending &&
                              refreshDayMutation.variables?.date === dayKey
                            }
                            aria-label={t('groupsPage.showPage.journalRefreshDate')}
                            onClick={() =>
                              refreshDayMutation.mutate(
                                { groupId, date: dayKey },
                                {
                                  onSuccess: () => notify.success(t('common.saved')),
                                  onError: (err) =>
                                    notify.error(err.message || t('common.loadError')),
                                },
                              )
                            }
                          >
                            <RefreshCw className="size-3" />
                          </Button>
                        ) : null}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id} className="border-t border-mist/60">
                  <td className="sticky left-0 z-10 bg-white px-2 py-1.5 text-center text-muted">
                    {index + 1}
                  </td>
                  <td className="sticky left-12 z-10 bg-white px-2 py-1.5">
                    <Link
                      to={studentPath(student.id)}
                      className="font-semibold uppercase text-signal hover:underline"
                    >
                      {fullNameOf(student) ?? '—'}
                    </Link>
                  </td>
                  {days.map((day) => {
                    const dayKey = isoDay(day.start_time)
                    const isToday = dayKey === today
                    const isFuture = dayKey > today
                    const canEditDay =
                      canMutate &&
                      !isFuture &&
                      (isToday || Number(day.access_monitoring) === 1)
                    const mark = student.mark_monitoring?.[String(day.id)]
                    const kind = markKind(mark)
                    const isEditing =
                      editing?.studentId === student.id && editing.dayId === day.id
                    return (
                      <td
                        key={day.id}
                        className={cn('px-1 py-1.5 text-center', isToday && 'bg-teal-soft/40')}
                      >
                        {isFuture ? null : mode === 'baholash' ? (
                          isEditing ? (
                            <input
                              name={`grade-${student.id}-${day.id}`}
                              value={gradeDraft}
                              maxLength={1}
                              autoFocus
                              className="mx-auto h-8 w-10 rounded-lg border border-mist/90 text-center text-sm font-semibold text-deep outline-none focus:border-signal/50"
                              onChange={(event) => {
                                const next = event.target.value.replace(/[^2-5]/g, '')
                                setGradeDraft(next)
                              }}
                              onBlur={() => {
                                if (gradeDraft) requestGrade(student, day, gradeDraft)
                                else setEditing(null)
                              }}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' && gradeDraft) {
                                  requestGrade(student, day, gradeDraft)
                                }
                                if (event.key === 'Escape') setEditing(null)
                              }}
                            />
                          ) : (
                            <button
                              type="button"
                              className="inline-flex min-h-8 min-w-10 items-center justify-center gap-1 rounded-md px-1"
                              disabled={!canEditDay}
                              onClick={() => {
                                if (!canEditDay) return
                                setEditing({ studentId: student.id, dayId: day.id })
                                setGradeDraft(kind === 'grade' ? String(mark?.value ?? '') : '')
                              }}
                            >
                              <span className="font-semibold text-deep">
                                {kind === 'grade' ? (mark?.value ?? '—') : '—'}
                              </span>
                              {canEditDay ? <Pencil className="size-3 text-muted" aria-hidden /> : null}
                            </button>
                          )
                        ) : isEditing ? (
                          <div className="flex items-center justify-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="size-7"
                              aria-label={t('groupsPage.showPage.journalSetPresent')}
                              onClick={() => requestAttendance(student, day, '')}
                            >
                              <UserCheck className="size-3.5 text-teal" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="size-7"
                              aria-label={t('groupsPage.showPage.journalSetAbsent')}
                              onClick={() => requestAttendance(student, day, '-')}
                            >
                              <UserX className="size-3.5 text-rose" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="size-7"
                              aria-label={t('groupsPage.showPage.journalSetExcused')}
                              onClick={() => requestAttendance(student, day, '*')}
                            >
                              <FileSignature className="size-3.5 text-amber" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="size-7"
                              onClick={() => setEditing(null)}
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center gap-1">
                            {isToday ? (
                              todayPresent.has(student.id) ? (
                                <button
                                  type="button"
                                  className="inline-flex size-7 items-center justify-center rounded-md"
                                  onClick={() => setFaceId(todayRow(todayStudents, student.id))}
                                  aria-label={t('groupsPage.showPage.journalFaceIdTime')}
                                >
                                  <UserCheck className="size-4 text-teal" aria-hidden />
                                </button>
                              ) : (
                                <HelpCircle className="size-4 text-rose" aria-hidden />
                              )
                            ) : (
                              <AttendanceIcon kind={kind} />
                            )}
                            {canEditDay ? (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-6"
                                aria-label={t('groupsPage.showPage.journalEdit')}
                                onClick={() =>
                                  setEditing({ studentId: student.id, dayId: day.id })
                                }
                              >
                                <Pencil className="size-3 text-teal" />
                              </Button>
                            ) : null}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {mode === 'davomat'
                ? (
                    [
                      {
                        key: 'present',
                        label: t('groupsPage.showPage.journalPresentShort'),
                        tone: 'bg-teal-soft text-teal',
                        field: 'present' as const,
                      },
                      {
                        key: 'absent',
                        label: t('groupsPage.showPage.journalAbsentShort'),
                        tone: 'bg-rose-soft text-rose',
                        field: 'absent' as const,
                      },
                      {
                        key: 'excused',
                        label: t('groupsPage.showPage.journalExcusedShort'),
                        tone: 'bg-amber-soft text-amber',
                        field: 'excused' as const,
                      },
                    ] as const
                  ).map((row) => (
                    <tr key={row.key} className="border-t border-mist/60">
                      <td
                        colSpan={2}
                        className={`sticky left-0 z-10 px-2 py-1.5 font-semibold ${row.tone}`}
                      >
                        {row.label}
                      </td>
                      {days.map((day) => (
                        <td key={day.id} className="px-1 py-1 text-center">
                          <span
                            className={`inline-flex min-w-8 justify-center rounded-md px-1.5 py-0.5 text-xs font-semibold ${row.tone}`}
                          >
                            {summaries[day.id]?.[row.field] ?? 0}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        title={t('groupsPage.showPage.journalEdit')}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setCommentOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={editMutation.isPending}
              onClick={() => {
                if (!pendingSave) return
                saveMark(
                  pendingSave.studentId,
                  pendingSave.dayId,
                  pendingSave.type,
                  pendingSave.value,
                  comment,
                )
              }}
            >
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <p className="mb-2 text-xs text-muted">
          {shortDate(days.find((day) => day.id === pendingSave?.dayId)?.start_time)}
        </p>
        <div className="mb-3 flex items-center justify-center gap-3">
          {pendingSave?.type === 1 ? (
            <span className="text-sm font-semibold text-deep">{pendingSave.previous || '—'}</span>
          ) : (
            <AttendanceIcon kind={markKind({ type: 2, value: pendingSave?.previous })} />
          )}
          <ArrowRight className="size-4 text-muted" aria-hidden />
          {pendingSave?.type === 1 ? (
            <span className="text-sm font-semibold text-deep">{pendingSave.value}</span>
          ) : (
            <AttendanceIcon kind={markKind({ type: 2, value: pendingSave?.value })} />
          )}
        </div>
        <Textarea
          label={t('groupsPage.showPage.journalComment')}
          name="journal_comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </Modal>

      <Modal
        open={excuseOpen}
        onClose={() => setExcuseOpen(false)}
        title={t('groupsPage.showPage.journalExcuseTitle', {
          name: fullNameOf(excuseStudent) ?? '—',
        })}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setExcuseOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={excuseMutation.isPending}
              onClick={onExcuseSave}
            >
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <Notification tone="warning" className="mb-3">
          {t('groupsPage.showPage.journalExcuseWarn')}
        </Notification>
        <p className="mb-2 text-sm font-semibold uppercase text-deep">
          {fullNameOf(excuseStudent) ?? '—'}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <DateInput
            label={t('groupsPage.showPage.fromDate')}
            name="from_date"
            value={excuseFrom}
            onChange={(event) => setExcuseFrom(event.target.value)}
          />
          <DateInput
            label={t('groupsPage.showPage.toDate')}
            name="to_date"
            value={excuseTo}
            onChange={(event) => setExcuseTo(event.target.value)}
          />
        </div>
        <Textarea
          className="mt-2"
          label={t('groupsPage.showPage.journalExcuseReason')}
          name="reason"
          value={excuseReason}
          onChange={(event) => setExcuseReason(event.target.value)}
        />
        <label className="mt-2 block text-xs font-medium text-muted">
          {t('groupsPage.showPage.journalExcuseDocument')}
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="mt-1 block w-full text-xs text-deep"
            onChange={(event) => setExcuseFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </Modal>

      <Modal
        open={faceId != null}
        onClose={() => setFaceId(null)}
        title={t('groupsPage.showPage.journalFaceIdTime')}
        sizeClassName="max-w-xs"
        footer={
          <Button variant="outline" size="sm" className="w-full" onClick={() => setFaceId(null)}>
            {t('groupsPage.showPage.journalClose')}
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-2 py-1">
          {attendancePhoto(faceId?.current_image) ? (
            <img
              src={attendancePhoto(faceId?.current_image)}
              alt=""
              className="size-28 rounded-xl object-cover"
            />
          ) : (
            <div className="flex size-28 items-center justify-center rounded-xl bg-fog text-muted">
              <UserCheck className="size-8" aria-hidden />
            </div>
          )}
          <p className="text-sm font-semibold text-deep">{faceId?.attendance_time || '00:00:00'}</p>
        </div>
      </Modal>
    </div>
  )
}
