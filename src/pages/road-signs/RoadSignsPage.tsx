import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Button,
  EmptyState,
  ErrorMessage,
  Notification,
  Panel,
  Skeleton,
  SkeletonCard,
} from '@/components/ui'
import { routes } from '@/config'
import { useAuth } from '@/features/auth'
import {
  pickRoadSignName,
  roadSignTypeThumbUrl,
  useRoadSignTypesQuery,
} from '@/features/road-signs'

function TypesSkeleton() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <SkeletonCard key={i} className="space-y-3 p-4">
          <Skeleton className="mx-auto size-20" rounded="lg" />
          <Skeleton className="mx-auto h-4 w-3/5" />
          <Skeleton className="h-8 w-full" rounded="lg" />
        </SkeletonCard>
      ))}
    </div>
  )
}

export function RoadSignsPage() {
  const { t, i18n } = useTranslation()
  const { me } = useAuth()
  const { data = [], isLoading, isError, error } = useRoadSignTypesQuery()
  const orgPhone = me?.profession?.organization?.phone

  const isBlocked =
    isError &&
    (error instanceof Error
      ? /tarif|base|huquq|access|unavailable/i.test(error.message)
      : false)

  return (
    <>
      <Header
        title={t('roadSigns.title')}
        description={t('roadSigns.description')}
      />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {isLoading ? (
          <TypesSkeleton />
        ) : isBlocked || (isError && data.length === 0) ? (
          <Notification tone="warning" title={t('roadSigns.baseTariffTitle')}>
            <p className="m-0">{t('roadSigns.baseTariffText')}</p>
            {orgPhone ? (
              <p className="mt-3 mb-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-deep">
                <Phone className="size-3.5 text-signal" aria-hidden />
                {orgPhone}
              </p>
            ) : (
              <p className="mt-3 mb-0 text-[13px] text-muted">
                {t('roadSigns.contactOrg')}
              </p>
            )}
          </Notification>
        ) : isError ? (
          <ErrorMessage />
        ) : data.length === 0 ? (
          <EmptyState description={t('roadSigns.emptyTypes')} />
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {data.map((item, index) => {
              const title = pickRoadSignName(item.name, i18n.language)
              const thumb = roadSignTypeThumbUrl(index)

              return (
                <Panel
                  key={item.id}
                  className="flex flex-col items-center gap-3 p-4 text-center"
                >
                  <div className="flex h-24 w-full items-center justify-center">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="max-h-20 max-w-[80px] object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.visibility = 'hidden'
                        }}
                      />
                    ) : (
                      <span className="flex size-16 items-center justify-center rounded-lg bg-fog text-[11px] font-semibold text-muted">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <p className="font-display text-[13px] leading-snug font-semibold text-deep">
                    {index + 1}. {title}
                  </p>
                  <Link
                    to={`${routes.roadSigns}/${item.id}`}
                    state={{ typeName: title }}
                    className="mt-auto w-full"
                  >
                    <Button variant="primary" size="sm" className="w-full">
                      {t('roadSigns.fullView')}
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
