import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Pagination,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import {
  scheduleStatusTone,
  useMessageSchedulesQuery,
} from '@/features/notifications-service'
import { SentNotificationDetailModal } from './SentNotificationDetailModal'

export function SentNotificationsTab() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailId, setDetailId] = useState<number | null>(null)
  const { data, isLoading, isError } = useMessageSchedulesQuery(page, pageSize)
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  useEffect(() => {
    setPage(1)
  }, [pageSize])

  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm font-semibold tracking-wide text-deep uppercase">
        {t('notificationsPage.sentTitle')}
      </h3>
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
              <TH>{t('notificationsPage.colName')}</TH>
              <TH>{t('notificationsPage.colBody')}</TH>
              <TH>{t('notificationsPage.colStudents')}</TH>
              <TH>{t('directorList.status')}</TH>
              <TH>{t('common.actions')}</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row, index) => (
              <TR key={row.id}>
                <TD className="text-muted">
                  {(page - 1) * pageSize + index + 1}
                </TD>
                <TD>{row.name || '—'}</TD>
                <TD>
                  <span className="line-clamp-2">{row.body || '—'}</span>
                </TD>
                <TD>
                  <Badge tone="signal">
                    {row.students_count ?? 0} {t('notificationsPage.pcs')}
                  </Badge>
                </TD>
                <TD>
                  <Badge tone={scheduleStatusTone(row.status)}>
                    {row.message_schedule_status?.name || '—'}
                  </Badge>
                </TD>
                <TD>
                  <Button
                    variant="soft"
                    size="icon-sm"
                    aria-label={t('common.view')}
                    onClick={() => setDetailId(row.id)}
                  >
                    <Eye className="size-3.5" />
                  </Button>
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
      <SentNotificationDetailModal
        id={detailId}
        onClose={() => setDetailId(null)}
      />
    </div>
  )
}
