import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  CalendarDays,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  DeleteButton,
  EmptyState,
  ErrorMessage,
  FilterTH,
  Pagination,
  SearchInput,
  Select,
  ShowButton,
  Skeleton,
  Table,
  Tabs,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { groupShowPath } from '@/config'
import { useAuth } from '@/features/auth'
import {
  parseWeekDays,
  useDeleteGroupMutation,
  useGroupCountsQuery,
  useGroupsQuery,
  useRefreshGroupAttendanceMutation,
} from '@/features/groups'
import { parsePercent } from '@/features/lessons'
import { useUrlTab } from '@/hooks'
import { formatDate, formatNumber } from '@/lib/format'
import type { GroupEduStatusTab, GroupItem } from '@/types/groups'
import { CreateGroupModal } from './CreateGroupModal'

const EDU_STATUS_TABS = ['all', '0', '1', '2'] as const

const DAYS = [
  { id: 1, label: 'Du' },
  { id: 2, label: 'Se' },
  { id: 3, label: 'Cho' },
  { id: 4, label: 'Pa' },
  { id: 5, label: 'Ju' },
  { id: 6, label: 'Sh' },
]

type DateSortKey = 'edu_starting_date' | 'edu_ending_date'

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border border-mist/70 bg-white p-3">
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" rounded="lg" />
      ))}
    </div>
  )
}

function TimeRangeFilter({
  start,
  end,
  startLabel,
  endLabel,
  onStartChange,
  onEndChange,
  onClear,
  clearLabel,
}: {
  start: string
  end: string
  startLabel: string
  endLabel: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  onClear: () => void
  clearLabel: string
}) {
  const filled = Boolean(start || end)
  return (
    <div className="flex min-w-52 items-center gap-1">
      <input
        type="time"
        aria-label={startLabel}
        value={start}
        onChange={(e) => onStartChange(e.target.value)}
        className="h-9 min-w-0 flex-1 rounded-lg border border-mist/90 bg-white px-1.5 text-[13px] text-deep outline-none scheme-light focus:border-signal focus:ring-2 focus:ring-signal/20"
      />
      <span className="text-[11px] text-muted">–</span>
      <input
        type="time"
        aria-label={endLabel}
        value={end}
        onChange={(e) => onEndChange(e.target.value)}
        className="h-9 min-w-0 flex-1 rounded-lg border border-mist/90 bg-white px-1.5 text-[13px] text-deep outline-none scheme-light focus:border-signal focus:ring-2 focus:ring-signal/20"
      />
      {filled ? (
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 shrink-0"
          aria-label={clearLabel}
          onClick={onClear}
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )
}

function AttendanceRing({ percent }: { percent: number }) {
  const color =
    percent < 70 ? 'var(--color-rose)' : percent < 90 ? 'var(--color-amber)' : 'var(--color-teal)'
  const p = Math.min(100, Math.max(0, percent))
  return (
    <div
      className="relative size-14 shrink-0 rounded-full"
      style={{
        background: `conic-gradient(${color} ${p * 3.6}deg, var(--color-fog) 0)`,
      }}
    >
      <div className="absolute inset-1 flex items-center justify-center rounded-full bg-white text-[11px] font-semibold text-deep">
        {p}%
      </div>
    </div>
  )
}

export function GroupsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission, hasRole, isSuperAdmin } = useAuth()
  const canCreate = isSuperAdmin || hasPermission('store-group')
  const canDelete =
    (isSuperAdmin || hasPermission('delete-group')) &&
    !hasRole('superior_limit_manager') &&
    !hasRole('superior_region_limit_manager')
  const showOrg = isSuperAdmin || hasPermission('view-cross-organization-data')

  const [tab, setTab] = useUrlTab(EDU_STATUS_TABS, '1')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [timetable, setTimetable] = useState('')
  const [weekDays, setWeekDays] = useState<number[]>([])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [sortId, setSortId] = useState('')
  const [dateSort, setDateSort] = useState<{ key: DateSortKey; order: 'ASC' | 'DESC' } | null>(
    null,
  )
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteRow, setDeleteRow] = useState<GroupItem | null>(null)

  useEffect(() => {
    setPage(1)
  }, [tab, search, timetable, weekDays, startTime, endTime, sortId, dateSort, pageSize])

  const nameSort =
    sortId === '1'
      ? { sortKey: 'name_uz', sortOrder: 'ASC' as const }
      : sortId === '2'
        ? { sortKey: 'name_uz', sortOrder: 'DESC' as const }
        : {}

  const sort = dateSort
    ? { sortKey: dateSort.key, sortOrder: dateSort.order }
    : nameSort

  const { data: counts, refetch: refetchCounts } = useGroupCountsQuery()
  const { data, isLoading, isError, refetch, isFetching } = useGroupsQuery({
    page,
    showCount: pageSize,
    eduStatus: tab,
    name: search.trim() || undefined,
    timetable,
    weekDays,
    startTime,
    endTime,
    ...sort,
  })
  const deleteMutation = useDeleteGroupMutation()
  const attendanceMutation = useRefreshGroupAttendanceMutation()

  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  const tabItems = useMemo(
    () => [
      {
        value: 'all' as const,
        label: `${t('groupsPage.tabAll')}: ${formatNumber(counts?.all ?? 0)} ${t('groupsPage.pcs')}`,
      },
      {
        value: '1' as const,
        label: `${t('groupsPage.tabActive')}: ${formatNumber(counts?.active ?? 0)} ${t('groupsPage.pcs')}`,
      },
      {
        value: '2' as const,
        label: `${t('groupsPage.tabFinished')}: ${formatNumber(counts?.finished ?? 0)} ${t('groupsPage.pcs')}`,
      },
      {
        value: '0' as const,
        label: `${t('groupsPage.tabNew')}: ${formatNumber(counts?.new ?? 0)} ${t('groupsPage.pcs')}`,
      },
    ],
    [t, counts],
  )

  const toggleDay = (id: number) => {
    setWeekDays((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    )
  }

  const toggleDateSort = (key: DateSortKey) => {
    setSortId('')
    setDateSort((prev) => {
      if (prev?.key !== key) return { key, order: 'ASC' }
      return { key, order: prev.order === 'ASC' ? 'DESC' : 'ASC' }
    })
  }

  const confirmDelete = () => {
    if (!deleteRow) return
    deleteMutation.mutate(deleteRow.id, {
      onSuccess: () => {
        notify.success(t('common.deleted'))
        setDeleteRow(null)
        void refetchCounts()
      },
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  const refreshAttendance = (id: number) => {
    attendanceMutation.mutate(id, {
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  return (
    <>
      <Header
        title={t('groupsPage.title')}
        actions={
          <>
            <Select
              size="sm"
              clearable
              searchable={false}
              className="w-52"
              label={t('groupsPage.sort')}
              placeholder={t('groupsPage.sort')}
              value={sortId}
              onChange={(e) => {
                setDateSort(null)
                setSortId(e.target.value)
              }}
              options={[
                { value: '1', label: t('groupsPage.sortNameAsc') },
                { value: '2', label: t('groupsPage.sortNameDesc') },
              ]}
            />
            <Button
              variant="secondary"
              size="sm"
              loading={isFetching && !isLoading}
              onClick={() => {
                void refetch()
                void refetchCounts()
              }}
            >
              <RefreshCw className="size-3.5" aria-hidden />
              {t('common.refresh')}
            </Button>
            {canCreate ? (
              <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="size-3.5" aria-hidden />
                {t('groupsPage.create')}
              </Button>
            ) : null}
          </>
        }
      />

      <PageMain fill>
        <Tabs
          items={tabItems}
          value={tab}
          onChange={(value) => {
            setTab(value as GroupEduStatusTab)
            setWeekDays([])
            setDateSort(null)
          }}
          aria-label={t('groupsPage.title')}
        />

        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <TableSkeleton />
        ) : (
          <Table storageKey="groups-list" className="!min-w-350">
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="w-12 text-center">№</TH>
                <TH className="min-w-40">{t('groupsPage.colName')}</TH>
                {showOrg ? <TH>{t('groupsPage.colOrg')}</TH> : null}
                <TH>{t('groupsPage.colEduType')}</TH>
                <TH className="text-center">{t('groupsPage.colStudents')}</TH>
                <TH className="text-center">{t('groupsPage.colPrice')}</TH>
                <TH className="min-w-28">{t('groupsPage.colStart')}</TH>
                <TH className="min-w-28">{t('groupsPage.colEnd')}</TH>
                <TH className="min-w-52">{t('groupsPage.colTime')}</TH>
                <TH className="min-w-56">{t('groupsPage.colDays')}</TH>
                <TH className="min-w-40">{t('groupsPage.timetable')}</TH>
                <TH className="text-center">{t('groupsPage.colAttendance')}</TH>
                <TH>{t('common.actions')}</TH>
              </TR>
              <TR className="hover:bg-transparent bg-white">
                <FilterTH />
                <FilterTH>
                  <SearchInput
                    size="sm"
                    label={t('groupsPage.colName')}
                    placeholder={t('groupsPage.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </FilterTH>
                {showOrg ? <FilterTH /> : null}
                <FilterTH />
                <FilterTH />
                <FilterTH />
                <FilterTH>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => toggleDateSort('edu_starting_date')}
                  >
                    {dateSort?.key === 'edu_starting_date' && dateSort.order === 'ASC' ? (
                      <ArrowUpWideNarrow className="size-4" />
                    ) : (
                      <ArrowDownWideNarrow className="size-4" />
                    )}
                  </Button>
                </FilterTH>
                <FilterTH>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => toggleDateSort('edu_ending_date')}
                  >
                    {dateSort?.key === 'edu_ending_date' && dateSort.order === 'ASC' ? (
                      <ArrowUpWideNarrow className="size-4" />
                    ) : (
                      <ArrowDownWideNarrow className="size-4" />
                    )}
                  </Button>
                </FilterTH>
                <FilterTH>
                  <TimeRangeFilter
                    start={startTime}
                    end={endTime}
                    startLabel={t('groupsPage.startTime')}
                    endLabel={t('groupsPage.endTime')}
                    onStartChange={setStartTime}
                    onEndChange={setEndTime}
                    onClear={() => {
                      setStartTime('')
                      setEndTime('')
                    }}
                    clearLabel={t('common.clear')}
                  />
                </FilterTH>
                <FilterTH>
                  <div className="flex flex-nowrap gap-2">
                    {DAYS.map((day) => (
                      <label
                        key={day.id}
                        className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-muted"
                      >
                        {day.label}
                        <Checkbox
                          checked={weekDays.includes(day.id)}
                          onChange={() => toggleDay(day.id)}
                          aria-label={day.label}
                        />
                      </label>
                    ))}
                  </div>
                </FilterTH>
                <FilterTH>
                  <Select
                    size="sm"
                    value={timetable}
                    onChange={(e) => setTimetable(e.target.value)}
                    options={[
                      { value: '', label: t('common.all') },
                      { value: '1', label: t('groupsPage.timetableYes') },
                      { value: '0', label: t('groupsPage.timetableNo') },
                    ]}
                  />
                </FilterTH>
                <FilterTH />
                <FilterTH />
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={showOrg ? 13 : 12}>
                    <EmptyState className="border-0 py-4" description={t('groupsPage.empty')} />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => {
                  const days = parseWeekDays(row.week_days)
                  const missingTimetable =
                    row.timetable === 0 || row.timetable === '0'
                  const report = row.inspection_group_report
                  const attendance =
                    report == null
                      ? null
                      : parsePercent(report.average_attendance)
                  return (
                    <TR key={row.id}>
                      <TD className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD>
                        <button
                          type="button"
                          className="font-medium text-signal hover:underline"
                          onClick={() => navigate(groupShowPath(row.id))}
                        >
                          {row.name || row.name_uz || '—'}
                        </button>
                      </TD>
                      {showOrg ? (
                        <TD className="text-sm">
                          {row.organization?.name || '—'}
                          {row.organization?.inn ? (
                            <span className="ml-1 text-rose">({row.organization.inn})</span>
                          ) : null}
                        </TD>
                      ) : null}
                      <TD>{row.edu_type?.short_name || row.edu_type?.character_name || '—'}</TD>
                      <TD className="text-center">
                        <Badge tone="signal">{formatNumber(row.grouped_students_count ?? 0)}</Badge>
                      </TD>
                      <TD className="text-center">
                        <Badge tone="amber">
                          {row.education_price != null && row.education_price !== ''
                            ? formatNumber(row.education_price)
                            : '—'}
                        </Badge>
                      </TD>
                      <TD className="text-center">
                        <Badge tone="teal">
                          {formatDate(row.edu_starting_date, i18n.language) ?? '—'}
                        </Badge>
                      </TD>
                      <TD className="text-center">
                        <Badge tone="rose">
                          {formatDate(row.edu_ending_date, i18n.language) ?? '—'}
                        </Badge>
                      </TD>
                      <TD className="text-center">
                        {row.start_time || row.end_time ? (
                          <Badge tone="amber">
                            {row.start_time || '—'} - {row.end_time || '—'}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TD>
                      <TD>
                        {days.length ? (
                          <div className="flex flex-wrap gap-1">
                            {days.map((d) => (
                              <Badge key={d} tone="violet">
                                {DAYS.find((x) => x.id === d)?.label ?? d}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge tone="rose">{t('groupsPage.timetableNo')}</Badge>
                        )}
                      </TD>
                      <TD className="text-center">
                        <Badge tone={missingTimetable ? 'rose' : 'teal'}>
                          {missingTimetable ? (
                            t('groupsPage.timetableNo')
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="size-3.5" aria-hidden />
                              {t('groupsPage.timetableYes')}
                            </span>
                          )}
                        </Badge>
                      </TD>
                      <TD>
                        <div className="flex items-end justify-center gap-1">
                          {attendance == null ? (
                            <div className="text-center">
                              <CalendarDays className="mx-auto size-6 text-mist" aria-hidden />
                              <p className="mt-0.5 text-[11px] text-muted">
                                {t('groupsPage.attendanceMissing')}
                              </p>
                            </div>
                          ) : (
                            <AttendanceRing percent={attendance} />
                          )}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-teal"
                            loading={
                              attendanceMutation.isPending &&
                              attendanceMutation.variables === row.id
                            }
                            aria-label={t('groupsPage.refreshAttendance')}
                            onClick={() => refreshAttendance(row.id)}
                          >
                            <RefreshCw className="size-3.5" />
                          </Button>
                        </div>
                      </TD>
                      <TD>
                        <div className="flex gap-1">
                          <ShowButton onClick={() => navigate(groupShowPath(row.id))} />
                          {canDelete ? (
                            <span
                              title={
                                Number(row.grouped_students_count) > 0
                                  ? t('groupsPage.cannotDeleteWithStudents')
                                  : undefined
                              }
                            >
                              <DeleteButton
                                disabled={Number(row.grouped_students_count) > 0}
                                onClick={() => setDeleteRow(row)}
                              />
                            </span>
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

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={total}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      </PageMain>

      <CreateGroupModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <ConfirmDialog
        open={Boolean(deleteRow)}
        onClose={() => setDeleteRow(null)}
        onConfirm={confirmDelete}
        description={t('common.confirmDelete', {
          name: deleteRow?.name || deleteRow?.name_uz,
        })}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
