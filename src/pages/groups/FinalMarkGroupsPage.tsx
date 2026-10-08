import { useState } from 'react'
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
  Pagination,
  Table,
  TableSearch,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { groupFinalMarksPath } from '@/config'
import { useGroupsQuery } from '@/features/groups'
import { usePageState } from '@/hooks'
import { formatDate, formatNumber } from '@/lib'
import type { GroupItem } from '@/types/groups'

function statusOf(value: GroupItem['edu_status']) {
  const code = Number(value)
  if (code === 2) return { key: 'autodromeAttendancePage.statusFinished', tone: 'rose' as const }
  if (code === 0) return { key: 'autodromeAttendancePage.statusNew', tone: 'amber' as const }
  return { key: 'autodromeAttendancePage.statusActive', tone: 'teal' as const }
}

export function FinalMarkGroupsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = usePageState('name', '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const query = useGroupsQuery({
    page,
    showCount: pageSize,
    eduStatus: 'all',
    name: search.trim() || undefined,
    sortKey: 'edu_ending_date',
    sortOrder: 'DESC',
  })

  const rows = query.data?.data ?? []
  const total = query.data?.total_items ?? 0
  const totalPages = query.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  return (
    <>
      <Header title={t('nav.finalMarkGroups')} />
      <PageMain fill>
        {query.isError ? (
          <ErrorMessage />
        ) : query.isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <Table storageKey="final-mark-groups">
              <THead>
                <HeaderTR>
                  <TH className="w-14 text-center">№</TH>
                  <TH>{t('groupsPage.colName')}</TH>
                  <TH className="w-40 text-center">{t('groupsPage.colStudents')}</TH>
                  <TH className="w-40 text-center">{t('groupsPage.showPage.certifiedCount')}</TH>
                  <TH className="w-44">{t('groupsPage.colEnd')}</TH>
                  <TH className="w-36">{t('autodromeAttendancePage.groupStatus')}</TH>
                </HeaderTR>
                <FilterTR>
                  <FilterTH />
                  <FilterTH>
                    <TableSearch
                      value={search}
                      placeholder={t('groupsPage.searchPlaceholder')}
                      onChange={(event) => {
                        setSearch(event.target.value)
                        setPage(1)
                      }}
                    />
                  </FilterTH>
                  <FilterTH />
                  <FilterTH />
                  <FilterTH />
                  <FilterTH />
                </FilterTR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <EmptyTR colSpan={6} description={t('groupsPage.empty')} />
                ) : (
                  rows.map((row, index) => {
                    const status = statusOf(row.edu_status)
                    const students = row.grouped_students_count ?? row.students_count ?? 0
                    const certified = row.certificate_students_count ?? 0
                    const name = row.name_uz || row.name || '—'
                    return (
                      <TR key={row.id}>
                        <TD className="text-center text-muted">
                          {(page - 1) * pageSize + index + 1}
                        </TD>
                        <TD>
                          <Button
                            variant="link"
                            size="inline"
                            onClick={() => navigate(groupFinalMarksPath(row.id))}
                          >
                            {name}
                          </Button>
                        </TD>
                        <TD className="text-center">
                          <Badge tone="signal">{formatNumber(students)}</Badge>
                        </TD>
                        <TD className="text-center">
                          <Badge tone={certified > 0 ? 'teal' : 'neutral'}>
                            {formatNumber(certified)}
                          </Badge>
                        </TD>
                        <TD>{formatDate(row.edu_ending_date, i18n.language) || '—'}</TD>
                        <TD>
                          <Badge tone={status.tone}>{t(status.key)}</Badge>
                        </TD>
                      </TR>
                    )
                  })
                )}
              </TBody>
            </Table>
            <div className="shrink-0">
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
            </div>
          </div>
        )}
      </PageMain>
    </>
  )
}
