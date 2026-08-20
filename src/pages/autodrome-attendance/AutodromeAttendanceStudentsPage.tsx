import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Modal,
  SafeImage,
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
import {
  ensureAttendanceMediaUrl,
  useAutodromeStudentAttendancesQuery,
} from '@/features/autodrome-attendance'
import { useSmartBack } from '@/hooks'
import { asFio } from '@/lib/apiPage'
import { formatDate } from '@/lib/format'
import type {
  AutodromeAttendanceEvent,
  AutodromeAttendanceStudent,
  AutodromeDayAttendance,
} from '@/types/autodrome-attendance'

type LocationState = {
  groupName?: string
}

const GROUP_NAME_STORAGE = 'eavt.autodrome-group-name:'

type HistoryTarget = {
  name: string
  date: string
  attendance: AutodromeDayAttendance
}

function timeOf(value?: string | null) {
  if (!value) return ''
  const match = value.match(/(\d{2}:\d{2}(?::\d{2})?)/)
  return match?.[1] ?? value
}

function isEntry(event: AutodromeAttendanceEvent) {
  return String(event.type ?? '').toLowerCase().includes('entry')
}

function studentName(row: AutodromeAttendanceStudent) {
  const full = row.full_name?.trim()
  if (full) return full
  return asFio(row)
}

function yearOptions(current: number) {
  const start = Math.min(2020, current - 5)
  const end = current + 1
  const years: number[] = []
  for (let year = end; year >= start; year -= 1) years.push(year)
  return years
}

export function AutodromeAttendanceStudentsPage() {
  const { t, i18n } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const state = (useLocation().state ?? {}) as LocationState
  const goBack = useSmartBack(routes.autodromeOrganizationGroup)
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [search, setSearch] = useState('')
  const [history, setHistory] = useState<HistoryTarget | null>(null)
  const years = useMemo(() => yearOptions(now.getFullYear()), [])

  const storedName =
    id && typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(GROUP_NAME_STORAGE + id)
      : null
  const groupName = state.groupName?.trim() || storedName?.trim() || ''

  useEffect(() => {
    if (!id || !state.groupName?.trim()) return
    try {
      sessionStorage.setItem(GROUP_NAME_STORAGE + id, state.groupName.trim())
    } catch {
      /* ignore quota */
    }
  }, [id, state.groupName])

  const { data, isLoading, isError } = useAutodromeStudentAttendancesQuery({
    groupId: id,
    month,
    year,
    search,
  })
  const students = data?.data ?? []
  const dates = data?.dates ?? []
  const total = data?.total ?? students.length
  const monthLabel = t(`autodromeAttendancePage.month${month}`)

  const events = (history?.attendance.events ?? []).slice().sort((a, b) => {
    const left = a.timestamp ?? ''
    const right = b.timestamp ?? ''
    return left.localeCompare(right)
  })

  return (
    <>
      <Header
        title={
          <>
            <span>
              {groupName || t('directorList.group')} —{' '}
              {t('autodromeAttendancePage.groupStudents')}
            </span>{' '}
            <span className="text-teal">
              {t('autodromeAttendancePage.monthAttendance', { month: monthLabel })}
            </span>
          </>
        }
        onBack={goBack}
        actions={
          <div className="flex min-w-0 flex-nowrap items-center gap-2">
            <Badge tone="teal" className="shrink-0">
              {t('autodromeAttendancePage.totalHash', { count: total })}
            </Badge>
            <SearchInput
              size="sm"
              id="autodrome-student-search"
              name="autodrome-student-search"
              className="w-52 shrink-0"
              label={t('statsPage.fish')}
              placeholder={t('autodromeAttendancePage.searchStudent')}
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
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : dates.length === 0 ? (
          <EmptyState description={t('autodromeAttendancePage.emptyMonth')} />
        ) : (
          <Table storageKey="autodrome-organization-students">
            <THead>
              <TR>
                <TH column="index" className="sticky left-0 z-20 w-10 bg-fog">
                  №
                </TH>
                <TH column="fio" className="sticky left-10 z-20 min-w-52 bg-fog">
                  {t('statsPage.fish')}
                </TH>
                {dates.map((date) => (
                  <TH
                    key={date}
                    column={`date-${date}`}
                    className="min-w-36 text-center"
                  >
                    {formatDate(date, i18n.language) ?? date}
                  </TH>
                ))}
              </TR>
            </THead>
            <TBody>
              {students.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={2 + dates.length}>
                    <EmptyState
                      className="border-0 py-4"
                      description={t('common.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                students.map((row, index) => {
                  const name = studentName(row)
                  return (
                    <TR key={row.id}>
                      <TD
                        column="index"
                        className="sticky left-0 z-10 bg-white text-center text-muted"
                      >
                        {index + 1}
                      </TD>
                      <TD column="fio" className="sticky left-10 z-10 bg-white">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-0 py-0 font-medium text-signal hover:underline"
                          onClick={() => navigate(studentPath(row.id))}
                        >
                          {name}
                        </Button>
                      </TD>
                      {dates.map((date) => {
                        const cell = row.attendances?.[date]
                        const arrived = timeOf(cell?.first_entry)
                        const left = timeOf(cell?.last_exit)
                        const hasEvents = Boolean(cell?.events?.length)
                        return (
                          <TD
                            key={`${row.id}-${date}`}
                            column={`date-${date}`}
                            className="text-center"
                          >
                            {cell ? (
                              <div className="flex flex-col items-center gap-1 text-[11px]">
                                <span className="text-teal">
                                  {t('autodromeAttendancePage.arrived')}: {arrived || '—'}
                                </span>
                                <span className="text-rose">
                                  {t('autodromeAttendancePage.left')}: {left || '—'}
                                </span>
                                {hasEvents ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setHistory({
                                        name,
                                        date,
                                        attendance: cell,
                                      })
                                    }
                                  >
                                    {t('autodromeAttendancePage.history')}
                                  </Button>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
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
      </PageMain>

      <Modal
        open={Boolean(history)}
        onClose={() => setHistory(null)}
        title={`${history?.name ?? ''} — ${t('autodromeAttendancePage.history')}`}
      >
        {history ? (
          <div className="space-y-3 p-1">
            <p className="text-sm text-muted">
              {formatDate(history.date, i18n.language) ?? history.date}
            </p>
            <SafeImage
              src={ensureAttendanceMediaUrl(history.attendance.current_image)}
              alt={history.name}
              className="mx-auto aspect-video w-full max-w-md rounded-lg"
              label={t('common.noImage')}
            />
            {events.length === 0 ? (
              <EmptyState
                className="border-0 py-4"
                description={t('common.empty')}
              />
            ) : (
              <ul className="space-y-1.5 text-sm">
                {events.map((event, index) => (
                  <li
                    key={`${event.timestamp ?? index}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-md bg-fog px-3 py-2"
                  >
                    <span className="font-medium text-ink">
                      {isEntry(event)
                        ? t('autodromeAttendancePage.arrived')
                        : t('autodromeAttendancePage.left')}
                    </span>
                    <span className="text-muted">
                      {timeOf(event.timestamp) || event.timestamp || '—'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </Modal>
    </>
  )
}
