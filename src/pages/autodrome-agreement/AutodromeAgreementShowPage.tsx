import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ErrorMessage,
  Panel,
  SafeImage,
  SkeletonLines,
} from '@/components/ui'
import { routes } from '@/config'
import { useAutodromeAgreementQuery } from '@/features/autodrome-agreement'
import { asText } from '@/lib/apiPage'
import { formatDate } from '@/lib/format'
import { useSmartBack } from '@/hooks'

function autodromeStatusTone(id: number): 'teal' | 'amber' | 'rose' {
  if (id === 1) return 'teal'
  if (id === 2) return 'amber'
  return 'rose'
}

function agreementStatusTone(id: number): 'teal' | 'amber' | 'rose' {
  if (id === 2 || id === 9) return 'teal'
  if (id === 1 || id === 4) return 'amber'
  return 'rose'
}

export function AutodromeAgreementShowPage() {
  const { t, i18n } = useTranslation()
  const goBack = useSmartBack(routes.autodromeAgreement)
  const { id } = useParams()
  const query = useAutodromeAgreementQuery(id)
  const data = query.data
  const autodromeStatusId = Number(data?.autodrome?.autodrome_status?.id)
  const agreementStatusId = Number(
    data?.organization_autodrome_agreement_status?.id,
  )
  const groups = data?.autodrome?.count_active_groups

  return (
    <>
      <Header
        title={t('autodromeAgreementPage.showTitle')}
        onBack={goBack}
        actions={
          data ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-muted">
                {t('autodromeAgreementPage.autodromeStatus')}
              </span>
              <Badge tone={autodromeStatusTone(autodromeStatusId)}>
                {data.autodrome?.autodrome_status?.title || '—'}
              </Badge>
              <span className="text-[11px] text-muted">
                {t('autodromeAgreementPage.orgAgreementStatus')}
              </span>
              <Badge tone={agreementStatusTone(agreementStatusId)}>
                {agreementStatusId === 9
                  ? t('autodromeAgreementPage.confirmed')
                  : data.organization_autodrome_agreement_status?.title || '—'}
              </Badge>
            </div>
          ) : null
        }
      />
      <PageMain>
        {query.isLoading ? (
          <Panel padding="sm">
            <SkeletonLines lines={8} />
          </Panel>
        ) : query.isError || !data ? (
          <ErrorMessage />
        ) : (
          <div className="grid gap-3 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
            <Panel padding="sm" className="space-y-3">
              <div className="flex gap-3">
                <SafeImage
                  src={data.organization?.logo_image}
                  size="lg"
                  className="size-24 overflow-hidden rounded-lg"
                />
                <div className="min-w-0 space-y-1 text-sm text-muted">
                  <p>{asText(data.autodrome?.region?.name)}</p>
                  <p className="font-medium text-deep">
                    {data.organization?.name || '—'}
                  </p>
                  <p>INN: {data.organization?.inn || '—'}</p>
                </div>
              </div>
              <p className="text-sm text-muted">
                {data.organization?.address || '—'}
              </p>
              <p className="font-display text-base font-semibold text-deep">
                {data.autodrome?.name || '—'}
              </p>
              {data.file ? (
                <a href={data.file} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="w-full">
                    <FileText className="size-4 text-rose" />
                    {t('autodromeAgreementPage.viewFile')}
                  </Button>
                </a>
              ) : null}
            </Panel>

            <Panel padding="sm" className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-teal-soft/50 px-3 py-2">
                  <p className="text-[11px] text-teal">
                    {t('autodromeAgreementPage.startDate')}
                  </p>
                  <p className="font-semibold text-deep">
                    {formatDate(data.start_date, i18n.language) || '—'}
                  </p>
                </div>
                <div className="rounded-lg bg-rose-soft/50 px-3 py-2">
                  <p className="text-[11px] text-rose">
                    {t('autodromeAgreementPage.endDate')}
                  </p>
                  <p className="font-semibold text-deep">
                    {formatDate(data.end_date, i18n.language) || '—'}
                  </p>
                </div>
              </div>
              <p className="font-display text-sm font-semibold text-deep">
                {t('autodromeAgreementPage.activeGroups')}
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ['catA', groups?.a],
                    ['catB', groups?.b],
                    ['catE', groups?.e],
                  ] as const
                ).map(([key, value]) => (
                  <Panel key={key} padding="sm" className="text-center">
                    <p className="text-[11px] text-muted">
                      {t(`autodromeAgreementPage.${key}`)}
                    </p>
                    <p className="font-display text-lg font-semibold text-deep">
                      {value ?? '—'}
                    </p>
                  </Panel>
                ))}
              </div>
            </Panel>
          </div>
        )}
      </PageMain>
    </>
  )
}
