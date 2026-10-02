import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CalendarDays,
  LogIn,
  LogOut,
  MousePointerClick,
  Percent,
  Users,
  Footprints,
} from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  EmptyState,
  EmptyTR,
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
import { usePageState, useSmartBack } from '@/hooks'
import { asFio } from '@/lib/apiPage'
import { cn } from '@/lib/cn'
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

/** `05:30:38` → `05:30` — katakda ixcham. */
function shortTime(value?: string | null) {
  const time = timeOf(value)
  return time.length > 5 ? time.slice(0, 5) : time
}

function isEntry(event: AutodromeAttendanceEvent) {
  return String(event.type ?? '').toLowerCase().includes('entry')
}

function studentName(row: AutodromeAttendanceStudent) {
  const full = row.full_name?.trim()
  if (full) return full
  return asFio(row)
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '—'
}

function yearOptions(current: number) {
  const start = Math.min(2020, current - 5)
  const end = current + 1
  const years: number[] = []
  for (let year = end; year >= start; year -= 1) years.push(year)
  return years
}

/** `YYYY-MM-DD` yoki `DD.MM.YYYY`. */
function parseDay(value: string) {
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  const dmy = value.match(/^(\d{2})\.(\d{2})\.(\d{4})/)
  if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]))
  return null
}

function sameDay(a: Date | null, b: Date) {
  return (
    Boolean(a) &&
    a!.getFullYear() === b.getFullYear() &&
    a!.getMonth() === b.getMonth() &&
    a!.getDate() === b.getDate()
  )
}

function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  tone: 'signal' | 'teal' | 'violet' | 'amber'
}) {
  const tones = {
    signal: 'bg-signal-soft text-signal',
    teal: 'bg-teal-soft text-teal',
    violet: 'bg-violet-soft text-violet',
    amber: 'bg-amber-soft text-amber',
  } as const
  return (
    <div className="flex items-center gap-3 rounded-xl border border-mist/70 bg-white px-4 py-3">
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', tones[tone])}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12px] text-muted">{label}</p>
        <p className="text-lg font-semibold leading-tight text-deep">{value}</p>
      </div>
    </div>
  )
}

export function AutodromeAttendanceStudentsPage() {
  const { t, i18n } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const state = (useLocation().state ?? {}) as LocationState
  const goBack = useSmartBack(routes.autodromeOrganizationGroup)
  const now = new Date()
  const [month, setMonth] = usePageState('month', now.getMonth() + 1)
  const [year, setYear] = usePageState('year', now.getFullYear())
  const [search, setSearch] = usePageState('search', '')
  const [history, setHistory] = useState<HistoryTarget | null>(null)
  const years = useMemo(() => yearOptions(new Date().getFullYear()), [])
  const today = useMemo(() => new Date(), [])

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
  const students = useMemo(() => data?.data ?? [], [data])
  const dates = useMemo(() => data?.dates ?? [], [data])
  const total = data?.total ?? students.length
  const monthLabel = t(`autodromeAttendancePage.month${month}`)

  const visitsByStudent = useMemo(() => {
    const map = new Map<AutodromeAttendanceStudent['id'], number>()
    for (const row of students) {
      map.set(row.id, dates.filter((date) => Boolean(row.attendances?.[date])).length)
    }
    return map
  }, [students, dates])

  const totalVisits = useMemo(
    () => [...visitsByStudent.values()].reduce((sum, value) => sum + value, 0),
    [visitsByStudent],
  )
  const todayKeys = useMemo(
    () => new Set(dates.filter((date) => sameDay(parseDay(date), today))),
    [dates, today],
  )
  const rate =
    students.length && dates.length
      ? Math.round((totalVisits / (students.length * dates.length)) * 100)
      : 0

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
          <div className="flex min-w-0 flex-nowrap items-end gap-2">
            <SearchInput
              size="sm"
              id="autodrome-student-search"
              name="autodrome-student-search"
              className="w-56 shrink-0"
              label={t('statsPage.fish')}
              placeholder={t('autodromeAttendancePage.searchStudent')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              size="sm"
              searchable={false}
              className="w-36 shrink-0"
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
              className="w-28 shrink-0"
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
          <>
            <div className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
              <StatTile
                tone="signal"
                icon={<Users className="size-5" />}
                label={t('autodromeAttendancePage.statStudents')}
                value={total}
              />
              <StatTile
                tone="violet"
                icon={<CalendarDays className="size-5" />}
                label={t('autodromeAttendancePage.statDays')}
                value={dates.length}
              />
              <StatTile
                tone="teal"
                icon={<Footprints className="size-5" />}
                label={t('autodromeAttendancePage.statVisits')}
                value={totalVisits}
              />
              <StatTile
                tone="amber"
                icon={<Percent className="size-5" />}
                label={t('autodromeAttendancePage.statRate')}
                value={`${rate}%`}
              />
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[12px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-teal" />
                {t('autodromeAttendancePage.arrived')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-rose" />
                {t('autodromeAttendancePage.left')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MousePointerClick className="size-3.5" />
                {t('autodromeAttendancePage.clickHint')}
              </span>
            </div>

            <Table storageKey="autodrome-organization-students" className="border-separate border-spacing-0">
              <THead className="z-30 bg-fog">
                <TR>
                  <TH
                    column="index"
                    className="sticky left-0 z-10 w-12 min-w-12 max-w-12 bg-fog px-0! text-center"
                  >
                    №
                  </TH>
                  <TH
                    column="fio"
                    className="sticky left-12 z-10 min-w-72 border-r border-mist/60 bg-fog"
                  >
                    {t('statsPage.fish')}
                  </TH>
                  {dates.map((date) => {
                    const parsed = parseDay(date)
                    const weekday = parsed ? parsed.getDay() || 7 : 0
                    const weekend = weekday === 6 || weekday === 7
                    const isToday = todayKeys.has(date)
                    const label = formatDate(date, i18n.language) ?? date
                    return (
                      <TH
                        key={date}
                        column={`date-${date}`}
                        columnLabel={label}
                        className={cn(
                          'min-w-24 bg-fog px-1.5! text-center',
                          weekend && 'bg-rose-soft',
                          isToday && 'bg-signal-soft',
                        )}
                      >
                        <div className="flex flex-col items-center leading-tight" title={label}>
                          <span
                            className={cn(
                              'text-[10px] font-medium uppercase tracking-wider',
                              weekend ? 'text-rose' : 'text-muted',
                              isToday && 'text-signal',
                            )}
                          >
                            {weekday ? t(`autodromeAttendancePage.weekday${weekday}`) : ''}
                          </span>
                          <span
                            className={cn(
                              'mt-0.5 text-[15px] font-semibold text-deep',
                              isToday && 'text-signal',
                            )}
                          >
                            {parsed ? String(parsed.getDate()).padStart(2, '0') : label}
                          </span>
                        </div>
                      </TH>
                    )
                  })}
                </TR>
              </THead>
              <TBody>
                {students.length === 0 ? (
                  <EmptyTR colSpan={2 + dates.length} description={t('common.empty')} />
                ) : (
                  students.map((row, index) => {
                    const name = studentName(row)
                    const visits = visitsByStudent.get(row.id) ?? 0
                    const percent = dates.length ? Math.round((visits / dates.length) * 100) : 0
                    return (
                      <TR key={row.id} className="group">
                        <TD
                          column="index"
                          className="sticky left-0 z-10 w-12 min-w-12 max-w-12 border-b border-mist/60 bg-white px-0! text-center text-[12px] text-muted group-hover:bg-surface"
                        >
                          {index + 1}
                        </TD>
                        <TD
                          column="fio"
                          className="sticky left-12 z-10 border-b border-r border-mist/60 bg-white group-hover:bg-surface"
                        >
                          <button
                            type="button"
                            onClick={() => navigate(studentPath(row.id))}
                            className="flex w-full min-w-0 items-center gap-3 text-left"
                            title={name}
                          >
                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-signal-soft text-[12px] font-semibold text-signal">
                              {initials(name)}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-medium text-deep hover:text-signal">
                                {name}
                              </span>
                              <span className="mt-1 flex items-center gap-2">
                                <span className="h-1.5 w-full max-w-28 overflow-hidden rounded-full bg-fog">
                                  <span
                                    className="block h-full rounded-full bg-teal"
                                    style={{ width: `${percent}%` }}
                                  />
                                </span>
                                <span className="shrink-0 text-[11px] text-muted">
                                  {t('autodromeAttendancePage.attendedDays')}: {visits}/{dates.length}
                                </span>
                              </span>
                            </span>
                          </button>
                        </TD>
                        {dates.map((date) => {
                          const cell = row.attendances?.[date]
                          const arrived = shortTime(cell?.first_entry)
                          const left = shortTime(cell?.last_exit)
                          const isToday = todayKeys.has(date)
                          return (
                            <TD
                              key={`${row.id}-${date}`}
                              column={`date-${date}`}
                              className={cn(
                                'border-b border-mist/60 px-1.5! py-2! text-center',
                                isToday && 'bg-signal-soft/30',
                              )}
                            >
                              {cell ? (
                                <button
                                  type="button"
                                  onClick={() => setHistory({ name, date, attendance: cell })}
                                  title={`${t('autodromeAttendancePage.arrived')}: ${timeOf(cell.first_entry) || '—'} · ${t('autodromeAttendancePage.left')}: ${timeOf(cell.last_exit) || '—'}`}
                                  className="mx-auto flex w-full max-w-24 flex-col gap-0.5 rounded-lg border border-mist/70 bg-white px-2 py-1.5 text-[12px] tabular-nums shadow-[0_1px_2px_rgba(15,36,48,0.04)] transition hover:-translate-y-px hover:border-signal/40 hover:shadow-[0_4px_12px_rgba(15,36,48,0.08)] focus-visible:ring-2 focus-visible:ring-signal/30 focus-visible:outline-none"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <LogIn className="size-3 shrink-0 text-teal" />
                                    <span className={arrived ? 'font-medium text-ink' : 'text-muted'}>
                                      {arrived || '—'}
                                    </span>
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <LogOut className="size-3 shrink-0 text-rose" />
                                    <span className={left ? 'font-medium text-ink' : 'text-muted'}>
                                      {left || '—'}
                                    </span>
                                  </span>
                                </button>
                              ) : (
                                <span className="mx-auto block size-1.5 rounded-full bg-mist" />
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
          </>
        )}
      </PageMain>

      <Modal
        open={Boolean(history)}
        onClose={() => setHistory(null)}
        title={`${history?.name ?? ''} — ${t('autodromeAttendancePage.history')}`}
      >
        {history ? (
          <div className="space-y-4 p-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="signal">
                {formatDate(history.date, i18n.language) ?? history.date}
              </Badge>
              <Badge tone="teal">
                {t('autodromeAttendancePage.arrived')}: {timeOf(history.attendance.first_entry) || '—'}
              </Badge>
              <Badge tone="rose">
                {t('autodromeAttendancePage.left')}: {timeOf(history.attendance.last_exit) || '—'}
              </Badge>
            </div>
            <SafeImage
              src={ensureAttendanceMediaUrl(history.attendance.current_image)}
              alt={history.name}
              className="mx-auto aspect-video w-full max-w-md rounded-xl"
              label={t('common.noImage')}
            />
            {events.length === 0 ? (
              <EmptyState
                className="border-0 py-4"
                description={t('autodromeAttendancePage.noHistory')}
              />
            ) : (
              <ol className="relative ml-2 space-y-3 border-l border-mist pl-5">
                {events.map((event, index) => {
                  const entry = isEntry(event)
                  return (
                    <li key={`${event.timestamp ?? index}-${index}`} className="relative">
                      <span
                        className={cn(
                          'absolute top-1/2 -left-[31px] grid size-5 -translate-y-1/2 place-items-center rounded-full ring-4 ring-white',
                          entry ? 'bg-teal-soft text-teal' : 'bg-rose-soft text-rose',
                        )}
                      >
                        {entry ? <LogIn className="size-3" /> : <LogOut className="size-3" />}
                      </span>
                      <div className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2 text-sm">
                        <span className="font-medium text-ink">
                          {entry
                            ? t('autodromeAttendancePage.arrived')
                            : t('autodromeAttendancePage.left')}
                        </span>
                        <span className="font-medium tabular-nums text-muted">
                          {timeOf(event.timestamp) || event.timestamp || '—'}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        ) : null}
      </Modal>
    </>
  )
}
