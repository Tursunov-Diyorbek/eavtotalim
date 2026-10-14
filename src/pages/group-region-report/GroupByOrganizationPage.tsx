import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { routes, schoolReportGroupsPath } from '@/config'
import { useSmartBack } from '@/hooks'
import { useGroupReportByOrganizationQuery } from '@/features/student-region-report'
import { GroupCountReport } from './GroupCountReport'

export function GroupByOrganizationPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.groupRegionReport)
  return (
    <GroupCountReport
      title={t('groupRegionPage.orgTitle')}
      onBack={goBack}
      query={useGroupReportByOrganizationQuery(id)}
      showCards={false}
      showSchools={false}
      showGroupTotal={false}
      groupedCategories
      categoryKey="shortName"
      nameHeader={t('groupRegionPage.school')}
      exportName="AVTOMAKTABLAR BO'YICHA GURUHLAR HISOBOTI.xls"
      showDate={false}
      showFooter={false}
      onName={(row) => {
        if (row.id != null && id) navigate(schoolReportGroupsPath(id, row.id))
      }}
    />
  )
}
