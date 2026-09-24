import { useTranslation } from 'react-i18next'
import { ExternalLink, RefreshCw } from 'lucide-react'
import {
  Badge,
  Button,
  EmptyState,
  EmptyTR,
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
import { useStudentShowAbsenceQuery } from '@/features/absence-reason'
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
  studentId,
  compact = false,
}: {
  active: boolean
  professionId?: number | null
  /** O‘quvchi show: arizalar `student_id` bo‘yicha */
  studentId?: number | null
  compact?: boolean
}) {
  const { t, i18n } = useTranslation()
  const own = useAbsenceReasonApplicationsQuery(professionId, active && studentId == null)
  const byStudent = useStudentShowAbsenceQuery(studentId, active && studentId != null)
  const query = studentId != null ? byStudent : own
  const { isLoading, isError, isFetching, refetch } = query
  const data = query.data ?? []

  if (!active) return null

  if (!professionId && studentId == null) {
    return <EmptyState compact={compact} description={t('missedClasses.emptyReasons')} />
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

  if (isError && !compact) return <ErrorMessage />

  const rows = isError ? [] : data

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-3'}>
      <div className={compact ? 'flex items-center gap-2' : 'flex flex-wrap items-center justify-between gap-2'}>
        <p
          className={
            compact
              ? 'text-[11px] font-semibold tracking-wide text-deep uppercase'
              : 'text-sm font-medium text-deep'
          }
        >
          {compact ? t('missedClasses.tabReasons') : t('missedClasses.reasonsHeading')}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={compact ? 'h-7! px-1.5 text-signal!' : undefined}
          loading={isFetching}
          onClick={() => void refetch()}
        >
          <RefreshCw className="size-3.5" aria-hidden />
          {t('missedClasses.refresh')}
        </Button>
      </div>

      {compact ? (
        <Table storageKey="student-show-absence-reasons" fill={false}>
          <THead>
            <TR>
              <TH className="w-10 px-2! py-1! text-center">№</TH>
              <TH className="px-2! py-1!">{t('missedClasses.fromDate')}</TH>
              <TH className="px-2! py-1!">{t('missedClasses.toDate')}</TH>
              <TH className="px-2! py-1!">{t('missedClasses.reason')}</TH>
              <TH className="px-2! py-1!">{t('missedClasses.note')}</TH>
              <TH className="px-2! py-1!">{t('missedClasses.status')}</TH>
              <TH className="px-2! py-1! text-center">{t('missedClasses.lessonCount')}</TH>
              <TH className="px-2! py-1! text-center">{t('missedClasses.document')}</TH>
            </TR>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <EmptyTR colSpan={8} plain description={t('common.empty')} />
            ) : (
              rows.map((item, index) => {
                const st = statusMeta(item.status, t)
                const docUrl = resolveFileUrl(item.document_url, PATH_PREFIX_FILE)
                return (
                  <TR key={item.id ?? index}>
                    <TD className="px-2! py-1! text-center">{index + 1}</TD>
                    <TD className="px-2! py-1!">
                      {formatDate(item.from_date, i18n.language) || item.from_date || '—'}
                    </TD>
                    <TD className="px-2! py-1!">
                      {formatDate(item.to_date, i18n.language) || item.to_date || '—'}
                    </TD>
                    <TD className="px-2! py-1!">
                      <span title={item.reason || undefined}>{truncate(item.reason)}</span>
                    </TD>
                    <TD className="px-2! py-1!">
                      <span title={item.description || undefined}>{truncate(item.description)}</span>
                    </TD>
                    <TD className="px-2! py-1!">
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </TD>
                    <TD className="px-2! py-1! text-center">{item.lesson_count ?? 0}</TD>
                    <TD className="px-2! py-1! text-center">
                      {docUrl ? (
                        <Button
                          type="button"
                          variant="soft"
                          size="sm"
                          onClick={() => window.open(docUrl, '_blank', 'noopener,noreferrer')}
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
              })
            )}
          </TBody>
        </Table>
      ) : rows.length === 0 ? (
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
            {rows.map((item, index) => {
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
