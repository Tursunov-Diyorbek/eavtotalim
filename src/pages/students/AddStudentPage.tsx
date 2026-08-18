import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import { EmptyState } from '@/components/ui'

export function AddStudentPage() {
  const { t } = useTranslation()

  return (
    <>
      <Header
        title={t('dashboard.addStudent')}
        description={t('students.addDescription')}
      />
      <main className="p-3 sm:p-4">
        <EmptyState description={t('students.addEmpty')} />
      </main>
    </>
  )
}
