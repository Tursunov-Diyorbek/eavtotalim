import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  DetailList,
  ErrorMessage,
  Panel,
  SkeletonLines,
  notify,
} from '@/components/ui'
import { carEditPath, routes } from '@/config'
import { useCarQuery, useDeleteCarMutation } from '@/features/cars'
import { asFio, asText } from '@/lib/apiPage'

export function CarShowPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, isLoading, isError } = useCarQuery(id)
  const deleteMutation = useDeleteCarMutation()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const onDelete = () => {
    if (!data) return
    deleteMutation.mutate(data.id, {
      onSuccess: () => {
        notify.success(t('common.deleted'))
        navigate(routes.cars)
      },
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  return (
    <>
      <Header
        title={t('carsPage.show')}
        description={data?.number || data?.name}
        actions={
          <div className="flex gap-2">
            {id ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(carEditPath(id))}
              >
                {t('common.edit')}
              </Button>
            ) : null}
            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
              {t('common.delete')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(routes.cars)}>
              {t('common.back')}
            </Button>
          </div>
        }
      />
      <main className="flex-1 p-3 sm:p-4">
        {isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={8} />
          </Panel>
        ) : isError || !data ? (
          <ErrorMessage />
        ) : (
          <Panel padding="md">
            <DetailList
              items={[
                { label: t('directorList.name'), value: data.name },
                { label: t('directorList.number'), value: data.number },
                { label: t('carsPage.year'), value: data.year_of_manufacture },
                { label: t('carsPage.model'), value: asText(data.model?.name) },
                { label: t('carsPage.type'), value: asText(data.type?.name) },
                { label: t('carsPage.color'), value: asText(data.color?.name) },
                { label: t('carsPage.teacher'), value: asFio(data.teacher) },
                { label: t('carsPage.engine'), value: data.engine_number },
                { label: t('carsPage.body'), value: data.body },
                {
                  label: t('carsPage.texPassport'),
                  value: [data.tex_passport_seria, data.tex_passport_number]
                    .filter(Boolean)
                    .join(' '),
                },
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
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        description={t('common.confirmDelete', {
          name: data?.number || data?.name,
        })}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
