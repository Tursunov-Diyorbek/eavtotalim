import { useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronRight, FileText } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Button,
  EmptyState,
  ErrorMessage,
  Modal,
  Panel,
  Select,
  Skeleton,
  SkeletonCard,
} from '@/components/ui'
import { routes } from '@/config'
import {
  pickPenaltyCategoryName,
  stripHtmlPreview,
  usePenaltyCategoriesQuery,
  useStudentPenaltiesQuery,
  useStudentPenaltyDetailQuery,
} from '@/features/penalties'
import { PenaltyDetailBody } from './PenaltyDetailBody'

type LocationState = {
  categoryName?: string
}

function ListSkeleton() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <SkeletonCard key={i} className="space-y-3 p-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/5" />
        </SkeletonCard>
      ))}
    </div>
  )
}

export function PenaltiesCategoryPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? {}) as LocationState
  const { t, i18n } = useTranslation()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const categoriesQuery = usePenaltyCategoriesQuery()
  const categories = categoriesQuery.data ?? []
  const { data = [], isLoading, isError } = useStudentPenaltiesQuery(
    id,
    i18n.language,
  )

  const {
    data: detail,
    isLoading: detailLoading,
    isFetching: detailFetching,
  } = useStudentPenaltyDetailQuery(selectedId, i18n.language, selectedId != null)

  const categoryName =
    state.categoryName ||
    pickPenaltyCategoryName(
      categories.find((c) => String(c.id) === String(id)),
      i18n.language,
    ) ||
    t('penalties.title')

  return (
    <>
      <Header
        title={`${t('penalties.title')} (${categoryName})`}
        description={t('penalties.categoryDescription')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {categories.length > 1 ? (
              <Select
                label={t('penalties.category')}
                options={categories.map((c) => ({
                  value: c.id,
                  label: pickPenaltyCategoryName(c, i18n.language),
                }))}
                value={id ?? ''}
                onChange={(e) => {
                  const nextId = e.target.value
                  const nextName = pickPenaltyCategoryName(
                    categories.find((c) => String(c.id) === nextId),
                    i18n.language,
                  )
                  navigate(`${routes.penalties}/${nextId}`, {
                    state: { categoryName: nextName },
                  })
                }}
              />
            ) : null}
            <Link
              to={routes.penalties}
              className="inline-flex items-center gap-1.5 rounded-lg border border-mist bg-white px-2.5 py-1.5 text-[12px] font-semibold text-deep transition hover:bg-fog"
            >
              <ArrowLeft className="size-3.5" />
              {t('penalties.back')}
            </Link>
          </div>
        }
      />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <ErrorMessage />
        ) : data.length === 0 ? (
          <EmptyState description={t('penalties.emptyItems')} />
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item, index) => {
              const preview = stripHtmlPreview(item.body)
              return (
                <Panel
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  className="flex cursor-pointer flex-col gap-3 p-4 transition hover:border-signal/40 hover:shadow-sm"
                  onClick={() => setSelectedId(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedId(item.id)
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex size-7 items-center justify-center rounded-md bg-deep text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted">
                      <FileText className="size-3.5" aria-hidden />
                      {t('penalties.title')}
                    </span>
                  </div>

                  {preview ? (
                    <p className="line-clamp-4 text-[13px] leading-relaxed text-ink">
                      {preview}
                    </p>
                  ) : (
                    <p className="text-[13px] text-muted">—</p>
                  )}

                  <Button
                    variant="soft"
                    size="sm"
                    className="mt-auto w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedId(item.id)
                    }}
                  >
                    {t('penalties.more')}
                    <ChevronRight className="size-3.5" />
                  </Button>
                </Panel>
              )
            })}
          </div>
        )}
      </main>

      <Modal
        open={selectedId != null}
        onClose={() => setSelectedId(null)}
        title={t('penalties.amountsTitle', { name: categoryName })}
        sizeClassName="max-w-3xl"
      >
        <PenaltyDetailBody
          data={detail}
          loading={detailLoading || (detailFetching && !detail)}
        />
      </Modal>
    </>
  )
}
