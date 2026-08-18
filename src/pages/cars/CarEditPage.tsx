import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import { ErrorMessage, Panel, SkeletonLines } from '@/components/ui'
import { useCarQuery } from '@/features/cars'
import { CarForm } from './CarForm'

export function CarEditPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { data, isLoading, isError } = useCarQuery(id)

  if (isLoading) {
    return (
      <>
        <Header title={t('carsPage.edit')} />
        <main className="p-3 sm:p-4">
          <Panel padding="md">
            <SkeletonLines lines={8} />
          </Panel>
        </main>
      </>
    )
  }

  if (isError || !data) {
    return (
      <>
        <Header title={t('carsPage.edit')} />
        <main className="p-3 sm:p-4">
          <ErrorMessage />
        </main>
      </>
    )
  }

  return <CarForm mode="edit" carId={id} initial={data} />
}
