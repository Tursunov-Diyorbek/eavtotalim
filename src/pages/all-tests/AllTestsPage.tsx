import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Phone } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  EmptyState,
  ErrorMessage,
  Notification,
  Pagination,
  SearchInput,
  Skeleton,
  SkeletonCard,
} from '@/components/ui'
import { useAuth } from '@/features/auth'
import { useAllTestsQuery } from '@/features/all-tests'
import { AllTestQuestionCard } from './AllTestQuestionCard'

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, i) => (
        <SkeletonCard key={i} className="space-y-3 p-4">
          <div className="flex gap-2">
            <Skeleton className="size-8" rounded="lg" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <div className="grid gap-3 lg:grid-cols-5">
            <Skeleton className="h-56 w-full lg:col-span-2" />
            <Skeleton className="h-56 w-full lg:col-span-3" />
          </div>
          <Skeleton className="h-16 w-full" />
        </SkeletonCard>
      ))}
    </div>
  )
}

export function AllTestsPage() {
  const { t, i18n } = useTranslation()
  const { me } = useAuth()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const hasComfort = Boolean(me?.organization_has_comfort_plan)
  const orgPhone = me?.profession?.organization?.phone

  const { data, isLoading, isError, isFetching } = useAllTestsQuery({
    lang: i18n.language,
    page,
    showCount: pageSize,
    search,
    enabled: hasComfort,
  })

  // Qidiruv o‘zgaganda 1-sahifaga
  useEffect(() => {
    setPage(1)
  }, [search, i18n.language, pageSize])

  const questions = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const startIndex = (page - 1) * pageSize

  if (!hasComfort) {
    return (
      <>
        <Header
          title={t('allTests.title')}
          description={t('allTests.description')}
        />
        <main className="flex-1 p-3 sm:p-4">
          <Notification tone="warning" title={t('allTests.contractTitle')}>
            <p className="m-0">{t('allTests.contractText')}</p>
            {orgPhone ? (
              <p className="mt-3 mb-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-deep">
                <Phone className="size-3.5 text-signal" aria-hidden />
                {orgPhone}
              </p>
            ) : (
              <p className="mt-3 mb-0 text-[13px] text-muted">
                {t('allTests.contactOrg')}
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
        title={t('allTests.title')}
        description={t('allTests.description')}
        actions={
          <SearchInput
            size="sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('allTests.searchPlaceholder')}
            className="w-[min(100%,28rem)] min-w-[16rem]"
          />
        }
      />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {isLoading && !data ? (
          <ListSkeleton />
        ) : isError ? (
          <ErrorMessage />
        ) : questions.length === 0 ? (
          <EmptyState description={t('common.empty')} />
        ) : (
          <>
            <div
              className={
                isFetching && !isLoading ? 'space-y-3 opacity-70' : 'space-y-3'
              }
            >
              {questions.map((item, index) => (
                <AllTestQuestionCard
                  key={item.id}
                  item={item}
                  num={startIndex + index + 1}
                  highlight={search.trim()}
                />
              ))}
            </div>

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
      </main>
    </>
  )
}
