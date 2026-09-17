import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, GraduationCap, RefreshCw } from 'lucide-react'
import {
  Badge,
  Button,
  DateInput,
  EmptyState,
  ErrorMessage,
  Modal,
  Panel,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { useExamCenterResultsQuery } from '@/features/students'
import { asText } from '@/lib/apiPage'
import { formatDate } from '@/lib/format'

type Props = {
  professionId: string | undefined
}

export function StudentDashboardExamCenterCard({ professionId }: Props) {
  const { t, i18n } = useTranslation()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const query = useExamCenterResultsQuery(
    professionId,
    Boolean(professionId),
    dateFrom || undefined,
    dateTo || undefined,
  )
  const rows = query.data ?? []
  const passed = rows.filter((r) => r.result === true).length
  const failed = rows.filter((r) => r.result === false).length
  const scored = rows.filter((r) => r.score != null)
  const avg =
    scored.length > 0
      ? Math.round(
          scored.reduce((s, r) => s + Number(r.score), 0) / scored.length,
        )
      : null

  return (
    <>
      <Panel padding="sm" className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-violet-soft text-violet">
              <GraduationCap className="size-3.5" aria-hidden />
            </span>
            <p className="truncate text-[12px] font-semibold text-deep">
              {t('students.showPage.examCenterTitle')}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              loading={query.isFetching}
              onClick={() => void query.refetch()}
              aria-label={t('students.showPage.refresh')}
            >
              <RefreshCw className="size-3.5" aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setDetailsOpen(true)}
              disabled={query.isLoading || query.isError}
              aria-label={t('dashboard.student.details')}
            >
              <Eye className="size-3.5" aria-hidden />
            </Button>
          </div>
        </div>

        {query.isLoading ? (
          <SkeletonLines lines={2} />
        ) : query.isError ? (
          <ErrorMessage />
        ) : (
          <div className="grid grid-cols-4 gap-1.5">
            {(
              [
                { label: t('students.showPage.examTotal'), value: rows.length },
                {
                  label: t('students.showPage.passed'),
                  value: passed,
                  tone: 'text-teal',
                },
                {
                  label: t('students.showPage.failed'),
                  value: failed,
                  tone: 'text-rose',
                },
                {
                  label: t('students.showPage.avgScore'),
                  value: avg ?? '—',
                },
              ] as const
            ).map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center rounded-lg border border-mist/60 px-1 py-1.5 text-center"
              >
                <p
                  className={`text-sm font-semibold ${'tone' in item ? item.tone : 'text-deep'}`}
                >
                  {item.value}
                </p>
                <p className="text-[9px] leading-tight text-muted">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Modal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={t('students.showPage.examCenterTitle')}
        sizeClassName="max-w-3xl"
      >
        <div className="mb-3 flex flex-wrap items-end gap-2">
          <DateInput
            size="sm"
            label={t('students.showPage.fromDate')}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <DateInput
            size="sm"
            label={t('students.showPage.toDate')}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <Button
            variant="ghost"
            size="sm"
            loading={query.isFetching}
            onClick={() => void query.refetch()}
          >
            <RefreshCw className="size-3.5" aria-hidden />
            {t('students.showPage.refresh')}
          </Button>
        </div>

        {rows.length === 0 ? (
          <EmptyState description={t('students.showPage.examCenterEmpty')} />
        ) : (
          <Table
            storageKey="student-dashboard-exam-center"
            columnToggle={false}
          >
            <THead>
              <TR>
                <TH className="w-10 text-center">№</TH>
                <TH>{t('students.showPage.region')}</TH>
                <TH>{t('students.showPage.district')}</TH>
                <TH>{t('students.showPage.date')}</TH>
                <TH>{t('students.showPage.category')}</TH>
                <TH>{t('students.showPage.result')}</TH>
                <TH>{t('students.showPage.score')}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row, index) => (
                <TR key={row.id ?? index}>
                  <TD className="text-center">{index + 1}</TD>
                  <TD>{asText(row.region?.name)}</TD>
                  <TD>{asText(row.area?.name)}</TD>
                  <TD>
                    {formatDate(row.exam_date || row.date, i18n.language) ??
                      '—'}
                  </TD>
                  <TD>{row.category_flag ?? '—'}</TD>
                  <TD>
                    {row.result == null ? (
                      '—'
                    ) : (
                      <Badge tone={row.result ? 'teal' : 'rose'}>
                        {row.result
                          ? t('students.showPage.passed')
                          : t('students.showPage.failed')}
                      </Badge>
                    )}
                  </TD>
                  <TD>{row.score ?? '—'}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Modal>
    </>
  )
}
