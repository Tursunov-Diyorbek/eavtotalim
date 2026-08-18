import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  Pagination,
  SearchInput,
  Select,
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
import { EDU_TYPES } from '@/config/eduTypes'
import { groupEditPath, groupShowPath } from '@/config'
import {
  formatLessonTime,
  formatWeekDays,
  useDeleteGroupMutation,
  useGroupCountsQuery,
  useGroupsQuery,
} from '@/features/groups'
import { formatDate, formatNumber } from '@/lib/format'
import type { GroupEduStatusTab, GroupItem } from '@/types/groups'
import { CreateGroupModal } from './CreateGroupModal'

const DAYS = [
  { id: 1, label: 'Du' },
  { id: 2, label: 'Se' },
  { id: 3, label: 'Ch' },
  { id: 4, label: 'Pa' },
  { id: 5, label: 'Ju' },
  { id: 6, label: 'Sh' },
  { id: 7, label: 'Ya' },
]

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border border-mist/70 bg-white p-3">
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" rounded="lg" />
      ))}
    </div>
  )
}

function statusTone(status: number | string | null | undefined) {
  const n = Number(status)
  if (n === 1) return 'teal' as const
  if (n === 2) return 'neutral' as const
  return 'amber' as const
}

export function GroupsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [tab, setTab] = useState<GroupEduStatusTab>('1')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [eduTypeId, setEduTypeId] = useState('')
  const [timetable, setTimetable] = useState('')
  const [weekDays, setWeekDays] = useState<number[]>([])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [sortId, setSortId] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteRow, setDeleteRow] = useState<GroupItem | null>(null)

  useEffect(() => {
    setPage(1)
  }, [tab, search, eduTypeId, timetable, weekDays, startTime, endTime, sortId, pageSize])

  const sort =
    sortId === '1'
      ? { sortKey: 'name_uz', sortOrder: 'ASC' as const }
      : sortId === '2'
        ? { sortKey: 'name_uz', sortOrder: 'DESC' as const }
        : {}

  const { data: counts, refetch: refetchCounts } = useGroupCountsQuery()
  const { data, isLoading, isError, refetch, isFetching } = useGroupsQuery({
    page,
    showCount: pageSize,
    eduStatus: tab,
    name: search.trim() || undefined,
    eduTypeId: eduTypeId ? Number(eduTypeId) : null,
    timetable,
    weekDays,
    startTime,
    endTime,
    ...sort,
  })
  const deleteMutation = useDeleteGroupMutation()

  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  const tabItems = useMemo(
    () => [
      {
        value: 'all' as const,
        label: `${t('groupsPage.tabAll')}: ${formatNumber(counts?.all ?? 0)}`,
      },
      {
        value: '1' as const,
        label: `${t('groupsPage.tabActive')}: ${formatNumber(counts?.active ?? 0)}`,
      },
      {
        value: '2' as const,
        label: `${t('groupsPage.tabFinished')}: ${formatNumber(counts?.finished ?? 0)}`,
      },
      {
        value: '0' as const,
        label: `${t('groupsPage.tabNew')}: ${formatNumber(counts?.new ?? 0)}`,
      },
    ],
    [t, counts],
  )

  const toggleDay = (id: number) => {
    setWeekDays((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    )
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

  return (
    <>
      <Header
        title={t('groupsPage.title')}
        description={t('groupsPage.description')}
        actions={
          <div className="flex items-center gap-2">
            <SearchInput
              size="sm"
              placeholder={t('groupsPage.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-w-44 sm:w-56"
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
              {t('common.refresh')}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-3.5" aria-hidden />
              {t('groupsPage.create')}
            </Button>
          </div>
        }
      />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        <Tabs
          items={tabItems}
          value={tab}
          onChange={setTab}
          aria-label={t('groupsPage.title')}
        />

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label={t('groupsPage.eduType')}
            value={eduTypeId}
            onChange={(e) => setEduTypeId(e.target.value)}
            options={[
              { value: '', label: t('groupsPage.allTypes') },
              ...EDU_TYPES.map((item) => ({
                value: item.id,
                label: item.shortName,
              })),
            ]}
          />
          <Select
            label={t('groupsPage.timetable')}
            value={timetable}
            onChange={(e) => setTimetable(e.target.value)}
            options={[
              { value: '', label: t('common.all') },
              { value: '1', label: t('groupsPage.timetableYes') },
              { value: '0', label: t('groupsPage.timetableNo') },
            ]}
          />
          <Select
            label={t('groupsPage.sort')}
            value={sortId}
            onChange={(e) => setSortId(e.target.value)}
            options={[
              { value: '', label: t('groupsPage.sortDefault') },
              { value: '1', label: t('groupsPage.sortNameAsc') },
              { value: '2', label: t('groupsPage.sortNameDesc') },
            ]}
          />
          <div className="grid grid-cols-2 gap-2">
            <SearchInput
              size="sm"
              label={t('groupsPage.startTime')}
              placeholder={t('groupsPage.startTime')}
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <SearchInput
              size="sm"
              label={t('groupsPage.endTime')}
              placeholder={t('groupsPage.endTime')}
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-xs font-semibold text-muted">
            {t('groupsPage.colDays')}:
          </span>
          {DAYS.map((day) => (
            <Button
              key={day.id}
              variant="soft"
              size="sm"
              active={weekDays.includes(day.id)}
              onClick={() => toggleDay(day.id)}
            >
              {day.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <ErrorMessage />
        ) : rows.length === 0 ? (
          <EmptyState description={t('groupsPage.empty')} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-10">?</TH>
                <TH>{t('groupsPage.colName')}</TH>
                <TH>{t('groupsPage.colEduType')}</TH>
                <TH>{t('groupsPage.colStudents')}</TH>
                <TH>{t('groupsPage.colPrice')}</TH>
                <TH>{t('groupsPage.colStart')}</TH>
                <TH>{t('groupsPage.colEnd')}</TH>
                <TH>{t('groupsPage.colTime')}</TH>
                <TH>{t('groupsPage.colDays')}</TH>
                <TH>{t('common.actions')}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row, index) => {
                const time = formatLessonTime(row.start_time, row.end_time)
                return (
                  <TR key={row.id}>
                    <TD className="text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD>
                      <p className="font-medium text-ink">
                        {row.name || row.name_uz || '?'}
                      </p>
                      <Badge tone={statusTone(row.edu_status)} className="mt-1">
                        {Number(row.edu_status) === 1
                          ? t('groupsPage.tabActive')
                          : Number(row.edu_status) === 2
                            ? t('groupsPage.tabFinished')
                            : t('groupsPage.tabNew')}
                      </Badge>
                    </TD>
                    <TD>
                      {row.edu_type?.short_name ||
                        row.edu_type?.character_name ||
                        '?'}
                    </TD>
                    <TD>
                      <Badge tone="signal">
                        {formatNumber(row.grouped_students_count ?? 0)}
                      </Badge>
                    </TD>
                    <TD>
                      {row.education_price != null && row.education_price !== ''
                        ? `${formatNumber(row.education_price)} ${t('dashboard.sum')}`
                        : '?'}
                    </TD>
                    <TD>
                      <Badge tone="teal">
                        {formatDate(row.edu_starting_date, i18n.language) ?? '?'}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge tone="rose">
                        {formatDate(row.edu_ending_date, i18n.language) ?? '?'}
                      </Badge>
                    </TD>
                    <TD>{time ?? '?'}</TD>
                    <TD className="whitespace-nowrap text-muted">
                      {formatWeekDays(row.week_days)}
                    </TD>
                    <TD>
                      <div className="flex gap-1">
                        <Button
                          variant="soft"
                          size="icon-sm"
                          aria-label={t('common.view')}
                          onClick={() => navigate(groupShowPath(row.id))}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label={t('common.edit')}
                          onClick={() => navigate(groupEditPath(row.id))}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="danger"
                          size="icon-sm"
                          aria-label={t('common.delete')}
                          onClick={() => setDeleteRow(row)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TD>
                  </TR>
                )
              })}
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
      </main>

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
