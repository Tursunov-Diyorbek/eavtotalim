import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  EmptyState,
  ErrorMessage,
  Notification,
  Panel,
  Skeleton,
  SkeletonCard,
} from '@/components/ui'
import { TextbookAgreementError } from '@/api'
import { routes, subjectClassesPath } from '@/config'
import {
  capitalizeName,
  pickTextbookName,
  textbookCardTone,
  useTextbookEduTypesQuery,
} from '@/features/textbooks'
import { useSmartBack } from '@/hooks'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { TextbookEduTypesState } from '@/types/textbooks'

function CardsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <SkeletonCard key={i} className="space-y-3 p-0">
          <Skeleton className="h-16 w-full" rounded="md" />
          <div className="space-y-2 px-4 pb-4">
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </SkeletonCard>
      ))}
    </div>
  )
}

export function TextbookEduTypesPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const state = (location.state ?? {}) as TextbookEduTypesState
  const goBack = useSmartBack(routes.textbooks)
  const { data, isLoading, isError, error } = useTextbookEduTypesQuery(id)
  const rows = data ?? []
  const title =
    capitalizeName(
      state.name || pickTextbookName(rows[0]?.lesson, i18n.language),
    ) || t('nav.textbooks')

  const agreement =
    error instanceof TextbookAgreementError ? error.message : null

  return (
    <>
      <Header title={title} onBack={goBack} />
      <PageMain>
        {agreement ? (
          <Notification tone="warning">{agreement}</Notification>
        ) : isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <CardsSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState description={t('common.empty')} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => {
              const eduName = pickTextbookName(row.edu_type, i18n.language)
              const lessonName = pickTextbookName(row.lesson, i18n.language)
              const topics =
                row.topics_count != null && row.topics_count !== ''
                  ? formatNumber(Number(row.topics_count))
                  : '—'
              return (
                <Panel key={row.id}>
                  <button
                    type="button"
                    className="flex h-full w-full flex-col text-left"
                    onClick={() =>
                      navigate(subjectClassesPath(row.id), {
                        state: {
                          subject_name: state.name || lessonName,
                          subject_id: id,
                          lesson_name: lessonName,
                          edutype_name: eduName,
                        },
                      })
                    }
                  >
                    <div
                      className={cn(
                        'flex min-h-16 items-center justify-center px-3 py-2 text-center text-sm font-semibold text-white',
                        textbookCardTone(row.id),
                      )}
                    >
                      {eduName || '—'}
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="m-0 text-muted">
                            {t('textbooksPage.chaptersCount')}
                          </p>
                          <p className="m-0 mt-1 font-semibold text-deep">
                            {formatNumber(Number(row.chapters_count ?? 0))}
                          </p>
                        </div>
                        <div>
                          <p className="m-0 text-muted">
                            {t('textbooksPage.topicsCount')}
                          </p>
                          <p className="m-0 mt-1 font-semibold text-deep">
                            {topics}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="m-0 text-sm text-signal">
                          {t('textbooksPage.eduType')}
                        </p>
                        <p className="m-0 mt-1 text-sm font-semibold text-deep">
                          {eduName || '—'}
                        </p>
                      </div>
                    </div>
                  </button>
                </Panel>
              )
            })}
          </div>
        )}
      </PageMain>
    </>
  )
}
