import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import {
  Badge,
  Button,
  DateInput,
  EmptyState,
  EmptyTR,
  ErrorMessage,
  Notification,
  Pagination,
  Panel,
  SafeImage,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  Tabs,
  TR,
  notify,
} from '@/components/ui'
import { PATH_PREFIX_FILE } from '@/config'
import { AbsenceReasonsPanel } from '@/pages/missed-classes/AbsenceReasonsPanel'
import { queryKeys, refreshStudentAttendanceStats } from '@/api'
import { useAuth } from '@/features/auth'
import {
  useExamCenterResultsQuery,
  usePracticalAttendancesQuery,
  useStudentAttendanceLogQuery,
  useStudentAutodromeAttendanceQuery,
  useStudentContractQuery,
  useStudentExamResultsQuery,
  useStudentPaymentsQuery,
} from '@/features/students'
import { parsePercent, resolveFileUrl } from '@/features/lessons'
import { asText } from '@/lib/apiPage'
import { cn } from '@/lib/cn'
import { formatDate, formatDateTime, formatNumber } from '@/lib/format'
import type { StudentAttendanceStats, StudentGroup, StudentItem } from '@/types/student'
import { ExtraLessonsPanel } from './ExtraLessonsPanel'
import { StudentDocumentsPanel } from './StudentDocumentsPanel'

export type StudentShowTab =
  | 'school'
  | 'autodrome'
  | 'examCenter'
  | 'exam'
  | 'docs'
  | 'extra'
  | 'practical'

function AttendanceTable({
  id,
  storageKey,
  enabled,
}: {
  id: string
  storageKey: string
  enabled: boolean
}) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const query = useStudentAttendanceLogQuery(id, page, enabled)
  const rows = query.data?.data ?? []

  if (query.isLoading) {
    return (
      <Panel padding="md">
        <SkeletonLines lines={6} />
      </Panel>
    )
  }
  if (query.isError) return <ErrorMessage className="!py-5" />

  return (
    <>
      <Table storageKey={storageKey} fill={false}>
        <THead>
          <TR>
            <TH className="w-10 px-2! py-1! text-center">№</TH>
            <TH className="px-2! py-1!">{t('students.showPage.attendanceDate')}</TH>
            <TH className="px-2! py-1!">{t('students.showPage.attendanceTime')}</TH>
            <TH className="px-2! py-1!">{t('students.showPage.inOut')}</TH>
          </TR>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <EmptyTR colSpan={4} compact description={t('common.empty')} />
          ) : (
            rows.map((row, index) => {
              const entered = String(row.type ?? '').includes('entry')
              return (
                <TR key={row.id ?? index}>
                  <TD className="px-2! py-1! text-center">{index + 1}</TD>
                  <TD className="px-2! py-1!">{row.attendance_date || '—'}</TD>
                  <TD className="px-2! py-1!">{row.attendance_time || '—'}</TD>
                  <TD className="px-2! py-1!">
                    <Badge tone={entered ? 'teal' : 'rose'}>
                      {entered
                        ? t('students.showPage.entered')
                        : t('students.showPage.exited')}
                    </Badge>
                  </TD>
                </TR>
              )
            })
          )}
        </TBody>
      </Table>
      <Pagination
        page={query.data?.current_page ?? page}
        totalPages={query.data?.last_page ?? 1}
        total={query.data?.total_items}
        pageSize={10}
        onPageChange={setPage}
      />
    </>
  )
}

function AttendanceStats({
  studentId,
  stats,
}: {
  studentId: string
  stats: StudentAttendanceStats | null | undefined
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const refresh = useMutation({
    mutationFn: () => refreshStudentAttendanceStats(studentId),
    onSuccess: () => {
      notify.success(t('students.showPage.attendanceUpdated'))
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(studentId) })
    },
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  })
  const percent = parsePercent(stats?.average_attendance_percent)
  const total = Number(stats?.all_classes_count ?? 0)
  const missed = Number(stats?.absence_count ?? 0)
  const attended = Math.max(0, total - missed)
  const bar =
    percent < 70 ? 'bg-rose' : percent < 90 ? 'bg-amber' : 'bg-teal'

  return (
    <section className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-wide text-deep uppercase">
          {t('students.showPage.attendanceStats')}
        </p>
        <Button variant="ghost" size="sm" loading={refresh.isPending} onClick={() => refresh.mutate()}>
          <RefreshCw className="size-3.5" aria-hidden />
          {t('students.showPage.refresh')}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-10 shrink-0 text-xs font-semibold text-deep">{percent}%</span>
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-fog">
          <div
            className={cn('h-full rounded-full', bar)}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-mist/70 text-center">
        <div className="px-2 py-1.5">
          <p className="text-[11px] text-muted">{t('students.showPage.totalLessons')}</p>
          <p className="text-sm font-semibold text-deep">{total}</p>
        </div>
        <div className="border-x border-mist/70 px-2 py-1.5">
          <p className="text-[11px] text-muted">{t('students.showPage.missed')}</p>
          <p className="text-sm font-semibold text-rose">{missed}</p>
        </div>
        <div className="px-2 py-1.5">
          <p className="text-[11px] text-muted">{t('students.showPage.attended')}</p>
          <p className="text-sm font-semibold text-teal">{attended}</p>
        </div>
      </div>
    </section>
  )
}

function PaymentsBlock({ id }: { id: string }) {
  const { t, i18n } = useTranslation()
  const payments = useStudentPaymentsQuery(id, true)
  const contract = useStudentContractQuery(id, true)
  const rows = payments.data ?? []
  const paidSum = rows.reduce((acc, row) => acc + Number(row.amount ?? 0), 0)
  const needed = contract.data?.edu_type_price?.price

  if (payments.isLoading) {
    return (
      <Panel padding="md">
        <SkeletonLines lines={4} />
      </Panel>
    )
  }
  if (payments.isError) return <ErrorMessage />

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-semibold tracking-wide text-deep uppercase">
          {t('students.showPage.payments')}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7! px-1.5 text-signal!"
          loading={payments.isFetching || contract.isFetching}
          onClick={() => {
            void payments.refetch()
            void contract.refetch()
          }}
        >
          <RefreshCw className="size-3.5" aria-hidden />
          {t('students.showPage.refresh')}
        </Button>
      </div>
      <Table storageKey="student-show-payments" fill={false}>
        <THead>
          <TR>
            <TH className="w-10 px-2! py-1! text-center">№</TH>
            <TH className="px-2! py-1!">{t('students.showPage.paid')}</TH>
            <TH className="px-2! py-1!">{t('students.showPage.paymentDate')}</TH>
          </TR>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <EmptyTR colSpan={3} plain description={t('common.empty')} />
          ) : (
            rows.map((row, index) => (
              <TR key={row.id ?? index}>
                <TD className="px-2! py-1! text-center">{index + 1}</TD>
                <TD className="px-2! py-1!">
                  <Badge tone="teal">
                    {formatNumber(row.amount)} {t('students.editPage.sum')}
                  </Badge>
                </TD>
                <TD className="px-2! py-1!">
                  {formatDate(row.payment_date, i18n.language) ?? row.payment_date ?? '—'}
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {needed != null ? (
          <span>
            {t('students.showPage.allNeeded')}: {formatNumber(needed)}
          </span>
        ) : null}
        <span>
          {t('students.showPage.paidTotal')}: {formatNumber(paidSum)}
        </span>
        {needed != null ? (
          <span className="font-semibold text-rose">
            {t('students.showPage.debt')}: {formatNumber(Number(needed) - paidSum)}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function StatMini({
  label,
  value,
  unit,
  required,
}: {
  label: string
  value: number
  unit: string
  required: number
}) {
  const { t } = useTranslation()
  const percent = required > 0 ? Math.min(100, Math.round((value / required) * 100)) : 0
  const done = required > 0 && value >= required
  return (
    <Panel padding="sm" className="space-y-2">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="text-lg font-semibold text-deep">
        {value} {unit}
      </p>
      <p className="text-xs text-muted">
        {t('students.showPage.required')}: {required} {unit}
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-fog">
        <div
          className={cn('h-full rounded-full', done ? 'bg-teal' : percent >= 50 ? 'bg-amber' : 'bg-rose')}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className={cn('text-right text-xs font-semibold', done ? 'text-teal' : 'text-muted')}>
        {done ? t('students.showPage.done') : t('students.showPage.inProgress')}
      </p>
    </Panel>
  )
}

function AutodromeAttendanceBlock({ id }: { id: string }) {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const query = useStudentAutodromeAttendanceQuery(id, page, true)
  const rows = query.data?.data ?? []
  const summary = query.data?.summary

  if (query.isLoading) {
    return (
      <Panel padding="md">
        <SkeletonLines lines={6} />
      </Panel>
    )
  }
  if (query.isError) return <ErrorMessage className="!py-5" />

  return (
    <div className="space-y-3">
      {summary ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <StatMini
            label={t('students.showPage.visits')}
            value={Number(summary.completed_seans ?? 0)}
            unit={t('students.showPage.times')}
            required={Number(summary.required_seans ?? 0)}
          />
          <StatMini
            label={t('students.showPage.hoursAttended')}
            value={Number(summary.completed_hours ?? 0)}
            unit={t('students.showPage.hours')}
            required={Number(summary.required_hours ?? 0)}
          />
        </div>
      ) : null}
      {rows.length ? (
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={row.id ?? index} className="grid gap-2 sm:grid-cols-2">
              <Panel padding="sm" className="text-center text-sm font-medium text-signal">
                {t('students.showPage.date')}:{' '}
                {formatDate(row.date || row.attendance_date, i18n.language) ??
                  row.date ??
                  row.attendance_date ??
                  '—'}
              </Panel>
              <Panel padding="sm" className="text-center text-sm font-medium text-teal">
                {t('students.showPage.entryTime')}:{' '}
                {row.first_entry
                  ? (formatDateTime(row.first_entry, i18n.language) ?? row.first_entry)
                  : '—'}
              </Panel>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState description={t('common.empty')} />
      )}
      <Pagination
        page={query.data?.current_page ?? page}
        totalPages={query.data?.last_page ?? 1}
        total={query.data?.total_items}
        pageSize={10}
        onPageChange={setPage}
      />
    </div>
  )
}

function practicalStatus(status: string | null | undefined, t: (k: string) => string) {
  if (status === 'confirmed') return { label: t('students.showPage.statusConfirmed'), tone: 'teal' as const }
  if (status === 'verified') return { label: t('students.showPage.statusVerified'), tone: 'signal' as const }
  if (status === 'pending') return { label: t('students.showPage.statusPending'), tone: 'amber' as const }
  if (status === 'rejected') return { label: t('students.showPage.statusRejected'), tone: 'rose' as const }
  if (status === 'expired') return { label: t('students.showPage.statusExpired'), tone: 'neutral' as const }
  return { label: status || '—', tone: 'neutral' as const }
}

export function StudentShowTabs({
  studentId,
  student,
  group,
  stats,
  tab,
  onTabChange,
}: {
  studentId: string
  student: StudentItem
  group: StudentGroup | null
  stats: StudentAttendanceStats | null | undefined
  tab: StudentShowTab
  onTabChange: (value: StudentShowTab) => void
}) {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const hidePayments = [9, 10, 11].includes(Number(user?.role))
  const studentNum = Number(studentId)
  const [examFrom, setExamFrom] = useState('')
  const [examTo, setExamTo] = useState('')
  const exams = useStudentExamResultsQuery(studentId, tab === 'exam')
  const examCenter = useExamCenterResultsQuery(
    studentId,
    tab === 'examCenter',
    examFrom || undefined,
    examTo || undefined,
  )
  const practical = usePracticalAttendancesQuery(studentId, tab === 'practical')

  return (
    <Panel padding="none">
      <Tabs
        aria-label={t('students.show')}
        variant="line"
        className="px-2"
        value={tab}
        onChange={onTabChange}
        items={[
          { value: 'school', label: t('students.showPage.tabSchool') },
          { value: 'autodrome', label: t('students.showPage.tabAutodrome') },
          { value: 'examCenter', label: t('students.showPage.tabExamCenter') },
          { value: 'exam', label: t('students.showPage.tabExam') },
          { value: 'docs', label: t('students.showPage.tabDocs') },
          { value: 'extra', label: t('students.showPage.tabExtra') },
          { value: 'practical', label: t('students.showPage.tabPractical') },
        ]}
      />

      <div className={tab === 'school' || tab === 'examCenter' || tab === 'extra' ? 'space-y-2 p-2' : 'space-y-3 p-3'}>
      {tab === 'school' ? (
        <div className="space-y-2">
          <section className="space-y-1">
            <p className="text-[11px] font-semibold tracking-wide text-deep uppercase">
              {t('students.showPage.attendanceLog')}
            </p>
            <AttendanceTable id={studentId} storageKey="student-show-att" enabled />
          </section>
          <AttendanceStats studentId={studentId} stats={stats} />
          <AbsenceReasonsPanel active compact studentId={studentNum} />
          {hidePayments ? null : <PaymentsBlock id={studentId} />}
        </div>
      ) : null}

      {tab === 'autodrome' ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-wide text-deep uppercase">
            {t('students.showPage.attendanceLog')}
          </p>
          <Notification tone="info">{t('students.showPage.autodromeHint')}</Notification>
          <AutodromeAttendanceBlock id={studentId} />
        </div>
      ) : null}

      {tab === 'examCenter' ? (
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-wide text-deep uppercase">
                {t('students.showPage.examCenterTitle')}
              </p>
              <p className="text-[11px] text-muted">{t('students.showPage.examCenterHint')}</p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="w-36">
                <DateInput
                  size="sm"
                  label={t('students.showPage.fromDate')}
                  value={examFrom}
                  onChange={(e) => setExamFrom(e.target.value)}
                />
              </div>
              <div className="w-36">
                <DateInput
                  size="sm"
                  label={t('students.showPage.toDate')}
                  value={examTo}
                  onChange={(e) => setExamTo(e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7! px-1.5 text-signal!"
                loading={examCenter.isFetching}
                onClick={() => void examCenter.refetch()}
              >
                <RefreshCw className="size-3.5" aria-hidden />
                {t('students.showPage.refresh')}
              </Button>
            </div>
          </div>
        {examCenter.isLoading ? (
          <SkeletonLines lines={3} />
        ) : examCenter.isError ? (
          <ErrorMessage className="!py-3" />
        ) : (
          (() => {
            const rows = examCenter.data ?? []
            const passed = rows.filter((row) => row.result === true).length
            const failed = rows.filter((row) => row.result === false).length
            const scored = rows.filter((row) => row.score != null)
            const avg =
              scored.length > 0
                ? Math.round(
                    scored.reduce((sum, row) => sum + Number(row.score), 0) / scored.length,
                  )
                : null
            return (
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-mist/70 text-center sm:grid-cols-4">
                  <div className="px-2 py-1.5">
                    <p className="text-[11px] text-muted">{t('students.showPage.examTotal')}</p>
                    <p className="text-sm font-semibold text-deep">{rows.length}</p>
                  </div>
                  <div className="border-l border-mist/70 px-2 py-1.5">
                    <p className="text-[11px] text-muted">{t('students.showPage.passed')}</p>
                    <p className="text-sm font-semibold text-teal">{passed}</p>
                  </div>
                  <div className="border-t border-mist/70 px-2 py-1.5 sm:border-t-0 sm:border-l">
                    <p className="text-[11px] text-muted">{t('students.showPage.failed')}</p>
                    <p className="text-sm font-semibold text-rose">{failed}</p>
                  </div>
                  <div className="border-t border-l border-mist/70 px-2 py-1.5 sm:border-t-0">
                    <p className="text-[11px] text-muted">{t('students.showPage.avgScore')}</p>
                    <p className="text-sm font-semibold text-deep">{avg ?? '—'}</p>
                  </div>
                </div>
                <Table storageKey="student-show-exam-center" fill={false}>
                    <THead>
                      <TR>
                        <TH className="w-10 px-2! py-1! text-center">№</TH>
                        <TH className="px-2! py-1!">{t('students.showPage.region')}</TH>
                        <TH className="px-2! py-1!">{t('students.showPage.district')}</TH>
                        <TH className="px-2! py-1!">{t('students.showPage.date')}</TH>
                        <TH className="px-2! py-1!">{t('students.showPage.category')}</TH>
                        <TH className="px-2! py-1!">{t('students.showPage.result')}</TH>
                        <TH className="px-2! py-1!">{t('students.showPage.score')}</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {rows.length === 0 ? (
                        <EmptyTR colSpan={7} plain description={t('students.showPage.examCenterEmpty')} />
                      ) : (
                      rows.map((row, index) => (
                        <TR key={row.id ?? index}>
                          <TD className="px-2! py-1! text-center">{index + 1}</TD>
                          <TD className="px-2! py-1!">{asText(row.region?.name)}</TD>
                          <TD className="px-2! py-1!">{asText(row.area?.name)}</TD>
                          <TD className="px-2! py-1!">
                            {formatDate(row.exam_date || row.date, i18n.language) ??
                              row.exam_date ??
                              row.date ??
                              '—'}
                          </TD>
                          <TD className="px-2! py-1!">{row.category_flag ?? '—'}</TD>
                          <TD className="px-2! py-1!">
                            <Badge tone={row.result ? 'teal' : 'rose'}>
                              {row.result
                                ? t('students.showPage.passed')
                                : t('students.showPage.failed')}
                            </Badge>
                          </TD>
                          <TD className="px-2! py-1!">{row.score ?? '—'}</TD>
                        </TR>
                      ))
                      )}
                    </TBody>
                  </Table>
              </div>
            )
          })()
        )}
        </div>
      ) : null}

      {tab === 'exam' ? (
        exams.isLoading ? (
          <SkeletonLines lines={6} />
        ) : exams.isError ? (
          <ErrorMessage className="!py-5" />
        ) : (
          <Table storageKey="student-show-exams">
            <THead>
              <TR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('students.showPage.examTitle')}</TH>
                <TH>{t('students.showPage.correct')}</TH>
                <TH>{t('students.showPage.questions')}</TH>
              </TR>
            </THead>
            <TBody>
              {(exams.data ?? []).length === 0 ? (
                <TR>
                  <TD className="py-10 text-center" colSpan={4}>
                    <EmptyState description={t('students.showPage.noExam')} />
                  </TD>
                </TR>
              ) : (
                (exams.data ?? []).map((row, index) => (
                  <TR key={row.id ?? index}>
                    <TD className="text-center">{index + 1}</TD>
                    <TD>{row.exam_name || '—'}</TD>
                    <TD>
                      <Badge tone="teal">{row.correct_answers_count ?? '—'}</Badge>
                    </TD>
                    <TD>
                      <Badge tone="signal">{row.question_count ?? '—'}</Badge>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        )
      ) : null}

      {tab === 'docs' ? <StudentDocumentsPanel studentId={studentId} /> : null}

      {tab === 'extra' ? (
        <ExtraLessonsPanel studentId={studentId} student={student} group={group} />
      ) : null}

      {tab === 'practical' ? (
        practical.isLoading ? (
          <SkeletonLines lines={6} />
        ) : practical.isError ? (
          <ErrorMessage className="!py-5" />
        ) : (
          <Table storageKey="student-show-practical">
            <THead>
              <TR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('groupDetails.photo')}</TH>
                <TH>{t('students.showPage.date')}</TH>
                <TH>{t('students.showPage.time')}</TH>
                <TH>{t('students.showPage.faceResult')}</TH>
                <TH>{t('students.showPage.practicalStatus')}</TH>
                <TH>{t('students.showPage.confirmedBy')}</TH>
                <TH>{t('students.showPage.confirmedAt')}</TH>
              </TR>
            </THead>
            <TBody>
              {(practical.data ?? []).length === 0 ? (
                <TR>
                  <TD className="py-10 text-center" colSpan={8}>
                    <EmptyState description={t('common.empty')} />
                  </TD>
                </TR>
              ) : (
                (practical.data ?? []).map((row, index) => {
                const src = resolveFileUrl(row.face_check_image, PATH_PREFIX_FILE)
                const status = practicalStatus(row.status, t)
                return (
                  <TR key={row.id ?? index}>
                    <TD className="text-center">{index + 1}</TD>
                    <TD>
                      <SafeImage
                        src={src}
                        size="sm"
                        className="size-11 rounded-lg ring-1 ring-mist/70"
                      />
                    </TD>
                    <TD>
                      <Badge tone="signal">
                        {formatDate(row.attendance_date || row.date, i18n.language) ??
                          row.attendance_date ??
                          row.date ??
                          '—'}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge tone="indigo">{row.attendance_time || '—'}</Badge>
                    </TD>
                    <TD>
                      <Badge
                        tone={
                          row.face_check_result === 1
                            ? 'teal'
                            : row.face_check_result === 0
                              ? 'rose'
                              : 'amber'
                        }
                      >
                        {row.face_check_result === 1
                          ? t('students.showPage.faceOk')
                          : row.face_check_result === 0
                            ? t('students.showPage.faceFail')
                            : t('students.showPage.faceError')}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </TD>
                    <TD>
                      <Badge tone="neutral">
                        {typeof row.confirmed_by === 'object' && row.confirmed_by
                          ? row.confirmed_by.name || '—'
                          : row.confirmed_by || '—'}
                      </Badge>
                    </TD>
                    <TD>
                      {row.confirmed_at ? (
                        <Badge tone="teal">
                          {formatDateTime(row.confirmed_at, i18n.language) ?? row.confirmed_at}
                        </Badge>
                      ) : (
                        <span className="text-[12px] text-muted">
                          {t('students.showPage.notConfirmed')}
                        </span>
                      )}
                    </TD>
                  </TR>
                )
              })
              )}
            </TBody>
          </Table>
        )
      ) : null}
      </div>
    </Panel>
  )
}
