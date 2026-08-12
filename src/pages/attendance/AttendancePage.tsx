import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import { EmptyState } from '@/components/ui'

export function AttendancePage() {
  const { t } = useTranslation()

  return (
    <>
      <Header
        title={t('attendance.title')}
        description={t('attendance.description')}
      />
      <main className="p-3 sm:p-4">
        <EmptyState description={t('attendance.placeholder')} />
      </main>
    </>
  )
}
