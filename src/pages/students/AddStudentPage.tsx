import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import { routes } from '@/config'
import { useSmartBack } from '@/hooks'
import { GroupAddingGuide } from './GroupAddingGuide'

export function AddStudentPage() {
  const { t } = useTranslation()
  const goBack = useSmartBack(routes.students)

  return (
    <>
      <Header
        title={t('dashboard.addStudent')}
        description={t('students.addDescription')}
        onBack={goBack}
      />
      <PageMain>
        <GroupAddingGuide />
      </PageMain>
    </>
  )
}
