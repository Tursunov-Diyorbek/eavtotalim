import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import { EmptyState } from '@/components/ui'

type ModulePlaceholderPageProps = {
  titleKey: string
  descriptionKey: string
  placeholderKey?: string
}

/** Modul skeleton — keyingi bosqichda real UI. */
export function ModulePlaceholderPage({
  titleKey,
  descriptionKey,
  placeholderKey = 'common.modulePlaceholder',
}: ModulePlaceholderPageProps) {
  const { t } = useTranslation()

  return (
    <>
      <Header title={t(titleKey)} description={t(descriptionKey)} />
      <main className="p-3 sm:p-4">
        <EmptyState description={t(placeholderKey)} />
      </main>
    </>
  )
}
