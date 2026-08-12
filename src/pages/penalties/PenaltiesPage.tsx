import { Navigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Car, FileText, Shield } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Button,
  EmptyState,
  ErrorMessage,
  Panel,
  Skeleton,
  SkeletonCard,
} from '@/components/ui'
import { routes } from '@/config'
import {
  pickPenaltyCategoryName,
  usePenaltyCategoriesQuery,
} from '@/features/penalties'

const ICONS = [AlertTriangle, Shield, Car, FileText] as const

function CategoriesSkeleton() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <SkeletonCard key={i} className="space-y-3 p-4">
          <Skeleton className="mx-auto size-12" rounded="lg" />
          <Skeleton className="mx-auto h-4 w-3/5" />
          <Skeleton className="h-8 w-full" rounded="lg" />
        </SkeletonCard>
      ))}
    </div>
  )
}

export function PenaltiesPage() {
  const { t, i18n } = useTranslation()
  const { data = [], isLoading, isError } = usePenaltyCategoriesQuery()

  if (!isLoading && !isError && data.length === 1) {
    const only = data[0]
    const name = pickPenaltyCategoryName(only, i18n.language)
    return (
      <Navigate
        to={`${routes.penalties}/${only.id}`}
        replace
        state={{ categoryName: name }}
      />
    )
  }

  return (
    <>
      <Header
        title={t('penalties.title')}
        description={t('penalties.description')}
      />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {isLoading ? (
          <CategoriesSkeleton />
        ) : isError ? (
          <ErrorMessage />
        ) : data.length === 0 ? (
          <EmptyState description={t('penalties.emptyCategories')} />
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {data.map((item, index) => {
              const title = pickPenaltyCategoryName(item, i18n.language)
              const Icon = ICONS[index % ICONS.length]

              return (
                <Panel
                  key={item.id}
                  className="flex flex-col items-center gap-3 p-4 text-center"
                >
                  <span className="flex size-12 items-center justify-center rounded-xl bg-signal-soft text-signal">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <p className="font-display text-[13px] leading-snug font-semibold text-deep">
                    {title}
                  </p>
                  <Link
                    to={`${routes.penalties}/${item.id}`}
                    state={{ categoryName: title }}
                    className="mt-auto w-full"
                  >
                    <Button variant="primary" size="sm" className="w-full">
                      {t('penalties.open')}
                    </Button>
                  </Link>
                </Panel>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
