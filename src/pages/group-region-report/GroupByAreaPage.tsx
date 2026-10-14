import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { groupRegionOrgPath, routes } from '@/config'
import { useSmartBack } from '@/hooks'
import { useGroupReportByAreaQuery } from '@/features/student-region-report'
import { GroupCountReport } from './GroupCountReport'

export function GroupByAreaPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.groupRegionReport)
  return (
    <GroupCountReport
      title={t('groupRegionPage.areaTitle')}
      onBack={goBack}
      query={useGroupReportByAreaQuery(id)}
      showCards
      showSchools
      showGroupTotal
      groupedCategories={false}
      categoryKey="name"
      nameHeader={t('groupRegionPage.district')}
      exportName="TUMAN BO'YICHA GURUHLAR HISOBOTI.xls"
      onName={(row) => {
        if (row.id != null) navigate(groupRegionOrgPath(row.id))
      }}
    />
  )
}
