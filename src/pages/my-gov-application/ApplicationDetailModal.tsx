import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Eye } from 'lucide-react'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Modal,
  SkeletonLines,
  Textarea,
  notify,
} from '@/components/ui'
import { useAuth } from '@/features/auth'
import {
  formatMyGovDateTime,
  formatTaskId,
  useMyGovApplicationQuery,
  useResendMyGovAnswerMutation,
} from '@/features/my-gov-application'

type Props = {
  id: number | null
  onClose: () => void
}

export function ApplicationDetailModal({ id, onClose }: Props) {
  const { t } = useTranslation()
  const { isSuperAdmin } = useAuth()
  const { data, isLoading, isError } = useMyGovApplicationQuery(id)
  const resendMutation = useResendMyGovAnswerMutation()
  const [resendOpen, setResendOpen] = useState(false)
  const [message, setMessage] = useState('')
  const histories = data?.uztelecom_aes_event_histories ?? []

  return (
    <>
      <Modal
        open={id != null}
        onClose={onClose}
        title={t('myGovPage.historyTitle')}
        sizeClassName="max-w-xl"
      >
        {isError ? (
          <ErrorMessage />
        ) : isLoading || !data ? (
          <SkeletonLines lines={6} />
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-display text-sm font-semibold text-deep">
                {t('myGovPage.applicationId')}: {formatTaskId(data.task_id)}
              </p>
              {isSuperAdmin ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setResendOpen(true)}
                >
                  {t('myGovPage.resend')}
                </Button>
              ) : null}
            </div>
            <p className="text-sm text-ink">
              <span className="text-muted">{t('myGovPage.groupName')}: </span>
              {data.group_name || '—'}
            </p>
            <p className="text-sm text-ink">
              <span className="text-muted">{t('myGovPage.eventId')}: </span>
              {data.id}
            </p>
            <p className="text-sm text-ink">
              <span className="text-muted">{t('directorList.description')}: </span>
              {data.comment || t('myGovPage.notMentioned')}
            </p>
            <p className="text-sm text-ink">
              <span className="text-muted">{t('myGovPage.eventTime')}: </span>
              {formatMyGovDateTime(data.event_time)}
            </p>
            <div className="space-y-2 border-t border-mist/70 pt-3">
              {histories.length === 0 ? (
                <EmptyState description={t('common.empty')} />
              ) : (
                histories.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-mist/70 bg-fog/30 px-3 py-2"
                  >
                    <Badge tone="signal">{item.status?.name || '—'}</Badge>
                    {item.status?.title ? (
                      <p className="mt-1 text-sm text-deep">{item.status.title}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted">
                      {t('directorList.time')}: {formatMyGovDateTime(item.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={resendOpen}
        onClose={() => setResendOpen(false)}
        title={t('myGovPage.resend')}
        sizeClassName="max-w-lg"
      >
        <div className="space-y-3">
          <Textarea
            label={t('directorList.text')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setResendOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={resendMutation.isPending}
              onClick={() => {
                if (!id) return
                resendMutation.mutate(
                  { id, message },
                  {
                    onSuccess: () => {
                      notify.success(t('myGovPage.changed'))
                      setResendOpen(false)
                      setMessage('')
                    },
                    onError: (err) =>
                      notify.error(err.message || t('common.loadError')),
                  },
                )
              }}
            >
              {t('notificationsPage.send')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export function CopyTaskButton({ value }: { value: string | number | null | undefined }) {
  const { t } = useTranslation()
  if (value == null || value === '') return null
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={t('myGovPage.copy')}
      onClick={() => {
        void navigator.clipboard.writeText(String(value)).then(
          () => notify.success(t('myGovPage.copied')),
          () => notify.error(t('common.loadError')),
        )
      }}
    >
      <Copy className="size-3.5" />
    </Button>
  )
}

export function ViewApplicationButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <Button
      variant="soft"
      size="icon-sm"
      aria-label={t('common.view')}
      onClick={onClick}
    >
      <Eye className="size-3.5" />
    </Button>
  )
}
