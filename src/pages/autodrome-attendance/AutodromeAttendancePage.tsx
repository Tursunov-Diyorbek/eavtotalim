import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Eye,
} from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  FilterTH,
  ListPageSkeleton,
  Pagination,
  SearchInput,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { autodromeAttendanceStudentsPath } from '@/config'
import {
  formatAutodromeWeekDays,
  useAutodromeOrganizationGroupsQuery,
} from '@/features/autodrome-attendance'
import { asText } from '@/lib/apiPage'
import type { AutodromeGroupSortBy } from '@/api'
import type { AutodromeGroupRow } from '@/types/autodrome-attendance'

const GROUP_NAME_STORAGE = 'eavt.autodrome-group-name:'

function dateTimeLabel(date?: string | null, time?: string | null) {
  const day = asText(date)
  const clock = asText(time)
  if (day === '—' && clock === '—') return '—'
  if (clock === '—') return day
  if (day === '—') return clock
  return `${day} / ${clock}`
}

function groupStatus(row: AutodromeGroupRow, t: (key: string) => string) {
  const raw = row.edu_status
  const code = Number(raw)
  if (code === 1) return { label: t('autodromeAttendancePage.statusActive'), tone: 'teal' as const }
  if (code === 2) return { label: t('autodromeAttendancePage.statusFinished'), tone: 'neutral' as const }
  if (code === 0) return { label: t('autodromeAttendancePage.statusNew'), tone: 'signal' as const }
  const text = asText(raw)
  if (text !== '—') return { label: text, tone: 'teal' as const }
  return { label: t('autodromeAttendancePage.statusActive'), tone: 'teal' as const }
}

function autodromeLabel(row: AutodromeGroupRow) {
  const source = row.autodrome ?? row.organization
  const inn = asText(source?.inn)
  const name = asText(source?.name)
  return { inn: inn === '—' ? '' : inn, name: name === '—' ? '' : name }
}

function compareGroups(
  a: AutodromeGroupRow,
  b: AutodromeGroupRow,
  key: AutodromeGroupSortBy,
  dir: number,
) {
  let left = 0
  let right = 0
  if (key === 'attended_students_count') {
    left = Number(a.attended_students_count) || 0
    right = Number(b.attended_students_count) || 0
  } else {
    left = Date.parse(String(a.created_at ?? '')) || a.id
    right = Date.parse(String(b.created_at ?? '')) || b.id
  }
  if (left !== right) return (left - right) * dir
  return (a.id - b.id) * dir
}

export function AutodromeAttendancePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [groupName, setGroupName] = useState('')
  const [autodromeSearch, setAutodromeSearch] = useState('')
  const [sortBy, setSortBy] = useState<AutodromeGroupSortBy>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    setPage(1)
  }, [groupName, autodromeSearch, sortBy, sortOrder, pageSize])

  const { data, isLoading, isError, error } = useAutodromeOrganizationGroupsQuery({
    page,
    showCount: pageSize,
    groupName,
    autodromeSearch,
    sortBy,
    sortOrder,
  })
  const rows = useMemo(() => {
    const list = [...(data?.data ?? [])]
    const dir = sortOrder === 'asc' ? 1 : -1
    list.sort((a, b) => compareGroups(a, b, sortBy, dir))
    return list
  }, [data, sortBy, sortOrder])
  const total = data?.total_items ?? 0
  const totalPages =
    data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  const toggleSort = (key: AutodromeGroupSortBy) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
      return
    }
    setSortBy(key)
    setSortOrder('asc')
  }

  const sortIcon = (field: AutodromeGroupSortBy) => {
    const order = sortBy === field ? sortOrder : 'desc'
    return order === 'asc' ? (
      <ArrowUpWideNarrow className="size-3.5" aria-hidden />
    ) : (
      <ArrowDownWideNarrow className="size-3.5" aria-hidden />
    )
  }

  const openStudents = (row: AutodromeGroupRow) => {
    const name = row.name?.trim() || ''
    try {
      sessionStorage.setItem(GROUP_NAME_STORAGE + row.id, name)
    } catch {
      /* ignore quota */
    }
    navigate(autodromeAttendanceStudentsPath(row.id), {
      state: { groupName: name },
    })
  }

  return (
    <>
      <Header title={t('autodromeAttendancePage.title')} />
      <PageMain fill>
        {isError ? (
          <ErrorMessage>
            {error instanceof Error ? error.message : undefined}
          </ErrorMessage>
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="autodrome-organization-groups">
            <THead>
              <TR className="hover:bg-transparent">
                <TH column="index" className="w-10">
                  №
                </TH>
                <TH column="group">{t('groupsPage.colName')}</TH>
                <TH column="autodrome">{t('directorList.autodrome')}</TH>
                <TH column="connected" className="w-36 text-center">
                  {t('autodromeAttendancePage.connected')}
                </TH>
                <TH column="passed" className="w-36 text-center">
                  {t('autodromeAttendancePage.passed')}
                </TH>
                <TH column="edu">{t('autodromeAttendancePage.eduType')}</TH>
                <TH column="dates">{t('autodromeAttendancePage.eduDates')}</TH>
                <TH column="days">{t('autodromeAttendancePage.classDays')}</TH>
                <TH column="status">{t('autodromeAttendancePage.groupStatus')}</TH>
                <TH column="actions" className="w-16 text-center">
                  {t('common.actions')}
                </TH>
              </TR>
              <TR className="bg-white hover:bg-transparent">
                <FilterTH column="index" />
                <FilterTH column="group">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={t('groupsPage.sort')}
                      onClick={() => toggleSort('created_at')}
                    >
                      {sortIcon('created_at')}
                    </Button>
                    <SearchInput
                      size="sm"
                      id="autodrome-group-name"
                      name="autodrome-group-name"
                      label={t('groupsPage.colName')}
                      placeholder={t('autodromeAttendancePage.searchGroup')}
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>
                </FilterTH>
                <FilterTH column="autodrome">
                  <SearchInput
                    size="sm"
                    id="autodrome-search"
                    name="autodrome-search"
                    label={t('directorList.autodrome')}
                    placeholder={t('autodromeAttendancePage.searchAutodrome')}
                    value={autodromeSearch}
                    onChange={(e) => setAutodromeSearch(e.target.value)}
                  />
                </FilterTH>
                <FilterTH column="connected" />
                <FilterTH column="passed">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    aria-label={t('groupsPage.sort')}
                    onClick={() => toggleSort('attended_students_count')}
                  >
                    {sortIcon('attended_students_count')}
                  </Button>
                </FilterTH>
                <FilterTH column="edu" />
                <FilterTH column="dates" />
                <FilterTH column="days" />
                <FilterTH column="status" />
                <FilterTH column="actions" />
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={10}>
                    <EmptyState
                      className="border-0 py-4"
                      description={t('common.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => {
                  const autodrome = autodromeLabel(row)
                  const status = groupStatus(row, t)
                  return (
                    <TR key={row.id}>
                      <TD column="index" className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD column="group">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-0 py-0 font-medium text-signal hover:underline"
                          onClick={() => openStudents(row)}
                        >
                          {row.name || '—'}
                        </Button>
                      </TD>
                      <TD column="autodrome" className="text-sm">
                        {autodrome.inn ? (
                          <span className="font-medium text-rose">{autodrome.inn}</span>
                        ) : null}
                        {autodrome.inn && autodrome.name ? ' - ' : null}
                        {autodrome.name || (autodrome.inn ? '' : '—')}
                      </TD>
                      <TD column="connected" className="text-center">
                        {asText(row.autodrome_students_count)}
                      </TD>
                      <TD column="passed" className="text-center">
                        {asText(row.attended_students_count)}
                      </TD>
                      <TD column="edu">
                        {row.edu_type?.short_name || row.edu_type?.name || '—'}
                      </TD>
                      <TD column="dates">
                        <div className="flex flex-col items-start gap-1">
                          <Badge tone="teal">
                            {dateTimeLabel(row.edu_starting_date, row.start_time)}
                          </Badge>
                          <Badge tone="rose">
                            {dateTimeLabel(row.edu_ending_date, row.end_time)}
                          </Badge>
                        </div>
                      </TD>
                      <TD column="days">{formatAutodromeWeekDays(row.week_days)}</TD>
                      <TD column="status">
                        <span
                          className={
                            status.tone === 'teal'
                              ? 'font-semibold text-teal'
                              : status.tone === 'signal'
                                ? 'font-semibold text-signal'
                                : 'font-semibold text-muted'
                          }
                        >
                          {status.label}
                        </span>
                      </TD>
                      <TD column="actions" className="text-center">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label={t('common.view')}
                          onClick={() => openStudents(row)}
                        >
                          <Eye className="size-3.5" />
                        </Button>
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
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </PageMain>
    </>
  )
}
