import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Badge,
  Button,
  DetailList,
  ErrorMessage,
  Panel,
  SkeletonLines,
} from '@/components/ui'
import { routes, trailerEditPath } from '@/config'
import { useTrailerQuery } from '@/features/trailers'

export function TrailerShowPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, isLoading, isError } = useTrailerQuery(id)

  return (
    <>
      <Header
        title={t('trailersPage.show')}
        description={data?.number || undefined}
        actions={
          <div className="flex gap-2">
            {id ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(trailerEditPath(id))}
              >
                {t('common.edit')}
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => navigate(routes.trailers)}>
              {t('common.back')}
            </Button>
          </div>
        }
      />
      <main className="flex-1 p-3 sm:p-4">
        {isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={4} />
          </Panel>
        ) : isError || !data ? (
          <ErrorMessage />
        ) : (
          <Panel padding="md">
            <DetailList
              items={[
                { label: t('directorList.number'), value: data.number },
                {
                  label: t('directorList.status'),
                  value: (
                    <Badge tone={Number(data.status) === 1 ? 'teal' : 'rose'}>
                      {Number(data.status) === 1
                        ? t('dashboard.active')
                        : t('dashboard.inactive')}
                    </Badge>
                  ),
                },
              ]}
            />
          </Panel>
        )}
      </main>
    </>
  )
}
