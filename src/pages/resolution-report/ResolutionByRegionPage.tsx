import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { resolutionAreaPath, resolutionSchoolsByRegionPath } from '@/config'
import { useResolutionRegionQuery } from '@/features/resolution-report'
import { ResolutionCountTable } from './ResolutionCountTable'

export function ResolutionByRegionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const query = useResolutionRegionQuery()
  return (
    <ResolutionCountTable
      title={t('resolutionPage.title')}
      hint={t('resolutionPage.byRepublic')}
      query={query}
      nameHeader={t('resolutionPage.region')}
      nameExtra={(rows) => `${rows.length} ${t('resolutionPage.pieces')}`}
      onName={(row) => {
        if (row.id != null) navigate(resolutionAreaPath(row.id))
      }}
      onFull={(row) => {
        if (row.id != null) navigate(resolutionSchoolsByRegionPath(row.id))
      }}
    />
  )
}
