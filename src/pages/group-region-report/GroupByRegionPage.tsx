import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { groupRegionAreaPath } from '@/config'
import { useGroupReportByRegionQuery } from '@/features/student-region-report'
import { GroupCountReport } from './GroupCountReport'

export function GroupByRegionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <GroupCountReport
      title={t('groupRegionPage.title')}
      query={useGroupReportByRegionQuery()}
      showCards
      showSchools
      showGroupTotal
      groupedCategories={false}
      categoryKey="name"
      nameHeader={t('groupRegionPage.province')}
      exportName="VILOYAT BO'YICHA GURUHLAR HISOBOTI.xls"
      onName={(row) => {
        if (row.id != null) navigate(groupRegionAreaPath(row.id))
      }}
    />
  )
}
