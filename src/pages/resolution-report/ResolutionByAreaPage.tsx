import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { resolutionOrgPath, routes } from '@/config'
import { useSmartBack } from '@/hooks'
import { useResolutionAreaQuery } from '@/features/resolution-report'
import { ResolutionCountTable } from './ResolutionCountTable'

export function ResolutionByAreaPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.resolutionReport)
  return (
    <ResolutionCountTable
      title={t('resolutionPage.title')}
      hint={t('resolutionPage.byDistricts')}
      onBack={goBack}
      query={useResolutionAreaQuery(id)}
      nameHeader={t('resolutionPage.district')}
      onName={(row) => {
        if (row.id != null) navigate(resolutionOrgPath(row.id))
      }}
    />
  )
}
