import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { routes } from '@/config'
import { useSmartBack } from '@/hooks'
import { useResolutionSchoolsQuery } from '@/features/resolution-report'
import { ResolutionSchoolsTable } from './ResolutionSchoolsTable'

export function ResolutionSchoolsByRegionPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const goBack = useSmartBack(routes.resolutionReport)
  return (
    <ResolutionSchoolsTable
      title={t('resolutionPage.allTitle')}
      hint={t('resolutionPage.byRegion')}
      onBack={goBack}
      query={useResolutionSchoolsQuery('region', id, '')}
      showStatus={false}
      showDate={false}
    />
  )
}
