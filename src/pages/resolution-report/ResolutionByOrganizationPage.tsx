import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Select } from '@/components/ui'
import { routes } from '@/config'
import { useSmartBack, usePageState } from '@/hooks'
import { useResolutionSchoolsQuery } from '@/features/resolution-report'
import { ResolutionSchoolsTable } from './ResolutionSchoolsTable'

export function ResolutionByOrganizationPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const goBack = useSmartBack(routes.resolutionReport)
  const [mode, setMode] = usePageState('operatingMode', '')
  return (
    <ResolutionSchoolsTable
      title={t('resolutionPage.title')}
      hint={t('resolutionPage.byDistrict')}
      onBack={goBack}
      query={useResolutionSchoolsQuery('area', id, mode)}
      showStatus
      showDate
      resetKey={mode}
      actions={
        <Select
          size="sm"
          clearable
          className="w-64"
          value={mode}
          placeholder={t('resolutionPage.status')}
          options={[
            { value: '1', label: t('resolutionPage.modeActive') },
            { value: '2', label: t('resolutionPage.modeReform') },
            { value: '3', label: t('resolutionPage.modeStopped') },
          ]}
          onChange={(event) => setMode(event.target.value)}
        />
      }
    />
  )
}
