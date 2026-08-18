import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, Phone, Star } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  Notification,
  SearchInput,
  Skeleton,
  SkeletonCard,
} from '@/components/ui'
import { routes } from '@/config'
import { useAuth } from '@/features/auth'
import { pickLocalized, useStudentLessonsQuery } from '@/features/lessons'
import { cn } from '@/lib'

function LessonsGridSkeleton() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }, (_, i) => (
        <SkeletonCard key={i} className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="size-9" rounded="lg" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </SkeletonCard>
      ))}
    </div>
  )
}

export function LessonsPage() {
  const { t, i18n } = useTranslation()
  const { me } = useAuth()
  const [search, setSearch] = useState('')

  const agreementTypeId =
    me?.profession?.organization?.agreement_type?.id ??
    me?.profession?.organization?.last_agreement?.agreement_type?.id ??
    null
  const isBaseTariff = agreementTypeId === 1

  const { data = [], isLoading, isError } = useStudentLessonsQuery(!isBaseTariff)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data
    return data.filter((item) => {
      const full = pickLocalized(item.lesson?.name, i18n.language).toLowerCase()
      const short = (item.lesson?.short_name ?? '').toLowerCase()
      return full.includes(q) || short.includes(q)
    })
  }, [data, search, i18n.language])

  const orgPhone = me?.profession?.organization?.phone

  return (
    <>
      <Header
        title={t('lessons.title')}
        description={t('lessons.description')}
      />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {isBaseTariff ? (
          <Notification tone="warning" title={t('lessons.baseTariffTitle')}>
            <p className="m-0">{t('lessons.baseTariffText')}</p>
            {orgPhone ? (
              <p className="mt-3 mb-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-deep">
                <Phone className="size-3.5 text-signal" aria-hidden />
                {orgPhone}
              </p>
            ) : (
              <p className="mt-3 mb-0 text-[13px] text-muted">
                {t('lessons.contactOrg')}
              </p>
            )}
          </Notification>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                value={search}
                debounceMs={0}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('lessons.searchPlaceholder')}
                label={t('lessons.searchPlaceholder')}
                className="min-w-[200px] flex-1"
              />
              <Link to={routes.savedTopics}>
                <Button variant="secondary" size="sm">
                  <Star className="size-3.5 text-amber" />
                  {t('lessons.savedTitle')}
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <LessonsGridSkeleton />
            ) : isError ? (
              <ErrorMessage />
            ) : filtered.length === 0 ? (
              <EmptyState description={t('lessons.empty')} />
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => {
                  const title =
                    pickLocalized(item.lesson?.name, i18n.language) || '—'
                  const short = item.lesson?.short_name || '—'
                  return (
                    <Link
                      key={item.id}
                      to={`/lessons/${item.id}`}
                      state={{
                        lessonId: item.id,
                        lessonName: title,
                      }}
                      className={cn(
                        'group rounded-xl border border-mist/70 bg-white p-4 transition',
                        'hover:border-signal/40 hover:shadow-[0_8px_24px_rgba(47,126,160,0.1)]',
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-violet-soft text-violet transition group-hover:bg-signal-soft group-hover:text-signal">
                          <BookOpen className="size-4" aria-hidden />
                        </span>
                        <Badge>{short}</Badge>
                      </div>
                      <p className="font-display mt-3 text-sm leading-snug font-semibold text-deep">
                        {title}
                      </p>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
