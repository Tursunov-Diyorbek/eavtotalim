import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyTR,
  ErrorMessage,
  ListPageSkeleton,
  Pagination,
  SearchInput,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { routes, studentPath } from '@/config'
import { usePracticalAttendanceStudentsQuery } from '@/features/practical-attendance'
import { usePageState, useSmartBack } from '@/hooks'
import { asFio } from '@/lib/apiPage'
import type { PracticalAttendanceStudent } from '@/types/practical-attendance'

type LocationState = {
  groupName?: string
  fullName?: string
}

const GROUP_NAME_STORAGE = 'eavt.practical-group-name:'

function yearOptions(current: number) {
  const start = Math.min(2020, current - 5)
  const end = current + 1
  const years: number[] = []
  for (let year = end; year >= start; year -= 1) years.push(year)
  return years
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function timeOnDay(row: PracticalAttendanceStudent, day: number) {
  const items = row.practical_attendance?.items ?? []
  const hit = items.find((item) => {
    if (!item.date) return false
    const parsed = new Date(
      item.date.includes('T') || item.date.includes(' ')
        ? item.date.replace(' ', 'T')
        : `${item.date}T00:00:00`,
    )
    return !Number.isNaN(parsed.getTime()) && parsed.getDate() === day
  })
  return hit?.time?.trim() || ''
}

function hasStarted(value: boolean | number | string | null | undefined) {
  return value === true || value === 1 || value === '1'
}

function studentName(row: PracticalAttendanceStudent) {
  return row.full_name?.trim() || asFio(row)
}

export function PracticalAttendanceStudentsPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const state = (useLocation().state ?? {}) as LocationState
  const goBack = useSmartBack(routes.groupPracticalAttendance)
  const now = new Date()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [month, setMonth] = usePageState('month', now.getMonth() + 1)
  const [year, setYear] = usePageState('year', now.getFullYear())
  const [search, setSearch] = usePageState('search', '')
  const years = useMemo(() => yearOptions(now.getFullYear()), [])
  const days = useMemo(() => daysInMonth(year, month), [year, month])
  const today = now.getDate()
  const todayInView =
    year === now.getFullYear() && month === now.getMonth() + 1 && today <= days
  const jumpDay = todayInView ? today : 1
  const jumpRef = useRef<HTMLSpanElement | null>(null)
  const [pendingJump, setPendingJump] = useState(false)

  const storedName =
    id && typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(GROUP_NAME_STORAGE + id)
      : null
  const groupName =
    state.groupName?.trim() ||
    state.fullName?.trim() ||
    storedName?.trim() ||
    ''

  useEffect(() => {
    if (!id) return
    const name = state.groupName?.trim() || state.fullName?.trim()
    if (!name) return
    try {
      sessionStorage.setItem(GROUP_NAME_STORAGE + id, name)
    } catch {
      /* ignore quota */
    }
  }, [id, state.groupName, state.fullName])

  useEffect(() => {
    setPage(1)
  }, [id, search, month, year, pageSize])

  const jumpToDate = () => {
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    if (month !== currentMonth || year !== currentYear) {
      setMonth(currentMonth)
      setYear(currentYear)
    }
    setPendingJump(true)
  }

  const { data, isLoading, isError, error } = usePracticalAttendanceStudentsQuery({
    groupId: id,
    page,
    showCount: pageSize,
    search,
    month,
    year,
  })
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages =
    data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  useEffect(() => {
    if (!pendingJump || isLoading) return
    jumpRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
    setPendingJump(false)
  }, [pendingJump, isLoading, rows, jumpDay])

  return (
    <>
      <Header
        title={`${groupName || t('directorList.group')} — ${t('practicalAttendancePage.groupStudents')}`}
        onBack={goBack}
        actions={
          <div className="flex flex-nowrap items-center gap-2">
            <SearchInput
              size="sm"
              id="practical-student-search"
              name="practical-student-search"
              className="w-52 shrink-0"
              label={t('practicalAttendancePage.searchStudent')}
              placeholder={t('practicalAttendancePage.searchStudent')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              size="sm"
              searchable={false}
              className="shrink-0"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              options={Array.from({ length: 12 }, (_, index) => ({
                value: index + 1,
                label: t(`autodromeAttendancePage.month${index + 1}`),
              }))}
            />
            <Select
              size="sm"
              searchable={false}
              className="shrink-0"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              options={years.map((value) => ({
                value,
                label: String(value),
              }))}
            />
          </div>
        }
      />
      <PageMain fill>
        {isError ? (
          <ErrorMessage>
            {error instanceof Error ? error.message : undefined}
          </ErrorMessage>
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="group-practical-attendance-students">
            <THead>
              <TR>
                <TH
                  column="index"
                  className="sticky left-0 z-20 w-10 min-w-10 max-w-10 bg-fog px-0! text-center"
                >
                  №
                </TH>
                <TH
                  column="fio"
                  className="sticky left-10 z-20 w-52 min-w-52 max-w-52 bg-fog"
                >
                {t('practicalAttendancePage.fio')}
                </TH>
                <TH
                  column="started"
                  className="sticky left-[15.5rem] z-20 w-28 min-w-28 max-w-28 bg-fog text-center"
                >
                  {t('practicalAttendancePage.started')}
                </TH>
                <TH
                  column="count"
                  className="sticky left-[22.5rem] z-20 w-24 min-w-24 max-w-24 border-r border-mist/60 bg-fog text-center"
                >
                  {t('practicalAttendancePage.practicalCount')}
                </TH>
                {Array.from({ length: days }, (_, index) => {
                  const day = index + 1
                  const isJump = day === jumpDay
                  return (
                    <TH
                      key={day}
                      column={`day-${day}`}
                      className={isJump ? 'min-w-20 bg-signal-soft text-center' : 'min-w-20 text-center'}
                    >
                      <span ref={isJump ? jumpRef : undefined}>{day}</span>
                    </TH>
                  )
                })}
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={4 + days} description={t('practicalAttendancePage.empty')} />
              ) : (
                rows.map((row, index) => {
                  const name = studentName(row)
                  const started = hasStarted(row.practical_attendance?.has_started)
                  return (
                    <TR key={row.id}>
                      <TD
                        column="index"
                        className="sticky left-0 z-10 w-10 min-w-10 max-w-10 bg-white px-0! text-center text-muted"
                      >
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD column="fio" className="sticky left-10 z-10 w-52 min-w-52 max-w-52 bg-white whitespace-normal">
                        <Button
                          variant="link"
                          size="inline"
                          onClick={() => navigate(studentPath(row.id))}
                        >
                          {name}
                        </Button>
                      </TD>
                      <TD
                        column="started"
                        className="sticky left-[15.5rem] z-10 w-28 min-w-28 max-w-28 bg-white text-center"
                      >
                        <Badge tone={started ? 'teal' : 'rose'}>
                          {started
                            ? t('practicalAttendancePage.hasStarted')
                            : t('practicalAttendancePage.notStarted')}
                        </Badge>
                      </TD>
                      <TD
                        column="count"
                        className="sticky left-[22.5rem] z-10 w-24 min-w-24 max-w-24 border-r border-mist/60 bg-white text-center"
                      >
                        <Badge>{row.practical_attendance?.count ?? 0}</Badge>
                      </TD>
                      {Array.from({ length: days }, (_, dayIndex) => {
                        const day = dayIndex + 1
                        const time = timeOnDay(row, day)
                        return (
                          <TD
                            key={`${row.id}-${day}`}
                            column={`day-${day}`}
                            className={day === jumpDay ? 'bg-signal-soft/50 text-center' : 'text-center'}
                          >
                            {time ? <Badge>{time}</Badge> : '—'}
                          </TD>
                        )
                      })}
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        )}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={total}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
          actions={
            <Button variant="outline" size="sm" onClick={jumpToDate}>
              {t('practicalAttendancePage.jumpToDate')}
            </Button>
          }
        />
      </PageMain>
    </>
  )
}
