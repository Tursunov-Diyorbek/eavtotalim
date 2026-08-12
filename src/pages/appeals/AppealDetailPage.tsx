import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  Panel,
  Skeleton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { routes } from '@/config'
import {
  appealStatusMeta,
  isClosedFlag,
  pickAppealTypeName,
  useAppealDetailQuery,
  useCloseAppealMutation,
} from '@/features/appeals'
import { formatDate, fullNameOf } from '@/lib/format'

function DetailSkeleton() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Panel className="space-y-3 p-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-20 w-full" rounded="lg" />
        <Skeleton className="h-4 w-2/3" />
      </Panel>
      <Panel className="space-y-3 p-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-28 w-full" rounded="lg" />
        <Skeleton className="h-8 w-24" rounded="lg" />
      </Panel>
    </div>
  )
}

export function AppealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [comment, setComment] = useState('')
  const [formError, setFormError] = useState('')

  const { data, isLoading, isError } = useAppealDetailQuery(id)
  const closeMutation = useCloseAppealMutation()

  const title =
    fullNameOf(data?.student) ||
    pickAppealTypeName(data?.appeal_type?.name, i18n.language) ||
    t('appeal.title')

  const status = appealStatusMeta(data?.status, t)
  const closed = isClosedFlag(data?.is_closed)
  const comments = data?.comments ?? []

  const onCloseAppeal = async () => {
    if (!id) return
    if (!comment.trim()) {
      setFormError(t('appeal.commentRequired'))
      return
    }
    setFormError('')
    try {
      await closeMutation.mutateAsync({ id, comment })
      navigate(routes.appeal)
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t('appeal.closeError'),
      )
    }
  }

  return (
    <>
      <Header
        title={title}
        description={t('appeal.detailDescription')}
        actions={
          <Link
            to={routes.appeal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-mist bg-white px-2.5 py-1.5 text-[12px] font-semibold text-deep transition hover:bg-fog"
          >
            <ArrowLeft className="size-3.5" />
            {t('appeal.back')}
          </Link>
        }
      />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {isLoading ? (
          <DetailSkeleton />
        ) : isError || !data ? (
          <ErrorMessage />
        ) : (
          <>
            <div className="grid gap-3 lg:grid-cols-2">
              <Panel className="space-y-4 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Info
                    label={t('appeal.type')}
                    value={
                      pickAppealTypeName(
                        data.appeal_type?.name,
                        i18n.language,
                      ) || '—'
                    }
                  />
                  <Info
                    label={t('appeal.status')}
                    value={<Badge tone={status.tone}>{status.label}</Badge>}
                  />
                  <Info
                    label={t('appeal.createdUpdated')}
                    value={
                      <span className="text-[12px]">
                        {formatDate(data.created_at, i18n.language) || '—'}
                        {' — '}
                        {formatDate(data.updated_at, i18n.language) || '—'}
                      </span>
                    }
                  />
                  <Info
                    label={t('appeal.openClosed')}
                    value={
                      <Badge tone={closed ? 'rose' : 'signal'}>
                        {closed ? t('appeal.closed') : t('appeal.open')}
                      </Badge>
                    }
                  />
                  <Info
                    label={t('appeal.justified')}
                    value={
                      <Badge
                        tone={
                          data.is_justified === true || data.is_justified === 1
                            ? 'signal'
                            : 'rose'
                        }
                      >
                        {data.is_justified === true || data.is_justified === 1
                          ? t('appeal.justifiedYes')
                          : t('appeal.justifiedNo')}
                      </Badge>
                    }
                  />
                  <Info
                    label={t('appeal.archived')}
                    value={
                      <Badge
                        tone={
                          data.is_archived === true || data.is_archived === 1
                            ? 'signal'
                            : 'neutral'
                        }
                      >
                        {data.is_archived === true || data.is_archived === 1
                          ? t('appeal.archivedYes')
                          : t('appeal.archivedNo')}
                      </Badge>
                    }
                  />
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-semibold tracking-wide text-muted">
                    {t('appeal.message')}
                  </p>
                  <div className="rounded-lg border border-mist/70 bg-fog/40 p-3 text-[13px] leading-relaxed text-ink whitespace-pre-wrap">
                    {data.message || '—'}
                  </div>
                </div>
              </Panel>

              <Panel className="flex flex-col gap-3 p-4">
                <p className="text-[13px] font-semibold text-deep">
                  {t('appeal.closeTitle')}
                </p>
                {closed ? (
                  <p className="text-[13px] text-muted">{t('appeal.alreadyClosed')}</p>
                ) : (
                  <>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={6}
                      className="rounded-lg border border-mist bg-white px-3 py-2 text-[13px] text-ink outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
                      placeholder={t('appeal.commentPlaceholder')}
                    />
                    {formError ? (
                      <ErrorMessage fallback={false}>{formError}</ErrorMessage>
                    ) : null}
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        loading={closeMutation.isPending}
                        onClick={() => void onCloseAppeal()}
                      >
                        {t('appeal.closeSubmit')}
                      </Button>
                    </div>
                  </>
                )}
              </Panel>
            </div>

            <div className="space-y-2">
              <h3 className="text-[13px] font-semibold text-deep">
                {t('appeal.comments')}
              </h3>
              {comments.length === 0 ? (
                <EmptyState description={t('appeal.noComments')} />
              ) : (
                <Table>
                  <THead>
                    <TR>
                      <TH className="w-12 text-center">№</TH>
                      <TH>{t('appeal.commentAuthor')}</TH>
                      <TH className="w-28">{t('appeal.created')}</TH>
                      <TH>{t('appeal.comment')}</TH>
                      <TH className="w-32">{t('appeal.status')}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {comments.map((item, index) => {
                      const st = appealStatusMeta(item.status, t)
                      return (
                        <TR key={item.id ?? index}>
                          <TD className="text-center text-muted">
                            {index + 1}
                          </TD>
                          <TD>{item.user_name || '—'}</TD>
                          <TD className="whitespace-nowrap text-[12px] text-muted">
                            {formatDate(item.created_at, i18n.language) || '—'}
                          </TD>
                          <TD className="text-[13px]">{item.comment || '—'}</TD>
                          <TD>
                            <Badge tone={st.tone}>{st.label}</Badge>
                          </TD>
                        </TR>
                      )
                    })}
                  </TBody>
                </Table>
              )}
            </div>
          </>
        )}
      </main>
    </>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold tracking-wide text-muted">
        {label}
      </p>
      <div className="text-[13px] text-deep">{value}</div>
    </div>
  )
}
