import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Badge,
  DateInput,
  EmptyState,
  ErrorMessage,
  Notification,
  Pagination,
  Panel,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  Tabs,
  TR,
} from '@/components/ui'
import { PATH_PREFIX_FILE } from '@/config'
import { AbsenceReasonsPanel } from '@/pages/missed-classes/AbsenceReasonsPanel'
import {
  useExamCenterResultsQuery,
  usePracticalAttendancesQuery,
  useStudentAttendanceLogQuery,
  useStudentAutodromeAttendanceQuery,
  useStudentClassDatesQuery,
  useStudentContractQuery,
  useStudentExamResultsQuery,
  useStudentPaymentsQuery,
} from '@/features/students'
import { parsePercent, resolveFileUrl } from '@/features/lessons'
import { asFio, asLangName, asText } from '@/lib/apiPage'
import { cn } from '@/lib/cn'
import { formatDate, formatDateTime, formatNumber } from '@/lib/format'
import type { StudentAttendanceStats } from '@/types/student'

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
  if (query.isError) return <ErrorMessage />

  return (
    <>
      {rows.length ? (
        <Table storageKey={storageKey}>
          <THead>
            <TR>
              <TH className="w-12 text-center">№</TH>
              <TH>{t('students.showPage.attendanceDate')}</TH>
              <TH>{t('students.showPage.attendanceTime')}</TH>
              <TH>{t('students.showPage.inOut')}</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row, index) => {
              const entered = String(row.type ?? '').includes('entry')
              return (
                <TR key={row.id ?? index}>
                  <TD className="text-center">{index + 1}</TD>
                  <TD>{row.attendance_date || '—'}</TD>
                  <TD>{row.attendance_time || '—'}</TD>
                  <TD>
                    <Badge tone={entered ? 'teal' : 'rose'}>
                      {entered
                        ? t('students.showPage.entered')
                        : t('students.showPage.exited')}
                    </Badge>
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
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
    </>
  )
}

function AttendanceStats({ stats }: { stats: StudentAttendanceStats | null | undefined }) {
  const { t } = useTranslation()
  const percent = parsePercent(stats?.average_attendance_percent)
  const total = Number(stats?.all_classes_count ?? 0)
  const missed = Number(stats?.absence_count ?? 0)
  const attended = Number(stats?.ended_classes_count ?? Math.max(0, total - missed))
  const bar =
    percent < 70 ? 'bg-rose' : percent < 90 ? 'bg-amber' : 'bg-teal'

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-sm font-medium text-deep">
          {t('students.showPage.avgAttendance')} {percent}%
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-fog">
          <div
            className={cn('h-full rounded-full', bar)}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Panel padding="sm">
          <p className="text-[12px] text-muted">{t('students.showPage.totalLessons')}</p>
          <p className="text-lg font-semibold text-deep">{total}</p>
        </Panel>
        <Panel padding="sm">
          <p className="text-[12px] text-muted">{t('students.showPage.missed')}</p>
          <p className="text-lg font-semibold text-rose">{missed}</p>
        </Panel>
        <Panel padding="sm">
          <p className="text-[12px] text-muted">{t('students.showPage.attended')}</p>
          <p className="text-lg font-semibold text-teal">{attended}</p>
        </Panel>
      </div>
    </div>
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
    <div className="space-y-3">
      {rows.length ? (
        <Table storageKey="student-show-payments">
          <THead>
            <TR>
              <TH className="w-12 text-center">№</TH>
              <TH>{t('students.showPage.paid')}</TH>
              <TH>{t('students.showPage.paymentDate')}</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row, index) => (
              <TR key={row.id ?? index}>
                <TD className="text-center">{index + 1}</TD>
                <TD>
                  <Badge tone="teal">
                    {formatNumber(row.amount)} {t('students.editPage.sum')}
                  </Badge>
                </TD>
                <TD>
                  {formatDate(row.payment_date, i18n.language) ?? row.payment_date ?? '—'}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      ) : (
        <EmptyState description={t('common.empty')} />
      )}
      <div className="flex flex-wrap gap-3 text-sm">
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
  if (query.isError) return <ErrorMessage />

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

function ExtraLessonsBlock({ id }: { id: string }) {
  const { t, i18n } = useTranslation()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const query = useStudentClassDatesQuery(id, fromDate || undefined, toDate || undefined, true)
  const rows = query.data?.data ?? []

  if (query.isLoading) {
    return <SkeletonLines lines={6} />
  }
  if (query.isError) return <ErrorMessage />

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <span className="rounded-lg bg-fog px-2 py-1 text-xs font-medium text-deep">
          {t('students.showPage.fromDate')}:{' '}
          {formatDate(query.data?.from_date, i18n.language) ?? t('common.empty')}
        </span>
        <span className="rounded-lg bg-fog px-2 py-1 text-xs font-medium text-deep">
          {t('students.showPage.toDate')}:{' '}
          {formatDate(query.data?.to_date, i18n.language) ?? t('common.empty')}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
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
        </div>
      </div>
      {rows.length ? (
        <Table storageKey="student-show-extra">
          <THead>
            <TR>
              <TH className="w-12 text-center">№</TH>
              <TH>{t('students.showPage.date')}</TH>
              <TH>{t('students.showPage.time')}</TH>
              <TH>{t('students.showPage.note')}</TH>
              <TH>{t('students.showPage.attendanceCol')}</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row, index) => (
              <TR key={row.id ?? index}>
                <TD className="text-center">{index + 1}</TD>
                <TD>{formatDate(row.lesson_date, i18n.language) ?? row.lesson_date ?? '—'}</TD>
                <TD>
                  {(row.start_time || '—').toString().slice(0, 5)} —{' '}
                  {(row.end_time || '—').toString().slice(0, 5)}
                </TD>
                <TD className="max-w-70 truncate">{row.note || '—'}</TD>
                <TD>
                  <Badge tone={row.is_attendance ? 'teal' : 'rose'}>
                    {row.is_attendance
                      ? t('students.showPage.attended')
                      : t('students.showPage.notAttended')}
                  </Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      ) : (
        <EmptyState description={t('common.empty')} />
      )}
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
  stats,
  tab,
  onTabChange,
}: {
  studentId: string
  stats: StudentAttendanceStats | null | undefined
  tab: StudentShowTab
  onTabChange: (value: StudentShowTab) => void
}) {
  const { t, i18n } = useTranslation()
  const studentNum = Number(studentId)
  const exams = useStudentExamResultsQuery(studentId, tab === 'exam')
  const examCenter = useExamCenterResultsQuery(studentId, tab === 'examCenter')
  const practical = usePracticalAttendancesQuery(studentId, tab === 'practical')
  const contract = useStudentContractQuery(studentId, tab === 'docs')

  return (
    <Panel padding="md" className="space-y-4">
      <Tabs
        aria-label={t('students.show')}
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

      {tab === 'school' ? (
        <div className="space-y-5">
          <section className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-deep">
              {t('students.showPage.attendanceLog')}
            </p>
            <AttendanceTable id={studentId} storageKey="student-show-att" enabled />
          </section>
          <section className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-deep">
              {t('students.showPage.attendanceStats')}
            </p>
            <AttendanceStats stats={stats} />
          </section>
          <section className="space-y-2">
            <AbsenceReasonsPanel active professionId={studentNum} />
          </section>
          <section className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-deep">
              {t('students.showPage.payments')}
            </p>
            <PaymentsBlock id={studentId} />
          </section>
        </div>
      ) : null}

      {tab === 'autodrome' ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-deep">
            {t('students.showPage.attendanceLog')}
          </p>
          <Notification tone="info">{t('students.showPage.autodromeHint')}</Notification>
          <AutodromeAttendanceBlock id={studentId} />
        </div>
      ) : null}

      {tab === 'examCenter' ? (
        examCenter.isLoading ? (
          <SkeletonLines lines={6} />
        ) : examCenter.isError ? (
          <ErrorMessage />
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
              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-4">
                  <Panel padding="sm">
                    <p className="text-[12px] text-muted">{t('students.showPage.examTotal')}</p>
                    <p className="text-lg font-semibold text-deep">{rows.length}</p>
                  </Panel>
                  <Panel padding="sm">
                    <p className="text-[12px] text-muted">{t('students.showPage.passed')}</p>
                    <p className="text-lg font-semibold text-teal">{passed}</p>
                  </Panel>
                  <Panel padding="sm">
                    <p className="text-[12px] text-muted">{t('students.showPage.failed')}</p>
                    <p className="text-lg font-semibold text-rose">{failed}</p>
                  </Panel>
                  <Panel padding="sm">
                    <p className="text-[12px] text-muted">{t('students.showPage.avgScore')}</p>
                    <p className="text-lg font-semibold text-deep">{avg ?? '—'}</p>
                  </Panel>
                </div>
                {rows.length ? (
                  <Table storageKey="student-show-exam-center">
                    <THead>
                      <TR>
                        <TH className="w-12 text-center">№</TH>
                        <TH>{t('students.showPage.region')}</TH>
                        <TH>{t('students.showPage.district')}</TH>
                        <TH>{t('students.showPage.date')}</TH>
                        <TH>{t('students.showPage.category')}</TH>
                        <TH>{t('students.showPage.result')}</TH>
                        <TH>{t('students.showPage.score')}</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {rows.map((row, index) => (
                        <TR key={row.id ?? index}>
                          <TD className="text-center">{index + 1}</TD>
                          <TD>{asText(row.region?.name)}</TD>
                          <TD>{asText(row.area?.name)}</TD>
                          <TD>
                            {formatDate(row.exam_date || row.date, i18n.language) ??
                              row.exam_date ??
                              row.date ??
                              '—'}
                          </TD>
                          <TD>{row.category_flag ?? '—'}</TD>
                          <TD>
                            <Badge tone={row.result ? 'teal' : 'rose'}>
                              {row.result
                                ? t('students.showPage.passed')
                                : t('students.showPage.failed')}
                            </Badge>
                          </TD>
                          <TD>{row.score ?? '—'}</TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                ) : (
                  <EmptyState description={t('common.empty')} />
                )}
              </div>
            )
          })()
        )
      ) : null}

      {tab === 'exam' ? (
        exams.isLoading ? (
          <SkeletonLines lines={6} />
        ) : exams.isError ? (
          <ErrorMessage />
        ) : !(exams.data ?? []).length ? (
          <EmptyState description={t('students.showPage.noExam')} />
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
              {(exams.data ?? []).map((row, index) => (
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
              ))}
            </TBody>
          </Table>
        )
      ) : null}

      {tab === 'docs' ? (
        contract.isLoading ? (
          <SkeletonLines lines={4} />
        ) : contract.isError ? (
          <ErrorMessage />
        ) : (
          <div className="space-y-3 text-sm">
            <p className="font-semibold uppercase tracking-wide text-deep">
              {t('students.showPage.tabDocs')}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                {t('students.showPage.contractPrice')}:{' '}
                {contract.data?.edu_type_price?.price != null
                  ? formatNumber(contract.data.edu_type_price.price)
                  : '—'}
              </p>
              <p>
                {t('students.showPage.contractStatus')}:{' '}
                {contract.data?.status ?? '—'}
              </p>
              <p>
                {t('students.organization')}:{' '}
                {asLangName(contract.data?.organization, i18n.language) || '—'}
              </p>
              <p>
                {t('students.showPage.groupName')}:{' '}
                {asLangName(contract.data?.group, i18n.language) || '—'}
              </p>
              <p>
                {t('students.showPage.eduDates')}:{' '}
                {contract.data?.group?.edu_starting_date ||
                contract.data?.group?.edu_ending_date
                  ? `${formatDate(contract.data.group?.edu_starting_date, i18n.language) ?? '—'} - ${
                      formatDate(contract.data.group?.edu_ending_date, i18n.language) ?? '—'
                    }`
                  : '—'}
              </p>
              <p>
                {t('groupDetails.fullName')}: {asFio(contract.data?.student) || '—'}
              </p>
            </div>
          </div>
        )
      ) : null}

      {tab === 'extra' ? <ExtraLessonsBlock id={studentId} /> : null}

      {tab === 'practical' ? (
        practical.isLoading ? (
          <SkeletonLines lines={6} />
        ) : practical.isError ? (
          <ErrorMessage />
        ) : !(practical.data ?? []).length ? (
          <EmptyState description={t('common.empty')} />
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
              {(practical.data ?? []).map((row, index) => {
                const src = resolveFileUrl(row.face_check_image, PATH_PREFIX_FILE)
                const status = practicalStatus(row.status, t)
                return (
                  <TR key={row.id ?? index}>
                    <TD className="text-center">{index + 1}</TD>
                    <TD>
                      {src ? (
                        <img
                          src={src}
                          alt=""
                          className="size-11 rounded-lg object-cover"
                        />
                      ) : (
                        '—'
                      )}
                    </TD>
                    <TD>
                      {formatDate(row.date || row.attendance_date, i18n.language) ??
                        row.date ??
                        row.attendance_date ??
                        '—'}
                    </TD>
                    <TD>{row.attendance_time || '—'}</TD>
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
                      {typeof row.confirmed_by === 'object' && row.confirmed_by
                        ? row.confirmed_by.name || '—'
                        : row.confirmed_by || '—'}
                    </TD>
                    <TD>
                      {row.confirmed_at
                        ? (formatDateTime(row.confirmed_at, i18n.language) ?? row.confirmed_at)
                        : t('students.showPage.notConfirmed')}
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        )
      ) : null}
    </Panel>
  )
}
