import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BarChart3, List, Lock, RefreshCw, Users, UserX } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  DateInput,
  EmptyTR,
  ErrorMessage,
  HeaderTR,
  ListPageSkeleton,
  Notification,
  Pagination,
  ShowButton,
  TBody,
  TD,
  TH,
  THead,
  Table,
  Tabs,
  Tooltip,
  TR,
  notify,
} from '@/components/ui'
import { groupAbsenceStudentsPath, studentPath } from '@/config'
import { useAuth } from '@/features/auth'
import {
  useDailyAttendanceQuery,
  useGroupAbsenceQuery,
  useRefreshDailyAttendanceMutation,
  useStudentAbsenceQuery,
} from '@/features/attendance-statistics'
import { usePageState, useUrlTab } from '@/hooks'
import { StudentAccessModal } from '@/pages/students/StudentAccessModal'
import type { AbsenceStudent } from '@/types/attendance-statistics'
import {
  AttendanceBadge,
  ChartBars,
  PageToolbar,
  absenceAverage,
  dailyAttendanceText,
  studentJshir,
  studentName,
  studentPassport,
  todayIso,
} from './attendanceUi'

const TABS = ['groups', 'incomplete', 'absent'] as const
type TabKey = (typeof TABS)[number]
const REFRESH_LOCK_MS = 2 * 60 * 1000

export function AttendanceStatisticsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useUrlTab(TABS, 'groups')

  const tabItems = useMemo(
    () =>
      [
        {
          value: 'groups' as const,
          label: t('attendanceStatsPage.tabGroups'),
          icon: <BarChart3 className="size-3.5" aria-hidden />,
        },
        {
          value: 'incomplete' as const,
          label: t('attendanceStatsPage.tabIncomplete'),
          icon: <Users className="size-3.5" aria-hidden />,
        },
        {
          value: 'absent' as const,
          label: t('attendanceStatsPage.tabAbsent'),
          icon: <UserX className="size-3.5" aria-hidden />,
        },
      ] satisfies Array<{ value: TabKey; label: string; icon: ReactNode }>,
    [t],
  )

  return (
    <>
      <Header title={t('nav.groupsAttendanceStatistics')} />
      <PageMain fill>
        <Tabs
          aria-label={t('nav.groupsAttendanceStatistics')}
          items={tabItems}
          value={tab}
          onChange={(value) => setTab(value as TabKey)}
        />
        {tab === 'groups' ? <DailyGroupsPanel /> : null}
        {tab === 'incomplete' ? <IncompleteGroupsPanel /> : null}
        {tab === 'absent' ? <AbsentStudentsPanel /> : null}
      </PageMain>
    </>
  )
}

function usePaging() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  return { page, setPage, pageSize, setPageSize }
}

function DailyGroupsPanel() {
  const { t } = useTranslation()
  const paging = usePaging()
  const [date, setDate] = usePageState('dailyDate', todayIso)
  const [view, setView] = usePageState<'chart' | 'table'>('dailyView', 'chart')
  const [lockedUntil, setLockedUntil] = useState(0)
  const query = useDailyAttendanceQuery({
    date,
    page: paging.page,
    pageSize: paging.pageSize,
  })
  const refresh = useRefreshDailyAttendanceMutation()
  const locked = lockedUntil > Date.now()

  useEffect(() => {
    if (!lockedUntil) return
    const wait = lockedUntil - Date.now()
    if (wait <= 0) return
    const timer = window.setTimeout(() => setLockedUntil(0), wait)
    return () => window.clearTimeout(timer)
  }, [lockedUntil])

  const rows = query.data?.data ?? []
  const points = rows
    .filter((row) => row.class_date_special_date != null && Number(row.timetable) === 1)
    .map((row, index) => ({
      key: String(row.id ?? `${row.name}-${index}`),
      name: row.name || '—',
      value: Number(row.class_date_special_date?.average_attendance ?? 0) || 0,
    }))

  function changeDate(next: string) {
    setDate(next)
    paging.setPage(1)
  }

  function onRefresh() {
    if (locked) {
      notify.warning(t('attendanceStatsPage.refreshLimit'))
      return
    }
    refresh.mutate(date, {
      onSuccess: () => setLockedUntil(Date.now() + REFRESH_LOCK_MS),
      onError: (err) => notify.error(err.message || t('attendanceStatsPage.refreshFail')),
    })
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <PageToolbar title={t('attendanceStatsPage.groupsTitle')}>
        <DateInput
          size="sm"
          className="w-44 shrink-0"
          label={t('attendanceStatsPage.byDate')}
          value={date}
          onChange={(event) => changeDate(event.target.value)}
        />
        <Button
          variant="primary"
          disabled={locked}
          loading={refresh.isPending}
          onClick={onRefresh}
        >
          <RefreshCw className="size-3.5" aria-hidden />
          {t('common.refresh')}
        </Button>
        <Tooltip content={t('attendanceStatsPage.chartView')} side="bottom">
          <Button
            variant="outline"
            size="icon"
            active={view === 'chart'}
            aria-label={t('attendanceStatsPage.chartView')}
            onClick={() => setView('chart')}
          >
            <BarChart3 className="size-4" aria-hidden />
          </Button>
        </Tooltip>
        <Tooltip content={t('attendanceStatsPage.tableView')} side="bottom">
          <Button
            variant="outline"
            size="icon"
            active={view === 'table'}
            aria-label={t('attendanceStatsPage.tableView')}
            onClick={() => setView('table')}
          >
            <List className="size-4" aria-hidden />
          </Button>
        </Tooltip>
      </PageToolbar>

      {query.isError ? (
        <ErrorMessage />
      ) : query.isLoading ? (
        <ListPageSkeleton rows={8} />
      ) : view === 'chart' ? (
        <ChartBars points={points} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <Table fill>
            <THead>
              <HeaderTR>
                <TH className="w-14 text-center">№</TH>
                <TH>{t('attendanceStatsPage.groupName')}</TH>
                <TH className="text-center">{t('attendanceStatsPage.average')}</TH>
              </HeaderTR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={3} description={t('common.empty')} />
              ) : (
                rows.map((row, index) => {
                  const mark = dailyAttendanceText(row)
                  return (
                    <TR key={row.id ?? index}>
                      <TD className="text-center text-muted">
                        {(paging.page - 1) * paging.pageSize + index + 1}
                      </TD>
                      <TD className="font-semibold text-deep">{row.name || '—'}</TD>
                      <TD className="text-center">
                        {mark.kind === 'percent' ? (
                          <AttendanceBadge
                            value={mark.value}
                            empty={t('attendanceStatsPage.notMarked')}
                          />
                        ) : (
                          <Badge tone="neutral">{t(`attendanceStatsPage.${mark.text}`)}</Badge>
                        )}
                      </TD>
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        </div>
      )}

      <Pagination
        className="shrink-0"
        page={paging.page}
        pageSize={paging.pageSize}
        total={query.data?.total_items ?? 0}
        totalPages={query.data?.last_page ?? 1}
        storageKey="attendance-daily"
        onPageChange={paging.setPage}
        onPageSizeChange={(size) => {
          paging.setPageSize(size)
          paging.setPage(1)
        }}
      />
    </section>
  )
}

function IncompleteGroupsPanel() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const paging = usePaging()
  const [date, setDate] = usePageState('incompleteDate', todayIso)
  const query = useGroupAbsenceQuery({
    date,
    page: paging.page,
    pageSize: paging.pageSize,
  })
  const rows = query.data?.data ?? []

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <PageToolbar title={t('attendanceStatsPage.incompleteTitle')}>
        <DateInput
          size="sm"
          className="w-44 shrink-0"
          label={t('attendanceStatsPage.byDate')}
          value={date}
          onChange={(event) => {
            setDate(event.target.value)
            paging.setPage(1)
          }}
        />
      </PageToolbar>
      <Notification tone="warning" className="shrink-0">
        {t('attendanceStatsPage.incompleteHint')}
      </Notification>

      {query.isError ? (
        <ErrorMessage />
      ) : query.isLoading ? (
        <ListPageSkeleton rows={8} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <Table fill>
            <THead>
              <HeaderTR>
                <TH className="w-14 text-center">№</TH>
                <TH>{t('attendanceStatsPage.groupName')}</TH>
                <TH>{t('attendanceStatsPage.attendance')}</TH>
                <TH>{t('attendanceStatsPage.eduType')}</TH>
                <TH className="text-center">{t('attendanceStatsPage.average')}</TH>
                <TH className="text-center">{t('common.actions')}</TH>
              </HeaderTR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={6} description={t('common.empty')} />
              ) : (
                rows.map((row, index) => {
                  const avg = absenceAverage(row)
                  const groupId = row.group?.id
                  const open = () => {
                    if (groupId == null) return
                    navigate(groupAbsenceStudentsPath(groupId, date))
                  }
                  return (
                    <TR key={row.group?.id ?? index}>
                      <TD className="text-center text-muted">
                        {(paging.page - 1) * paging.pageSize + index + 1}
                      </TD>
                      <TD>
                        {groupId == null ? (
                          row.group?.name || '—'
                        ) : (
                          <Button variant="link" size="inline" onClick={open}>
                            {row.group?.name || '—'}
                          </Button>
                        )}
                      </TD>
                      <TD>
                        {Number(row.class_date?.is_monitored) === 0 ? (
                          <Badge tone="rose">{t('attendanceStatsPage.absent')}</Badge>
                        ) : (
                          '—'
                        )}
                      </TD>
                      <TD>{row.group?.edu_type?.short_name || '—'}</TD>
                      <TD className="text-center">
                        {avg.kind === 'percent' ? (
                          <AttendanceBadge
                            value={avg.value}
                            empty={t('attendanceStatsPage.notMarkedLower')}
                          />
                        ) : (
                          <Badge tone="neutral">{t('attendanceStatsPage.notMarkedLower')}</Badge>
                        )}
                      </TD>
                      <TD>
                        <div className="flex justify-center">
                          <ShowButton disabled={groupId == null} onClick={open} />
                        </div>
                      </TD>
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        </div>
      )}

      <Pagination
        className="shrink-0"
        page={paging.page}
        pageSize={paging.pageSize}
        total={query.data?.total_items ?? 0}
        totalPages={query.data?.last_page ?? 1}
        storageKey="attendance-incomplete"
        onPageChange={paging.setPage}
        onPageSizeChange={(size) => {
          paging.setPageSize(size)
          paging.setPage(1)
        }}
      />
    </section>
  )
}

function AbsentStudentsPanel() {
  const paging = usePaging()
  const [date, setDate] = usePageState('absentDate', todayIso)
  const query = useStudentAbsenceQuery({
    date,
    page: paging.page,
    pageSize: paging.pageSize,
  })

  return (
    <AbsentStudentsBody
      titleKey="attendanceStatsPage.absentTitle"
      date={date}
      onDateChange={(next) => {
        setDate(next)
        paging.setPage(1)
      }}
      page={paging.page}
      pageSize={paging.pageSize}
      onPageChange={paging.setPage}
      onPageSizeChange={(size) => {
        paging.setPageSize(size)
        paging.setPage(1)
      }}
      storageKey="attendance-absent"
      loading={query.isLoading}
      error={query.isError}
      rows={query.data?.data ?? []}
      total={query.data?.total_items ?? 0}
      totalPages={query.data?.last_page ?? 1}
    />
  )
}

export function AbsentStudentsBody({
  titleKey,
  date,
  onDateChange,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  storageKey,
  loading,
  error,
  rows,
  total,
  totalPages,
}: {
  titleKey: string
  date: string
  onDateChange: (next: string) => void
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  storageKey: string
  loading: boolean
  error: boolean
  rows: Array<{
    student?: AbsenceStudent | null
    group?: { name?: string | null } | null
    class_date?: { is_monitored?: number | null; average_attendance?: number | string | null } | null
    class_date_special_date?: unknown
  }>
  total: number
  totalPages: number
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const canPassword = hasPermission('show-user-password')
  const [access, setAccess] = useState<AbsenceStudent | null>(null)

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <PageToolbar title={t(titleKey)}>
        <DateInput
          size="sm"
          className="w-44 shrink-0"
          label={t('attendanceStatsPage.byDate')}
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
        />
      </PageToolbar>

      {error ? (
        <ErrorMessage />
      ) : loading ? (
        <ListPageSkeleton rows={8} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <Table fill storageKey={storageKey}>
            <THead>
              <HeaderTR>
                <TH className="w-14 text-center">№</TH>
                <TH>{t('attendanceStatsPage.fio')}</TH>
                <TH>{t('attendanceStatsPage.group')}</TH>
                <TH>{t('attendanceStatsPage.passport')}</TH>
                <TH>{t('attendanceStatsPage.jshir')}</TH>
                <TH>{t('attendanceStatsPage.attendance')}</TH>
                <TH className="text-center">{t('attendanceStatsPage.average')}</TH>
                <TH className="text-center">{t('common.actions')}</TH>
              </HeaderTR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={8} description={t('common.empty')} />
              ) : (
                rows.map((row, index) => {
                  const student = row.student
                  const name = studentName(student)
                  const avg = absenceAverage(row)
                  return (
                    <TR key={student?.id ?? index}>
                      <TD className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD>
                        {student?.id == null ? (
                          name || '—'
                        ) : (
                          <Button
                            variant="link"
                            size="inline"
                            onClick={() => navigate(studentPath(student.id!))}
                          >
                            {name || '—'}
                          </Button>
                        )}
                      </TD>
                      <TD className="text-center">{row.group?.name || '—'}</TD>
                      <TD className="whitespace-nowrap">{studentPassport(student) || '—'}</TD>
                      <TD className="whitespace-nowrap">{studentJshir(student) || '—'}</TD>
                      <TD>
                        {Number(row.class_date?.is_monitored) === 0 ? (
                          <Badge tone="rose">{t('attendanceStatsPage.absent')}</Badge>
                        ) : (
                          '—'
                        )}
                      </TD>
                      <TD className="text-center">
                        {avg.kind === 'percent' ? (
                          <AttendanceBadge
                            value={avg.value}
                            empty={t('attendanceStatsPage.notMarkedLower')}
                          />
                        ) : (
                          <Badge tone="neutral">{t('attendanceStatsPage.notMarkedLower')}</Badge>
                        )}
                      </TD>
                      <TD>
                        <div className="flex items-center justify-center gap-1">
                          {canPassword ? (
                            <Button
                              variant="soft"
                              size="icon-sm"
                              aria-label={t('students.showPage.autoLoginTitle')}
                              onClick={() => student && setAccess(student)}
                            >
                              <Lock className="size-3.5" />
                            </Button>
                          ) : null}
                          <ShowButton
                            disabled={student?.id == null}
                            onClick={() => student?.id != null && navigate(studentPath(student.id))}
                          />
                        </div>
                      </TD>
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        </div>
      )}

      <Pagination
        className="shrink-0"
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        storageKey={storageKey}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      <StudentAccessModal
        open={access != null}
        student={
          access
            ? {
                id: Number(access.id ?? 0),
                user_id: access.user_id == null ? null : Number(access.user_id),
                last_name: access.last_name,
                first_name: access.first_name,
                middle_name: access.middle_name,
              }
            : null
        }
        onClose={() => setAccess(null)}
      />
    </section>
  )
}
