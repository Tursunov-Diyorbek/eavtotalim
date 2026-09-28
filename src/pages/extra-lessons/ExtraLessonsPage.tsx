import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  DateInput,
  EmptyTR,
  ErrorMessage,
  ListPageSkeleton,
  Pagination,
  SearchInput,
  Select,
  ShowButton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { groupShowPath } from '@/config'
import { useAuth } from '@/features/auth'
import { useExtraLessonGroupsQuery } from '@/features/extra-lessons'
import { formatDate, formatNumber } from '@/lib/format'
import type { ExtraLessonGroup } from '@/types/extra-lessons'

function clock(value: string | null | undefined) {
  if (!value) return ''
  return value.slice(0, 5)
}

function statusMeta(value: number | string | null | undefined, t: (key: string) => string) {
  const code = Number(value)
  if (code === 0) {
    return { label: t('extraLessonsPage.statusNew'), tone: 'signal' as const }
  }
  if (code === 1) {
    return { label: t('extraLessonsPage.statusActive'), tone: 'teal' as const }
  }
  if (code === 2) {
    return { label: t('extraLessonsPage.statusFinished'), tone: 'neutral' as const }
  }
  return { label: '—', tone: 'neutral' as const }
}

function groupName(row: ExtraLessonGroup) {
  return row.name_uz?.trim() || row.name?.trim() || '—'
}

function eduTypeName(row: ExtraLessonGroup) {
  const edu = row.edu_type
  return edu?.short_name || edu?.character_name || edu?.name_uz || edu?.name || '—'
}

export function ExtraLessonsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission, isSuperAdmin } = useAuth()
  const showOrg = isSuperAdmin || hasPermission('view-cross-organization-data')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [groupSearch, setGroupSearch] = useState('')
  const [eduStatus, setEduStatus] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    setPage(1)
  }, [groupSearch, eduStatus, fromDate, toDate, pageSize])

  const { data, isLoading, isError, error, refetch, isFetching } = useExtraLessonGroupsQuery({
    page,
    showCount: pageSize,
    groupSearch,
    eduStatus,
    fromDate,
    toDate,
  })
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const colCount = showOrg ? 9 : 8

  return (
    <>
      <Header
        title={
          <span className="inline-flex items-center gap-2">
            <span className="uppercase">{t('nav.extraLessons')}</span>
            <Button
              variant="ghost"
              size="sm"
              className="px-1 !text-signal"
              loading={isFetching && !isLoading}
              onClick={() => void refetch()}
            >
              <RefreshCw className="size-3.5" aria-hidden />
              {t('common.refresh')}
            </Button>
          </span>
        }
        actions={
          <div className="flex flex-nowrap items-end gap-2">
            <Select
              size="sm"
              searchable={false}
              className="w-36 shrink-0"
              aria-label={t('extraLessonsPage.status')}
              value={eduStatus}
              onChange={(e) => setEduStatus(e.target.value)}
              options={[
                { value: '', label: t('common.all') },
                { value: '0', label: t('extraLessonsPage.statusNew') },
                { value: '1', label: t('extraLessonsPage.statusActive') },
                { value: '2', label: t('extraLessonsPage.statusFinished') },
              ]}
            />
            <SearchInput
              size="sm"
              id="extra-lessons-group"
              name="extra-lessons-group"
              className="w-56 shrink-0"
              label={t('directorList.group')}
              placeholder={t('extraLessonsPage.searchGroup')}
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
            />
            <DateInput
              size="sm"
              id="extra-lessons-from"
              name="extra-lessons-from"
              className="w-36 shrink-0"
              label={t('extraLessonsPage.fromDate')}
              placeholder={t('extraLessonsPage.fromDate')}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <DateInput
              size="sm"
              id="extra-lessons-to"
              name="extra-lessons-to"
              className="w-36 shrink-0"
              label={t('extraLessonsPage.toDate')}
              placeholder={t('extraLessonsPage.toDate')}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
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
          <Table storageKey="extra-lessons">
            <THead>
              <TR className="hover:bg-transparent">
                <TH column="index" className="w-10">
                  №
                </TH>
                <TH column="group">{t('directorList.group')}</TH>
                {showOrg ? (
                  <TH column="org">{t('extraLessonsPage.organization')}</TH>
                ) : null}
                <TH column="edu">{t('extraLessonsPage.eduType')}</TH>
                <TH column="dates" className="text-center whitespace-normal">
                  {t('extraLessonsPage.dates')}
                </TH>
                <TH column="time" className="text-center">
                  {t('directorList.time')}
                </TH>
                <TH column="students" className="text-center whitespace-normal">
                  {t('extraLessonsPage.studentsCount')}
                </TH>
                <TH column="status" className="text-center">
                  {t('extraLessonsPage.status')}
                </TH>
                <TH column="actions" className="text-center">
                  {t('common.actions')}
                </TH>
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={colCount} description={t('common.empty')} />
              ) : (
                rows.map((row, index) => {
                  const status = statusMeta(row.edu_status, t)
                  const start = clock(row.start_time)
                  const end = clock(row.end_time)
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
                          onClick={() => navigate(groupShowPath(row.id))}
                        >
                          {groupName(row)}
                        </Button>
                      </TD>
                      {showOrg ? (
                        <TD column="org" className="text-sm">
                          {row.organization?.name || '—'}
                          {row.organization?.inn ? (
                            <span className="ml-1 text-rose">({row.organization.inn})</span>
                          ) : null}
                        </TD>
                      ) : null}
                      <TD column="edu">{eduTypeName(row)}</TD>
                      <TD column="dates">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          <Badge tone="teal">
                            {formatDate(row.edu_starting_date, i18n.language) ?? '—'}
                          </Badge>
                          <span className="text-muted">-</span>
                          <Badge tone="rose">
                            {formatDate(row.edu_ending_date, i18n.language) ?? '—'}
                          </Badge>
                        </div>
                      </TD>
                      <TD column="time" className="text-center">
                        {start || end ? (
                          <Badge tone="amber">
                            {start || '—'} - {end || '—'}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TD>
                      <TD column="students" className="text-center">
                        <Badge>
                          {formatNumber(row.students_with_class_dates_count ?? 0)}
                        </Badge>
                      </TD>
                      <TD column="status" className="text-center">
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </TD>
                      <TD column="actions" className="text-center">
                        <ShowButton onClick={() => navigate(groupShowPath(row.id))} />
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
    </>
  )
}
