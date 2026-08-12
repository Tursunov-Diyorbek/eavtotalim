import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bookmark, BookmarkX, Phone } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Button,
  EmptyState,
  ErrorMessage,
  Modal,
  Notification,
  Panel,
  Skeleton,
  SkeletonCard,
  notify,
} from '@/components/ui'
import { useAuth } from '@/features/auth'
import {
  parsePercent,
  useDeleteSavedTestMutation,
  useSavedExamTemplatesQuery,
} from '@/features/saved-tests'
import { fullNameOf } from '@/lib/format'
import { StartExamTemplateModal } from '@/pages/exam-templates/StartExamTemplateModal'

function CircleProgress({ percent }: { percent: number }) {
  const r = 18
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden>
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-mist/80"
      />
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="text-signal"
        transform="rotate(-90 26 26)"
      />
      <text
        x="26"
        y="28"
        textAnchor="middle"
        className="fill-deep text-[10px] font-bold"
      >
        {Math.round(percent)}%
      </text>
    </svg>
  )
}

function GridSkeleton() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <SkeletonCard key={i} className="space-y-3 p-4">
          <Skeleton className="mx-auto h-5 w-24" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-12" rounded="full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </SkeletonCard>
      ))}
    </div>
  )
}

export function SavedTestsPage() {
  const { t } = useTranslation()
  const { me, user } = useAuth()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [removeId, setRemoveId] = useState<number | null>(null)
  const [removeName, setRemoveName] = useState('')

  const hasComfort = Boolean(me?.organization_has_comfort_plan)
  const orgPhone = me?.profession?.organization?.phone

  const { data = [], isLoading, isError } = useSavedExamTemplatesQuery(hasComfort)
  const deleteMutation = useDeleteSavedTestMutation()

  const userName =
    fullNameOf(me?.profession ?? {}) || user?.username || undefined

  const canSeeEndMode = user?.role !== 4

  const confirmRemove = async () => {
    if (removeId == null) return
    try {
      await deleteMutation.mutateAsync(removeId)
      setRemoveId(null)
      setRemoveName('')
      notify.success(t('savedTests.removeOk'))
    } catch (e) {
      notify.error(
        e instanceof Error ? e.message : t('savedTests.removeError'),
      )
    }
  }

  if (!hasComfort) {
    return (
      <>
        <Header
          title={t('savedTests.title')}
          description={t('savedTests.description')}
        />
        <main className="flex-1 p-3 sm:p-4">
          <Notification tone="warning" title={t('savedTests.contractTitle')}>
            <p className="m-0">{t('savedTests.contractText')}</p>
            {orgPhone ? (
              <p className="mt-3 mb-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-deep">
                <Phone className="size-3.5 text-signal" aria-hidden />
                {orgPhone}
              </p>
            ) : (
              <p className="mt-3 mb-0 text-[13px] text-muted">
                {t('savedTests.contactOrg')}
              </p>
            )}
          </Notification>
        </main>
      </>
    )
  }

  return (
    <>
      <Header title={t('savedTests.title')} />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        <Notification tone="info">{t('savedTests.hint')}</Notification>

        {isLoading ? (
          <GridSkeleton />
        ) : isError ? (
          <ErrorMessage />
        ) : data.length === 0 ? (
          <EmptyState
            description={
              <span className="inline-flex flex-col items-center gap-2">
                <Bookmark className="size-10 text-muted" aria-hidden />
                {t('savedTests.empty')}
              </span>
            }
          />
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {data.map((item) => {
              const tpl = item.exam_center_test_template
              const templateId =
                Number(item.test_id) || Number(tpl?.id) || Number(item.id)
              const percent = parsePercent(
                tpl?.exam_center_test_template_result?.max_result_percent,
              )
              const correct =
                tpl?.exam_center_test_template_result?.correct_answers_count ??
                0
              const name = tpl?.name || '—'

              return (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (!Number.isFinite(templateId) || templateId <= 0) return
                      setSelectedId(templateId)
                    }}
                    className="w-full text-left"
                  >
                    <Panel className="h-full space-y-3 p-4 pr-10 transition hover:border-signal/40 hover:shadow-[0_8px_20px_rgba(47,126,160,0.12)]">
                      <p className="m-0 text-center text-base font-semibold text-deep">
                        {name} {t('examTemplates.templateSuffix')}
                      </p>

                      <div className="flex items-center gap-3">
                        <CircleProgress percent={percent} />
                        <div className="min-w-0 text-[12px] text-muted">
                          <p className="m-0">
                            {t('examTemplates.correctCount')}:{' '}
                            <span className="font-semibold text-deep">
                              {correct}
                            </span>
                          </p>
                          <p className="m-0">
                            {t('examTemplates.time')}:{' '}
                            <span className="font-semibold text-deep">
                              {t('examTemplates.minutes25')}
                            </span>
                          </p>
                        </div>
                      </div>
                    </Panel>
                  </button>

                  <button
                    type="button"
                    className="absolute top-2.5 right-2.5 inline-flex size-8 items-center justify-center rounded-lg text-rose transition hover:bg-rose-soft hover:text-rose"
                    title={t('savedTests.remove')}
                    aria-label={t('savedTests.remove')}
                    onClick={(e) => {
                      e.stopPropagation()
                      setRemoveId(item.id)
                      setRemoveName(name)
                    }}
                  >
                    <BookmarkX className="size-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <StartExamTemplateModal
        open={selectedId != null}
        templateId={selectedId}
        userName={userName}
        canSeeEndMode={canSeeEndMode}
        showShuffle={false}
        onClose={() => setSelectedId(null)}
      />

      <Modal
        open={removeId != null}
        onClose={() => {
          if (deleteMutation.isPending) return
          setRemoveId(null)
          setRemoveName('')
        }}
        title={t('savedTests.removeTitle')}
        sizeClassName="max-w-sm"
      >
        <div className="space-y-4">
          <p className="m-0 text-[13px] text-muted">
            {t('savedTests.removeConfirm', { name: removeName })}
          </p>
          {deleteMutation.isError ? (
            <ErrorMessage>
              {deleteMutation.error instanceof Error
                ? deleteMutation.error.message
                : t('savedTests.removeError')}
            </ErrorMessage>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => {
                setRemoveId(null)
                setRemoveName('')
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              loading={deleteMutation.isPending}
              onClick={() => void confirmRemove()}
            >
              {t('savedTests.remove')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
