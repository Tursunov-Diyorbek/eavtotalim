import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { routes, studentRegionOrgPath } from '@/config'
import { useSmartBack } from '@/hooks'
import { useStudentReportByAreaQuery } from '@/features/student-region-report'
import { StudentCountReport } from './StudentCountReport'

export function StudentByAreaPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.studentRegionReport)
  return (
    <StudentCountReport
      title={t('studentRegionPage.areaTitle')}
      onBack={goBack}
      query={useStudentReportByAreaQuery(id)}
      showSchools
      schoolsMode="sum"
      nameHeader={t('studentRegionPage.district')}
      exportName="TUMAN BO'YICHA O'QUVCHILAR HISOBOTI.xls"
      onName={(row) => {
        if (row.id != null) navigate(studentRegionOrgPath(row.id))
      }}
    />
  )
}
