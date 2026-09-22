import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Pagination,
  ShowButton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { asLangName } from '@/lib/apiPage'
import {
  scheduleStatusTone,
  useMessageSchedulesQuery,
} from '@/features/notifications-service'
import { SentNotificationDetailModal } from './SentNotificationDetailModal'

function statusLabel(name: unknown, lang: string): string {
  const label = asLangName(name, lang)
  return label === '—' ? '' : label
}

export function SentNotificationsTab() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailId, setDetailId] = useState<number | null>(null)
  const { data, isLoading, isError, error } = useMessageSchedulesQuery(page, pageSize)
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const lang =
    i18n.language === 'ru' ? 'ru' : i18n.language === 'kiril' ? 'kiril' : 'uz'

  useEffect(() => {
    setPage(1)
  }, [pageSize])

  return (
    <div className="flex flex-col gap-3">
      {isError ? (
        <ErrorMessage>
          {error instanceof Error ? error.message : undefined}
        </ErrorMessage>
      ) : isLoading ? (
        <ListPageSkeleton rows={8} />
      ) : rows.length === 0 ? (
        <EmptyState description={t('common.empty')} />
      ) : (
        <>
          <Table storageKey="notifications-sent" fill={false}>
            <THead>
              <TR>
                <TH column="nr" className="w-12 text-center">
                  №
                </TH>
                <TH column="name" className="w-40">
                  {t('notificationsPage.colName')}
                </TH>
                <TH column="body">{t('notificationsPage.colBody')}</TH>
                <TH column="students" className="w-28 text-center">
                  {t('notificationsPage.colStudents')}
                </TH>
                <TH column="status" className="w-44">
                  {t('directorList.status')}
                </TH>
                <TH column="actions" className="w-16 text-center">
                  {t('common.actions')}
                </TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row, index) => {
                const status = statusLabel(
                  row.message_schedule_status?.name,
                  lang,
                )
                const body = row.body?.trim() || '—'
                return (
                  <TR key={row.id}>
                    <TD column="nr" className="text-center text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD column="name">
                      <span
                        className="line-clamp-2 font-medium text-deep"
                        title={row.name || undefined}
                      >
                        {row.name || '—'}
                      </span>
                    </TD>
                    <TD column="body">
                      <p
                        className="m-0 max-w-xl line-clamp-2 text-[13px] leading-snug text-ink"
                        title={body === '—' ? undefined : body}
                      >
                        {body}
                      </p>
                    </TD>
                    <TD column="students" className="text-center">
                      <Badge tone="signal">
                        {row.students_count ?? 0}{' '}
                        {t('notificationsPage.pcs')}
                      </Badge>
                    </TD>
                    <TD column="status">
                      <Badge
                        tone={scheduleStatusTone(row.status)}
                        title={status || undefined}
                      >
                        <span className="max-w-38 truncate">
                          {status || '—'}
                        </span>
                      </Badge>
                    </TD>
                    <TD column="actions" className="text-center">
                      <ShowButton onClick={() => setDetailId(row.id)} />
                    </TD>
                  </TR>
                )
              })}
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
      <SentNotificationDetailModal
        id={detailId}
        onClose={() => setDetailId(null)}
      />
    </div>
  )
}
