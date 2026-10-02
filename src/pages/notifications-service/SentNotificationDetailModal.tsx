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
import { asLangName } from '@/lib/apiPage'
import { formatPhoneLocal, parsePhoneDigits } from '@/lib/phone'
import {
  scheduleStatusTone,
  useMessageScheduleStudentsQuery,
} from '@/features/notifications-service'

type Props = {
  id: number | null
  onClose: () => void
}

function phoneLabel(raw: string | null | undefined): string {
  const digits = parsePhoneDigits(raw)
  if (!digits) return '—'
  return `+998 ${formatPhoneLocal(digits)}`
}

function statusLabel(name: unknown, lang: string): string {
  const label = asLangName(name, lang)
  return label === '—' ? '' : label
}

export function SentNotificationDetailModal({ id, onClose }: Props) {
  const { t, i18n } = useTranslation()
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
  const lang =
    i18n.language === 'ru' ? 'ru' : i18n.language === 'kiril' ? 'kiril' : 'uz'

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
        <Table fill={false} storageKey="notifications-sent-detail">
          <THead>
            <TR>
              <TH column="nr" className="w-12 text-center">
                №
              </TH>
              <TH column="body">{t('notificationsPage.colBody')}</TH>
              <TH column="phone" className="w-40">
                {t('notificationsPage.colPhone')}
              </TH>
              <TH column="status" className="w-44">
                {t('directorList.status')}
              </TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row, index) => {
              const status = statusLabel(
                row.message_schedule_student_status?.name,
                lang,
              )
              return (
                <TR key={row.id}>
                  <TD column="nr" className="text-center text-muted">
                    {(page - 1) * pageSize + index + 1}
                  </TD>
                  <TD column="body">
                    <p className="m-0 max-w-xl line-clamp-2 text-[13px] leading-snug">
                      {row.body || '—'}
                    </p>
                  </TD>
                  <TD column="phone" className="whitespace-nowrap tabular-nums">
                    {phoneLabel(row.phone)}
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
                </TR>
              )
            })}
          </TBody>
        </Table>
      )}
      <div className="mt-3">
        <Pagination
          persist={false}
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
