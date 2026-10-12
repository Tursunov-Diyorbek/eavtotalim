import { useEffect, useRef, useState } from 'react'
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
  OrganizationSelect,
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
import { usePassedCameraStudentsQuery } from '@/features/autodrome-dashboard'
import { usePageState } from '@/hooks'
import { formatDateTime } from '@/lib/format'

export function StudentsPassedCameraPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [studentSearch, setStudentSearch] = usePageState('student', '')
  const [groupSearch, setGroupSearch] = usePageState('group', '')
  const [orgSearch, setOrgSearch] = usePageState('org', '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const filterKey = [studentSearch, groupSearch, orgSearch, pageSize].join('|')
  const filterRef = useRef(filterKey)

  useEffect(() => {
    if (filterRef.current === filterKey) return
    filterRef.current = filterKey
    setPage(1)
  }, [filterKey])

  const query = usePassedCameraStudentsQuery({
    page,
    showCount: pageSize,
    studentSearch,
    groupSearch,
    organizationSearch: orgSearch,
  })
  const rows = query.data?.data ?? []
  const total = query.data?.total_items ?? 0
  const totalPages = query.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  return (
    <>
      <Header title={t('studentsPassedCamera.title')} onBack={() => navigate(-1)} />
      <PageMain fill>
        {query.isError ? (
          <ErrorMessage />
        ) : query.isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <Table storageKey="students-passed-camera">
              <THead>
                <HeaderTR>
                  <TH column="n" className="w-12 text-center">
                    №
                  </TH>
                  <TH column="fio">{t('statsPage.fish')}</TH>
                  <TH column="group" className="min-w-48">
                    {t('autodromeHome.groupName')}
                  </TH>
                  <TH column="org">{t('studentsPassedCamera.school')}</TH>
                  <TH column="entry" className="text-center">
                    {t('studentsPassedCamera.firstEntry')}
                  </TH>
                </HeaderTR>
                <FilterTR>
                  <FilterTH column="n" />
                  <FilterTH column="fio">
                    <SearchInput
                      size="sm"
                      id="passed-fio"
                      name="passed-fio"
                      label={t('statsPage.fish')}
                      placeholder={t('studentsPassedCamera.searchStudent')}
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                  </FilterTH>
                  <FilterTH column="group" className="min-w-48">
                    <SearchInput
                      size="sm"
                      className="min-w-44"
                      id="passed-group"
                      name="passed-group"
                      label={t('autodromeHome.groupName')}
                      placeholder={t('studentsPassedCamera.searchGroup')}
                      value={groupSearch}
                      onChange={(e) => setGroupSearch(e.target.value)}
                    />
                  </FilterTH>
                  <FilterTH column="org">
                    <OrganizationSelect
                      id="passed-org"
                      name="passed-org"
                      size="sm"
                      valueKey="name"
                      value={orgSearch}
                      onChange={(e) => setOrgSearch(e.target.value)}
                    />
                  </FilterTH>
                  <FilterTH column="entry" />
                </FilterTR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <EmptyTR colSpan={5} description={t('common.empty')} />
                ) : (
                  rows.map((row, index) => {
                    const groupId = row.group_id
                    const groupName = row.group_name || '—'
                    return (
                      <TR key={row.id ?? `${groupId ?? 'g'}-${index}`}>
                        <TD column="n" className="text-center text-muted">
                          {(page - 1) * pageSize + index + 1}
                        </TD>
                        <TD column="fio" className="font-medium">
                          {row.full_name || '—'}
                        </TD>
                        <TD column="group" className="min-w-48">
                          {groupId != null ? (
                            <Button
                              variant="link"
                              size="inline"
                              onClick={() =>
                                navigate(
                                  `${autodromeAttendanceStudentsPath(groupId)}?groupName=${encodeURIComponent(groupName)}`,
                                  { state: { groupName } },
                                )
                              }
                            >
                              {groupName}
                            </Button>
                          ) : (
                            groupName
                          )}
                        </TD>
                        <TD column="org">{row.organization_name || '—'}</TD>
                        <TD column="entry" className="text-center">
                          <Badge tone="teal">
                            {formatDateTime(row.first_entry, i18n.language) || '—'}
                          </Badge>
                        </TD>
                      </TR>
                    )
                  })
                )}
              </TBody>
            </Table>
            <Pagination
              className="shrink-0"
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
        )}
      </PageMain>
    </>
  )
}
