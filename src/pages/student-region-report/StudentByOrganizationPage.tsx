import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { routes, schoolReportGroupsPath } from '@/config'
import { useSmartBack } from '@/hooks'
import { useStudentReportByOrganizationQuery } from '@/features/student-region-report'
import { StudentCountReport } from './StudentCountReport'

export function StudentByOrganizationPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.studentRegionReport)
  return (
    <StudentCountReport
      title={t('studentRegionPage.orgTitle')}
      onBack={goBack}
      query={useStudentReportByOrganizationQuery(id)}
      showSchools={false}
      schoolsMode="count"
      nameHeader={t('studentRegionPage.school')}
      exportName="AVTOMAKTABLAR BO'YICHA O'QUVCHILAR HISOBOTI.xls"
      onName={(row) => {
        if (row.id != null && id) navigate(schoolReportGroupsPath(id, row.id))
      }}
    />
  )
}
