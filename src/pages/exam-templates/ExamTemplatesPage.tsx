import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bookmark, BookmarkCheck, Phone } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  EmptyState,
  ErrorMessage,
  Notification,
  Panel,
  Skeleton,
  SkeletonCard,
} from '@/components/ui'
import { useAuth } from '@/features/auth'
import { parsePercent, useExamTemplatesQuery } from '@/features/exam-templates'
import { formatDate, fullNameOf } from '@/lib/format'
import { StartExamTemplateModal } from './StartExamTemplateModal'

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

export function ExamTemplatesPage() {
  const { t, i18n } = useTranslation()
  const { me, user } = useAuth()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const agreementTypeId =
    me?.profession?.organization?.agreement_type?.id ??
    me?.profession?.organization?.last_agreement?.agreement_type?.id ??
    null
  const isBaseTariff = agreementTypeId === 1
  const hasComfort = Boolean(me?.organization_has_comfort_plan)
  const orgPhone = me?.profession?.organization?.phone

  const { data = [], isLoading, isError } = useExamTemplatesQuery(
    hasComfort && !isBaseTariff,
  )

  const userName =
    fullNameOf(me?.profession ?? {}) ||
    user?.username ||
    undefined

  const canSeeEndMode = user?.role !== 4

  if (!hasComfort) {
    return (
      <>
        <Header
          title={t('examTemplates.title')}
          description={t('examTemplates.description')}
        />
        <main className="flex-1 p-3 sm:p-4">
          <Notification
            tone="warning"
            title={t('examTemplates.contractTitle')}
          >
            <p className="m-0">{t('examTemplates.contractText')}</p>
            {orgPhone ? (
              <p className="mt-3 mb-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-deep">
                <Phone className="size-3.5 text-signal" aria-hidden />
                {orgPhone}
              </p>
            ) : (
              <p className="mt-3 mb-0 text-[13px] text-muted">
                {t('examTemplates.contactOrg')}
              </p>
            )}
          </Notification>
        </main>
      </>
    )
  }

  return (
    <>
      <Header
        title={t('examTemplates.title')}
        description={t('examTemplates.description')}
      />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {isBaseTariff ? (
          <Notification
            tone="warning"
            title={t('examTemplates.baseTariffTitle')}
          >
            <p className="m-0">{t('examTemplates.baseTariffText')}</p>
            {orgPhone ? (
              <p className="mt-3 mb-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-deep">
                <Phone className="size-3.5 text-signal" aria-hidden />
                {orgPhone}
              </p>
            ) : (
              <p className="mt-3 mb-0 text-[13px] text-muted">
                {t('examTemplates.contactOrg')}
              </p>
            )}
          </Notification>
        ) : isLoading ? (
          <GridSkeleton />
        ) : isError ? (
          <ErrorMessage />
        ) : data.length === 0 ? (
          <EmptyState description={t('examTemplates.empty')} />
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {data.map((item) => {
              const percent = parsePercent(
                item.exam_center_test_template_result?.max_result_percent,
              )
              const correct =
                item.exam_center_test_template_result?.correct_answers_count ??
                0
              const savedAt =
                item.saved_test && typeof item.saved_test === 'object'
                  ? formatDate(item.saved_test.updated_at, i18n.language)
                  : null
              const isSaved = Boolean(item.saved_test)

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className="text-left"
                >
                  <Panel className="relative h-full space-y-3 p-4 transition hover:border-signal/40 hover:shadow-[0_8px_20px_rgba(47,126,160,0.12)]">
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-muted">
                      {savedAt ? (
                        <span className="text-[10px]">{savedAt}</span>
                      ) : null}
                      {isSaved ? (
                        <BookmarkCheck className="size-3.5 text-signal" />
                      ) : (
                        <Bookmark className="size-3.5" />
                      )}
                    </div>

                    <p className="m-0 pr-10 text-center text-base font-semibold text-deep">
                      {item.name || '—'} {t('examTemplates.templateSuffix')}
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
        onClose={() => setSelectedId(null)}
      />
    </>
  )
}
