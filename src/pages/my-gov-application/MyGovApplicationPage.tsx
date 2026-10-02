import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  EmptyTR,
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
import { useAuth } from '@/features/auth'
import {
  formatMyGovDateTime,
  formatTaskId,
  useMyGovApplicationsQuery,
} from '@/features/my-gov-application'
import { usePageState } from '@/hooks'
import {
  ApplicationDetailModal,
  CopyTaskButton,
  ViewApplicationButton,
} from './ApplicationDetailModal'
import { MyGovSimulator } from './MyGovSimulator'

export function MyGovApplicationPage() {
  const { t } = useTranslation()
  const { isSuperAdmin } = useAuth()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [taskId, setTaskId] = usePageState('taskId', '')
  const [groupName, setGroupName] = usePageState('groupName', '')
  const [detailId, setDetailId] = useState<number | null>(null)

  useEffect(() => {
    setPage(1)
  }, [taskId, groupName, pageSize])

  const { data, isLoading, isError } = useMyGovApplicationsQuery({
    page,
    showCount: pageSize,
    taskId: taskId.trim() || undefined,
    groupName: groupName.trim() || undefined,
  })
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const colCount = isSuperAdmin ? 7 : 6

  return (
    <>
      <Header title={t('nav.myGovApplication')} />
      <PageMain>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <>
            <Table fill={false} storageKey="my-gov-applications">
              <THead>
                <TR>
                  <TH column="nr" className="w-12 text-center">
                    №
                  </TH>
                  <TH column="task">{t('myGovPage.colTask')}</TH>
                  <TH column="group">{t('myGovPage.colGroup')}</TH>
                  <TH column="event">{t('myGovPage.colEventTime')}</TH>
                  <TH column="created">{t('myGovPage.colCreated')}</TH>
                  {isSuperAdmin ? (
                    <TH column="org">{t('myGovPage.colOrg')}</TH>
                  ) : null}
                  <TH column="actions" className="w-16 text-center">
                    {t('common.actions')}
                  </TH>
                </TR>
                <TR>
                  <FilterTH column="nr" />
                  <FilterTH column="task">
                    <SearchInput
                      size="sm"
                      label={t('myGovPage.searchTask')}
                      placeholder={t('myGovPage.searchTask')}
                      value={taskId}
                      onChange={(e) => setTaskId(e.target.value)}
                    />
                  </FilterTH>
                  <FilterTH column="group">
                    <SearchInput
                      size="sm"
                      label={t('myGovPage.searchGroup')}
                      placeholder={t('myGovPage.searchGroup')}
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </FilterTH>
                  <FilterTH column="event" />
                  <FilterTH column="created" />
                  {isSuperAdmin ? <FilterTH column="org" /> : null}
                  <FilterTH column="actions" />
                </TR>
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <EmptyTR colSpan={colCount} description={t('common.empty')} />
                ) : (
                  rows.map((row, index) => (
                    <TR key={row.id}>
                      <TD column="nr" className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD column="task">
                        <span className="inline-flex items-center gap-1">
                          {formatTaskId(row.task_id)}
                          <CopyTaskButton value={row.task_id} />
                        </span>
                      </TD>
                      <TD column="group">{row.group_name || '—'}</TD>
                      <TD column="event">
                        <Badge tone="amber">
                          {formatMyGovDateTime(row.event_time)}
                        </Badge>
                      </TD>
                      <TD column="created">
                        <Badge tone="teal">
                          {formatMyGovDateTime(row.created_at)}
                        </Badge>
                      </TD>
                      {isSuperAdmin ? (
                        <TD column="org">{row.organization?.name || '—'}</TD>
                      ) : null}
                      <TD column="actions" className="text-center">
                        <ViewApplicationButton
                          onClick={() => setDetailId(row.id)}
                        />
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={total}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
        <MyGovSimulator />
      </PageMain>
      <ApplicationDetailModal id={detailId} onClose={() => setDetailId(null)} />
    </>
  )
}
