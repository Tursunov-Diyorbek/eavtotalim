import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import { groupShowPath, reportsMonitoringStudentPath } from '@/config'
import { useMonitoringStudentsQuery } from '@/features/monitoring-report'
import { usePageState } from '@/hooks'
import { asFio, asLangName } from '@/lib/apiPage'
import { formatNumber } from '@/lib/format'
import type { MonitoringStudentRow } from '@/types/monitoring-report'

function studentIdOf(row: MonitoringStudentRow) {
  return row.student_id ?? row.id ?? null
}

function studentName(row: MonitoringStudentRow) {
  const short = [row.last_name, row.first_name]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
    .join(' ')
  return short || asFio(row)
}

export function ReportsMonitoringPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [nameSearch, setNameSearch] = usePageState('nameSearch', '')
  const [groupSearch, setGroupSearch] = usePageState('groupSearch', '')

  useEffect(() => {
    setPage(1)
  }, [nameSearch, groupSearch, pageSize])

  const { data, isLoading, isError } = useMonitoringStudentsQuery({
    page,
    showCount: pageSize,
    name: nameSearch,
    groupName: groupSearch,
  })
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages =
    data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  return (
    <>
      <Header title={t('nav.reportsMonitoringByStudent')} />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="reports-monitoring-by-student">
            <THead>
              <TR className="hover:bg-transparent">
                <TH column="index" className="w-10">
                  №
                </TH>
                <TH column="fio">{t('directorList.fio')}</TH>
                <TH column="group">{t('directorList.group')}</TH>
                <TH column="remaining" className="w-44 text-center">
                  {t('directorList.remaining')}
                </TH>
              </TR>
              <TR className="bg-white hover:bg-transparent">
                <FilterTH column="index" />
                <FilterTH column="fio">
                  <SearchInput
                    size="sm"
                    id="monitoring-fio"
                    name="monitoring-fio"
                    label={t('directorList.fio')}
                    placeholder={t('statsPage.searchByStudent')}
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                  />
                </FilterTH>
                <FilterTH column="group">
                  <SearchInput
                    size="sm"
                    id="monitoring-group"
                    name="monitoring-group"
                    label={t('directorList.group')}
                    placeholder={t('statsPage.searchByGroup')}
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                  />
                </FilterTH>
                <FilterTH column="remaining" />
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={4}>
                    <EmptyState
                      className="border-0 py-4"
                      description={t('common.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => {
                  const id = studentIdOf(row)
                  const groupName = asLangName(row.group, i18n.language)
                  const groupId = row.group?.id
                  return (
                    <TR key={String(id ?? `${page}-${index}`)}>
                      <TD column="index" className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD column="fio">
                        {id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-0 py-0 font-medium text-signal hover:underline"
                            onClick={() =>
                              navigate(reportsMonitoringStudentPath(id), {
                                state: { fullName: studentName(row) },
                              })
                            }
                          >
                            {asFio(row)}
                          </Button>
                        ) : (
                          asFio(row)
                        )}
                      </TD>
                      <TD column="group">
                        {groupId ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-0 py-0 font-medium text-signal hover:underline"
                            onClick={() => navigate(groupShowPath(groupId))}
                          >
                            {groupName}
                          </Button>
                        ) : (
                          groupName
                        )}
                      </TD>
                      <TD column="remaining" className="text-center">
                        <Badge tone="amber">
                          {formatNumber(row.remaining_lessons)}
                        </Badge>
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
