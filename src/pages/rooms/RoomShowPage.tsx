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
import { roomEditPath, routes } from '@/config'
import { useRoomQuery } from '@/features/rooms'
import { useSmartBack } from '@/hooks'

export function RoomShowPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.rooms)
  const { id } = useParams()
  const { data, isLoading, isError } = useRoomQuery(id)

  return (
    <>
      <Header
        title={t('roomsPage.show')}
        description={data?.name_uz || data?.name || undefined}
        actions={
          <div className="flex gap-2">
            {id ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(roomEditPath(id))}
              >
                {t('common.edit')}
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={goBack}>
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
                { label: t('directorList.name'), value: data.name_uz || data.name },
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
