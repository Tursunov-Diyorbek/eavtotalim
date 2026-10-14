import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  OrganizationLabel,
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
  type BadgeTone,
} from '@/components/ui'
import { autodromeAttendanceStudentsPath } from '@/config'
import { useAutodromeResGaiQuery } from '@/features/autodrome-attendance'
import { usePageState } from '@/hooks'
import { formatDate } from '@/lib/format'
import type { AutodromeResGaiRow } from '@/types/autodrome-attendance'

function metric(value: number | string | null | undefined) {
  if (value == null || value === '') return '—'
  return String(value)
}

function attendanceHours(row: AutodromeResGaiRow) {
  const hours =
    row.total_attendance_hours ?? (Number(row.total_attendance_count) || 0) * 2
  return `${hours} soat`
}

function groupStatus(status: number | string | null | undefined, t: (key: string) => string) {
  const code = Number(status)
  if (code === 1) return { label: t('autodromeResGaiPage.statusActive'), tone: 'teal' as BadgeTone }
  if (code === 2) return { label: t('autodromeResGaiPage.statusFinished'), tone: 'amber' as BadgeTone }
  return { label: t('autodromeResGaiPage.statusNew'), tone: 'signal' as BadgeTone }
}

export function AutodromeResGaiPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [organizationSearch, setOrganizationSearch] = usePageState('organization', '')
  const [studentSearch, setStudentSearch] = usePageState('student', '')
  const [groupStatusValue, setGroupStatusValue] = usePageState('status', '1')

  useEffect(() => {
    setPage(1)
  }, [organizationSearch, studentSearch, groupStatusValue, pageSize])

  const { data, isLoading, isError } = useAutodromeResGaiQuery({
    page,
    showCount: pageSize,
    studentSearch,
    organizationSearch,
    groupStatus: groupStatusValue,
  })
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const statusOptions = [
    { value: '0', label: t('autodromeResGaiPage.statusNew') },
    { value: '1', label: t('autodromeResGaiPage.statusActive') },
    { value: '2', label: t('autodromeResGaiPage.statusFinished') },
  ]

  return (
    <>
      <Header title={t('autodromeResGaiPage.title')} />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="autodrome-res-gai">
            <THead>
              <HeaderTR>
                <TH className="w-12">№</TH>
                <TH className="w-72 min-w-72 max-w-72">{t('common.organization')}</TH>
                <TH className="w-28">{t('directorList.group')}</TH>
                <TH className="min-w-64">{t('autodromeResGaiPage.student')}</TH>
                <TH>{t('autodromeResGaiPage.startDate')}</TH>
                <TH>{t('autodromeResGaiPage.endDate')}</TH>
                <TH>{t('autodromeResGaiPage.requiredCount')}</TH>
                <TH>{t('autodromeResGaiPage.requiredHours')}</TH>
                <TH>{t('autodromeResGaiPage.attendedCount')}</TH>
                <TH>{t('autodromeResGaiPage.attendedHours')}</TH>
                <TH className="w-40">{t('autodromeResGaiPage.groupStatus')}</TH>
              </HeaderTR>
              <FilterTR>
                <FilterTH />
                <FilterTH>
                  <OrganizationSelect
                    size="sm"
                    className="!w-full !min-w-64"
                    value={organizationSearch}
                    onChange={(event) => setOrganizationSearch(event.target.value)}
                  />
                </FilterTH>
                <FilterTH />
                <FilterTH>
                  <SearchInput
                    size="sm"
                    id="res-gai-student"
                    name="res-gai-student"
                    label={t('autodromeResGaiPage.studentSearch')}
                    placeholder={t('autodromeResGaiPage.studentSearch')}
                    value={studentSearch}
                    onChange={(event) => setStudentSearch(event.target.value)}
                  />
                </FilterTH>
                <FilterTH />
                <FilterTH />
                <FilterTH />
                <FilterTH />
                <FilterTH />
                <FilterTH />
                <FilterTH>
                  <Select
                    size="sm"
                    className="!w-full !min-w-36"
                    value={groupStatusValue}
                    options={statusOptions}
                    onChange={(event) => setGroupStatusValue(event.target.value)}
                  />
                </FilterTH>
              </FilterTR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={11} />
              ) : (
                rows.map((row, index) => {
                  const groupId = row.group?.id
                  const groupName = row.group?.name?.trim() || ''
                  const status = groupStatus(row.group?.status, t)
                  const start = formatDate(row.group?.edu_starting_date)
                  const end = formatDate(row.group?.edu_ending_date)
                  return (
                    <TR key={String(row.id ?? `${page}-${index}`)}>
                      <TD className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD className="w-72 max-w-72 overflow-hidden">
                        <OrganizationLabel
                          stacked
                          className="max-w-full [&>span]:block [&>span]:max-w-full [&>span]:min-w-0"
                          name={row.organization?.name}
                          inn={row.organization?.inn}
                        />
                      </TD>
                      <TD className="whitespace-nowrap">
                        {groupId ? (
                          <Button
                            variant="link"
                            size="inline"
                            onClick={() =>
                              navigate(
                                `${autodromeAttendanceStudentsPath(groupId)}?groupName=${encodeURIComponent(groupName)}`,
                              )
                            }
                          >
                            {groupName || '—'}
                          </Button>
                        ) : (
                          groupName || '—'
                        )}
                      </TD>
                      <TD>
                        {row.student?.full_name?.trim() || (
                          <span className="text-muted">{t('autodromeResGaiPage.noStudent')}</span>
                        )}
                      </TD>
                      <TD className="text-center">
                        {start ? (
                          <Badge tone="teal">{start}</Badge>
                        ) : (
                          <span className="text-muted">{t('autodromeResGaiPage.notEntered')}</span>
                        )}
                      </TD>
                      <TD className="text-center">
                        {end ? (
                          <Badge tone="rose">{end}</Badge>
                        ) : (
                          <span className="text-muted">{t('autodromeResGaiPage.notEntered')}</span>
                        )}
                      </TD>
                      <TD className="text-center">
                        <Badge tone="teal">{metric(row.required_attendance_count)}</Badge>
                      </TD>
                      <TD className="text-center">
                        <Badge tone="amber">{metric(row.required_attendance_hours)}</Badge>
                      </TD>
                      <TD className="text-center">
                        <Badge tone="teal">{metric(row.total_attendance_count)}</Badge>
                      </TD>
                      <TD className="text-center">
                        <Badge tone="amber">{attendanceHours(row)}</Badge>
                      </TD>
                      <TD className="text-center">
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
