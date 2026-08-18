import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Modal,
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
  useMessageScheduleStudentsQuery,
} from '@/features/notifications-service'

type Props = {
  id: number | null
  onClose: () => void
}

export function SentNotificationDetailModal({ id, onClose }: Props) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, isLoading, isError } = useMessageScheduleStudentsQuery(
    id,
    page,
    pageSize,
  )
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  useEffect(() => {
    setPage(1)
  }, [id, pageSize])

  return (
    <Modal
      open={id != null}
      onClose={onClose}
      title={t('notificationsPage.detailTitle')}
      sizeClassName="max-w-5xl"
    >
      {isError ? (
        <ErrorMessage />
      ) : isLoading ? (
        <ListPageSkeleton rows={6} />
      ) : rows.length === 0 ? (
        <EmptyState description={t('common.empty')} />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH className="w-10">№</TH>
              <TH>{t('notificationsPage.colBody')}</TH>
              <TH>{t('notificationsPage.colPhone')}</TH>
              <TH>{t('directorList.status')}</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row, index) => (
              <TR key={row.id}>
                <TD className="text-muted">
                  {(page - 1) * pageSize + index + 1}
                </TD>
                <TD>
                  <span className="line-clamp-2">{row.body || '—'}</span>
                </TD>
                <TD>{row.phone || '—'}</TD>
                <TD>
                  <Badge tone={scheduleStatusTone(row.status)}>
                    {row.message_schedule_student_status?.name || '—'}
                  </Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
      <div className="mt-3">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={total}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      </div>
    </Modal>
  )
}
