import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { studentRegionAreaPath } from '@/config'
import { useStudentReportByRegionQuery } from '@/features/student-region-report'
import { StudentCountReport } from './StudentCountReport'

export function StudentByRegionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <StudentCountReport
      title={t('studentRegionPage.title')}
      query={useStudentReportByRegionQuery()}
      showSchools
      schoolsMode="sum"
      nameHeader={t('studentRegionPage.province')}
      exportName="VILOYAT BO'YICHA O'QUVCHILAR HISOBOTI.xls"
      onName={(row) => {
        if (row.id != null) navigate(studentRegionAreaPath(row.id))
      }}
    />
  )
}
