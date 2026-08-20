import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  OrganizationSelect,
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
import { practicalAttendanceStudentsPath } from '@/config'
import { useAuth } from '@/features/auth'
import {
  asDayList,
  practicalDayLabel,
  usePracticalAttendanceGroupsQuery,
} from '@/features/practical-attendance'
import { asText } from '@/lib/apiPage'
import { formatDate } from '@/lib/format'
import type { PracticalAttendanceGroup } from '@/types/practical-attendance'

const GROUP_NAME_STORAGE = 'eavt.practical-group-name:'

function statusMeta(value: number | string | null | undefined, t: (key: string) => string) {
  const code = Number(value)
  if (code === 0) {
    return { label: t('practicalAttendancePage.statusNew'), tone: 'signal' as const }
  }
  if (code === 1) {
    return { label: t('practicalAttendancePage.statusActive'), tone: 'teal' as const }
  }
  return { label: t('practicalAttendancePage.statusFinished'), tone: 'neutral' as const }
}

export function PracticalAttendancePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isSuperAdmin } = useAuth()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [groupSearch, setGroupSearch] = useState('')
  const [organizationSearch, setOrganizationSearch] = useState('')
  const [eduStatus, setEduStatus] = useState('')

  useEffect(() => {
    setPage(1)
  }, [groupSearch, organizationSearch, eduStatus, pageSize])

  const { data, isLoading, isError, error } = usePracticalAttendanceGroupsQuery({
    page,
    showCount: pageSize,
    groupSearch,
    organizationSearch,
    eduStatus,
  })
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages =
    data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const colCount = (isSuperAdmin ? 9 : 8)

  const openStudents = (row: PracticalAttendanceGroup) => {
    const name = row.name?.trim() || ''
    try {
      sessionStorage.setItem(GROUP_NAME_STORAGE + row.id, name)
    } catch {
      /* ignore quota */
    }
    navigate(practicalAttendanceStudentsPath(row.id), {
      state: { groupName: name, fullName: name },
    })
  }

  return (
    <>
      <Header
        title={t('practicalAttendancePage.title')}
        actions={
          <div className="flex flex-nowrap items-center gap-2">
            <SearchInput
              size="sm"
              id="practical-group-search"
              name="practical-group-search"
              className="w-48 shrink-0"
              label={t('practicalAttendancePage.searchGroup')}
              placeholder={t('practicalAttendancePage.searchGroup')}
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
            />
            <OrganizationSelect
              size="sm"
              id="practical-org-search"
              name="practical-org-search"
              className="w-72 shrink-0"
              value={organizationSearch}
              onChange={(e) => setOrganizationSearch(e.target.value)}
            />
            <Select
              size="sm"
              searchable={false}
              className="w-36 shrink-0"
              value={eduStatus}
              onChange={(e) => setEduStatus(e.target.value)}
              options={[
                { value: '', label: t('practicalAttendancePage.filterAll') },
                { value: '0', label: t('practicalAttendancePage.statusNew') },
                { value: '1', label: t('practicalAttendancePage.statusActive') },
                { value: '2', label: t('practicalAttendancePage.statusFinished') },
              ]}
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
          <Table storageKey="group-practical-attendance">
            <THead>
              <TR className="hover:bg-transparent">
                <TH column="index" rowSpan={2} className="w-10 align-bottom">
                  №
                </TH>
                <TH column="group" rowSpan={2} className="align-bottom">
                  {t('directorList.group')}
                </TH>
                {isSuperAdmin ? (
                  <TH column="org" rowSpan={2} className="align-bottom">
                    {t('practicalAttendancePage.organization')}
                  </TH>
                ) : null}
                <TH
                  column="dates"
                  rowSpan={2}
                  className="max-w-40 align-bottom text-center whitespace-normal"
                >
                  {t('practicalAttendancePage.eduDates')}
                </TH>
                <TH
                  column="theory"
                  rowSpan={2}
                  className="align-bottom text-center"
                >
                  {t('practicalAttendancePage.theoretical')}
                </TH>
                <TH
                  column="practice"
                  rowSpan={2}
                  className="align-bottom text-center"
                >
                  {t('practicalAttendancePage.practical')}
                </TH>
                <TH
                  colSpan={2}
                  registerColumn={false}
                  className="border-b border-mist/70 text-center"
                >
                  {t('practicalAttendancePage.participation')}
                </TH>
                <TH
                  column="status"
                  rowSpan={2}
                  className="align-bottom text-center"
                >
                  {t('practicalAttendancePage.status')}
                </TH>
              </TR>
              <TR className="hover:bg-transparent">
                <TH column="started" className="text-center font-medium">
                  {t('practicalAttendancePage.startedCount')}
                </TH>
                <TH column="total" className="text-center font-medium">
                  {t('practicalAttendancePage.totalStudents')}
                </TH>
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={colCount}>
                    <EmptyState
                      className="border-0 py-4"
                      description={t('practicalAttendancePage.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => {
                  const status = statusMeta(row.edu_status, t)
                  const theory = asDayList(row.lesson_days?.theoretical)
                  const practice = asDayList(row.lesson_days?.practical)
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
                      {isSuperAdmin ? (
                        <TD column="org" className="text-sm">
                          {row.organization?.inn ? (
                            <span className="font-medium text-rose">
                              {row.organization.inn}
                            </span>
                          ) : null}
                          {row.organization?.inn && row.organization?.name
                            ? ' - '
                            : null}
                          {row.organization?.name ||
                            (row.organization?.inn ? '' : '—')}
                        </TD>
                      ) : null}
                      <TD column="dates">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          <Badge tone="teal">
                            {formatDate(row.edu_starting_date, i18n.language) ??
                              asText(row.edu_starting_date)}
                          </Badge>
                          <span className="text-muted">-</span>
                          <Badge tone="rose">
                            {formatDate(row.edu_ending_date, i18n.language) ??
                              asText(row.edu_ending_date)}
                          </Badge>
                        </div>
                      </TD>
                      <TD column="theory" className="text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {theory.length
                            ? theory.map((day) => (
                                <Badge key={String(day)} tone="signal">
                                  {practicalDayLabel(day)}
                                </Badge>
                              ))
                            : '—'}
                        </div>
                      </TD>
                      <TD column="practice" className="text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {practice.length
                            ? practice.map((day) => (
                                <Badge key={String(day)} tone="teal">
                                  {practicalDayLabel(day)}
                                </Badge>
                              ))
                            : '—'}
                        </div>
                      </TD>
                      <TD column="started" className="text-center">
                        <Badge>
                          {asText(row.students?.practical_started ?? 0)}
                        </Badge>
                      </TD>
                      <TD column="total" className="text-center">
                        <Badge>{asText(row.students?.total ?? 0)}</Badge>
                      </TD>
                      <TD column="status" className="text-center">
                        <Badge tone={status.tone}>{status.label}</Badge>
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
