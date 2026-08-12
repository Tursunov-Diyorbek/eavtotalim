import { useTranslation } from 'react-i18next'
import { ExternalLink, RefreshCw } from 'lucide-react'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  Skeleton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  type BadgeTone,
} from '@/components/ui'
import { PATH_PREFIX_FILE } from '@/config'
import { resolveFileUrl } from '@/features/lessons'
import { useAbsenceReasonApplicationsQuery } from '@/features/missed-classes'
import { formatDate } from '@/lib/format'
import type { AbsenceReasonStatus } from '@/types'

function statusMeta(
  status: AbsenceReasonStatus | null | undefined,
  t: (k: string) => string,
): { label: string; tone: BadgeTone } {
  if (status === 'approved') {
    return { label: t('missedClasses.statusApproved'), tone: 'signal' }
  }
  if (status === 'rolled_back') {
    return { label: t('missedClasses.statusRolledBack'), tone: 'rose' }
  }
  return {
    label: status || '—',
    tone: 'neutral',
  }
}

function truncate(text: string | null | undefined, max = 40) {
  if (!text) return '—'
  if (text.length <= max) return text
  return `${text.slice(0, max)}…`
}

export function AbsenceReasonsPanel({
  active,
  professionId,
}: {
  active: boolean
  professionId: number | null | undefined
}) {
  const { t, i18n } = useTranslation()
  const { data = [], isLoading, isError, isFetching, refetch } =
    useAbsenceReasonApplicationsQuery(professionId, active)

  if (!active) return null

  if (!professionId) {
    return <EmptyState description={t('missedClasses.emptyReasons')} />
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" rounded="lg" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorMessage />

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-deep">
          {t('missedClasses.reasonsHeading')}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          loading={isFetching}
          onClick={() => void refetch()}
        >
          <RefreshCw className="size-3.5" aria-hidden />
          {t('missedClasses.refresh')}
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState description={t('missedClasses.emptyReasons')} />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH className="w-28">{t('missedClasses.fromDate')}</TH>
              <TH className="w-28">{t('missedClasses.toDate')}</TH>
              <TH>{t('missedClasses.reason')}</TH>
              <TH>{t('missedClasses.note')}</TH>
              <TH className="w-32">{t('missedClasses.status')}</TH>
              <TH className="w-24 text-center">
                {t('missedClasses.lessonCount')}
              </TH>
              <TH className="w-24 text-center">
                {t('missedClasses.document')}
              </TH>
            </TR>
          </THead>
          <TBody>
            {data.map((item, index) => {
              const st = statusMeta(item.status, t)
              const docUrl = resolveFileUrl(item.document_url, PATH_PREFIX_FILE)
              return (
                <TR key={item.id ?? index}>
                  <TD>
                    <Badge tone="neutral">
                      {formatDate(item.from_date, i18n.language) ||
                        item.from_date ||
                        '—'}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge tone="neutral">
                      {formatDate(item.to_date, i18n.language) ||
                        item.to_date ||
                        '—'}
                    </Badge>
                  </TD>
                  <TD>
                    <span title={item.reason || undefined}>
                      {truncate(item.reason)}
                    </span>
                  </TD>
                  <TD>
                    <span title={item.description || undefined}>
                      {truncate(item.description)}
                    </span>
                  </TD>
                  <TD>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </TD>
                  <TD className="text-center">{item.lesson_count ?? 0}</TD>
                  <TD className="text-center">
                    {docUrl ? (
                      <Button
                        type="button"
                        variant="soft"
                        size="sm"
                        onClick={() =>
                          window.open(docUrl, '_blank', 'noopener,noreferrer')
                        }
                      >
                        <ExternalLink className="size-3.5" aria-hidden />
                        {t('missedClasses.viewDoc')}
                      </Button>
                    ) : (
                      '—'
                    )}
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      )}
    </div>
  )
}
