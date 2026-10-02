import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  DateInput,
  EmptyTR,
  ErrorMessage,
  Input,
  ListPageSkeleton,
  Notification,
  Pagination,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { useDailyArrivalsQuery, useRefetchDailyArrivalsMutation } from '@/features/daily-arrivals'
import { useGroupsQuery } from '@/features/groups'
import { useOpenedOnce, usePageState } from '@/hooks'
import { asFio } from '@/lib/apiPage'
import type { DailyArrival } from '@/types/daily-arrivals'

const EMPTY = { fio: '', groupId: '', date: '' }

function dayOf(row: DailyArrival) {
  const raw = row.attendance_date || row.date || ''
  return raw.slice(0, 10) || '—'
}

function timeOf(row: DailyArrival) {
  const raw = row.attendance_time || row.time || ''
  return raw.trim() || '—'
}

function lateOf(row: DailyArrival) {
  const value = row.late_seconds ?? row.delay ?? row.lateness ?? row.late
  if (value == null || value === '') return ''
  return String(value)
}

function groupOf(row: DailyArrival) {
  return (
    row.group?.name_uz?.trim() ||
    row.group?.name?.trim() ||
    row.group_name?.trim() ||
    ''
  )
}

function orgOf(row: DailyArrival) {
  return row.organization?.name?.trim() || row.organization_name?.trim() || ''
}

export function DailyArrivalsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [fio, setFio] = usePageState('fio', '')
  const [groupId, setGroupId] = usePageState('groupId', '')
  const [date, setDate] = usePageState('date', '')
  const [applied, setApplied] = usePageState('applied', EMPTY)
  const [groupsEnabled, openGroups] = useOpenedOnce(Boolean(groupId || applied.groupId))
  const groupsQuery = useGroupsQuery(
    {
      page: 1,
      showCount: 2000,
      eduStatus: 'all',
    },
    groupsEnabled,
  )
  const groups = groupsQuery.data?.data ?? []
  const appliedGroup = groups.find((group) => String(group.id) === applied.groupId)
  const list = useDailyArrivalsQuery({
    page,
    showCount: pageSize,
    ...applied,
    groupName:
      appliedGroup?.name_uz?.trim() || appliedGroup?.name?.trim() || '',
  })
  const refetchDay = useRefetchDailyArrivalsMutation()
  const rows = list.data?.data ?? []
  const total = list.data?.total_items ?? 0
  const totalPages = list.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const apply = () => {
    setPage(1)
    setApplied({ fio: fio.trim(), groupId, date })
  }

  const clear = () => {
    setFio('')
    setGroupId('')
    setDate('')
    setPage(1)
    setApplied(EMPTY)
  }

  return (
    <>
      <Header
        title={<span className="uppercase">{t('dailyArrivalsPage.title')}</span>}
        actions={
          <div className="flex flex-col items-end gap-1">
            <div className="flex flex-nowrap items-end gap-2">
              <Input
                size="sm"
                id="daily-arrivals-fio"
                name="daily-arrivals-fio"
                label=""
                className="w-40 shrink-0"
                placeholder={t('dailyArrivalsPage.fio')}
                value={fio}
                onChange={(e) => setFio(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') apply()
                }}
              />
              <Select
                size="sm"
                className="w-40 shrink-0"
                placeholder={t('dailyArrivalsPage.group')}
                searchPlaceholder={t('common.search')}
                clearable
                onOpen={openGroups}
                loading={groupsQuery.isFetching && groups.length === 0}
                error={groupsQuery.isError && !groups.length ? t('common.loadError') : undefined}
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                options={groups.map((group) => ({
                  value: String(group.id),
                  label: group.name_uz?.trim() || group.name?.trim() || String(group.id),
                }))}
              />
              <DateInput
                size="sm"
                id="daily-arrivals-date"
                name="daily-arrivals-date"
                className="w-36 shrink-0"
                placeholder={t('dailyArrivalsPage.date')}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Button onClick={apply}>{t('dailyArrivalsPage.search')}</Button>
              <Button variant="outline" onClick={clear}>
                {t('dailyArrivalsPage.clear')}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="!text-signal"
              loading={refetchDay.isPending}
              onClick={() => {
                const day = date || applied.date
                if (!day) {
                  notify.warning(t('dailyArrivalsPage.pickDate'))
                  return
                }
                refetchDay.mutate({ date: day, groupId: groupId || applied.groupId || undefined })
              }}
            >
              {t('dailyArrivalsPage.refetch')}
            </Button>
          </div>
        }
      />
      <PageMain fill>
        <Notification tone="warning" className="shrink-0">
          {t('dailyArrivalsPage.hint')}
        </Notification>
        {list.isError ? (
          <ErrorMessage>
            {list.error instanceof Error && list.error.message
              ? list.error.message
              : undefined}
          </ErrorMessage>
        ) : list.isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="monitoring-camera-daily">
            <THead>
              <TR className="hover:bg-transparent">
                <TH column="index" className="w-10">
                  №
                </TH>
                <TH column="fio">{t('dailyArrivalsPage.fio')}</TH>
                <TH column="group">{t('dailyArrivalsPage.group')}</TH>
                <TH column="org">{t('dailyArrivalsPage.organization')}</TH>
                <TH column="date">{t('dailyArrivalsPage.date')}</TH>
                <TH column="time">{t('directorList.time')}</TH>
                <TH column="late" className="text-center">
                  {t('dailyArrivalsPage.late')}
                </TH>
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={7} description={t('common.empty')} />
              ) : (
                rows.map((row, index) => (
                  <TR key={String(row.id ?? `${page}-${index}`)}>
                    <TD column="index" className="text-center text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD column="fio">{asFio(row)}</TD>
                    <TD column="group">{groupOf(row) || ''}</TD>
                    <TD column="org">{orgOf(row) || ''}</TD>
                    <TD column="date">{dayOf(row)}</TD>
                    <TD column="time">{timeOf(row)}</TD>
                    <TD column="late" className="text-center">
                      {lateOf(row)}
                    </TD>
                  </TR>
                ))
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
