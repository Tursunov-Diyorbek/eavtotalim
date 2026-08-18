import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Badge,
  EmptyState,
  ErrorMessage,
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
  const [taskId, setTaskId] = useState('')
  const [groupName, setGroupName] = useState('')
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

  return (
    <>
      <Header title={t('nav.myGovApplication')} />
      <main className="flex-1 space-y-4 p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:max-w-2xl *:min-w-0">
          <SearchInput
            size="md"
            label={t('myGovPage.searchTask')}
            placeholder={t('myGovPage.searchTask')}
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
          />
          <SearchInput
            size="md"
            label={t('myGovPage.searchGroup')}
            placeholder={t('myGovPage.searchGroup')}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : rows.length === 0 ? (
          <EmptyState description={t('common.empty')} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                <TH>{t('myGovPage.colTask')}</TH>
                <TH>{t('myGovPage.colGroup')}</TH>
                <TH>{t('myGovPage.colEventTime')}</TH>
                <TH>{t('myGovPage.colCreated')}</TH>
                {isSuperAdmin ? <TH>{t('myGovPage.colOrg')}</TH> : null}
                <TH>{t('common.actions')}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row, index) => (
                <TR key={row.id}>
                  <TD className="text-muted">
                    {(page - 1) * pageSize + index + 1}
                  </TD>
                  <TD>
                    <span className="inline-flex items-center gap-1">
                      {formatTaskId(row.task_id)}
                      <CopyTaskButton value={row.task_id} />
                    </span>
                  </TD>
                  <TD>{row.group_name || '—'}</TD>
                  <TD>
                    <Badge tone="amber">{formatMyGovDateTime(row.event_time)}</Badge>
                  </TD>
                  <TD>
                    <Badge tone="teal">{formatMyGovDateTime(row.created_at)}</Badge>
                  </TD>
                  {isSuperAdmin ? (
                    <TD>{row.organization?.name || '—'}</TD>
                  ) : null}
                  <TD>
                    <ViewApplicationButton onClick={() => setDetailId(row.id)} />
                  </TD>
                </TR>
              ))}
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
        <MyGovSimulator />
      </main>
      <ApplicationDetailModal id={detailId} onClose={() => setDetailId(null)} />
    </>
  )
}
