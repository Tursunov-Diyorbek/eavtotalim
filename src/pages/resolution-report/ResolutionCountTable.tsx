import type { UseQueryResult } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  EmptyTR,
  ErrorMessage,
  HeaderTR,
  ListPageSkeleton,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from '@/components/ui'
import { yesterdayLabel } from '@/pages/region-report/xls'
import type { ResolutionCountRow } from '@/types/resolution-report'

function add(rows: ResolutionCountRow[], key: keyof ResolutionCountRow) {
  return rows.reduce((total, row) => total + (typeof row[key] === 'number' ? row[key] : 0), 0)
}

export function ResolutionCountTable({
  title,
  hint,
  onBack,
  query,
  nameHeader,
  nameExtra,
  onName,
  onFull,
}: {
  title: string
  hint: string
  onBack?: () => void
  query: UseQueryResult<ResolutionCountRow[]>
  nameHeader: string
  nameExtra?: (rows: ResolutionCountRow[]) => string
  onName?: (row: ResolutionCountRow) => void
  onFull?: (row: ResolutionCountRow) => void
}) {
  const { t } = useTranslation()
  const rows = query.data ?? []
  const loading = query.isLoading && !query.data
  const colSpan = onFull ? 11 : 10

  return (
    <>
      <Header
        title={
          <span className="inline-flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="uppercase">
              {title} (<span className="text-signal">{hint}</span>)
            </span>
            <span className="text-sm font-medium text-amber normal-case">{yesterdayLabel()}</span>
          </span>
        }
        onBack={onBack}
      />
      <PageMain fill>
        {query.isError && !query.data ? (
          <ErrorMessage />
        ) : loading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="resolution-report" fill>
            <THead>
              <HeaderTR>
                <TH rowSpan={2} column="index" className="w-12 text-center">
                  №
                </TH>
                <TH rowSpan={2} column="name" className="min-w-44 text-left">
                  {nameHeader}
                </TH>
                <TH rowSpan={2} column="schools" className="min-w-28 text-center">
                  {t('resolutionPage.schools')}
                </TH>
                <TH rowSpan={2} column="face" className="min-w-20 text-center">
                  {t('resolutionPage.face')}
                </TH>
                <TH colSpan={2} registerColumn={false} className="text-center">
                  {t('resolutionPage.cars')}
                </TH>
                <TH rowSpan={2} column="test" className="min-w-24 text-center">
                  {t('resolutionPage.test')}
                </TH>
                <TH rowSpan={2} column="ehq" className="min-w-16 text-center">
                  {t('resolutionPage.ehq')}
                </TH>
                <TH rowSpan={2} column="monitoring" className="min-w-24 text-center">
                  {t('resolutionPage.monitoring')}
                </TH>
                <TH rowSpan={2} column="contract" className="min-w-36 text-center">
                  {t('resolutionPage.contract')}
                </TH>
                {onFull ? (
                  <TH rowSpan={2} column="full" className="min-w-32 text-center">
                    {t('resolutionPage.byRegionSchools')}
                  </TH>
                ) : null}
              </HeaderTR>
              <HeaderTR>
                <TH column="gps" className="min-w-24 text-center">
                  {t('resolutionPage.gps')}
                </TH>
                <TH column="allCars" className="min-w-24 text-center">
                  {t('resolutionPage.all')}
                </TH>
              </HeaderTR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={colSpan} />
              ) : (
                <>
                  {rows.map((row, index) => (
                    <TR key={row.id ?? index}>
                      <TD column="index" className="text-center text-muted">
                        {index + 1}
                      </TD>
                      <TD column="name">
                        <NameLink name={row.name} onClick={onName && row.id != null ? () => onName(row) : undefined} />
                      </TD>
                      <CountCell column="schools" value={row.schools} />
                      <CountCell column="face" value={row.faceId} />
                      <CountCell column="gps" value={row.gps} />
                      <CountCell column="allCars" value={row.cars} />
                      <CountCell column="test" value={row.test} />
                      <CountCell column="ehq" value={row.test} />
                      <CountCell column="monitoring" value={row.monitoring} />
                      <CountCell column="contract" value={row.contract} />
                      {onFull ? (
                        <TD column="full" className="text-center">
                          {row.id != null ? (
                            <Button
                              variant="link"
                              size="inline"
                              className="!h-auto !px-0"
                              onClick={() => onFull(row)}
                            >
                              {t('resolutionPage.full')}
                              <ArrowRight className="size-3.5" aria-hidden />
                            </Button>
                          ) : (
                            '—'
                          )}
                        </TD>
                      ) : null}
                    </TR>
                  ))}
                  <TR className="bg-signal-soft/50 font-semibold hover:bg-signal-soft/50">
                    <TD column="index" className="text-center text-signal">
                      {t('resolutionPage.total')}
                    </TD>
                    <TD column="name" className="text-center text-signal">
                      {nameExtra ? nameExtra(rows) : ''}
                    </TD>
                    <CountCell column="schools" value={add(rows, 'schools')} strong />
                    <CountCell column="face" value={add(rows, 'faceId')} strong />
                    <CountCell column="gps" value={add(rows, 'gps')} strong />
                    <CountCell column="allCars" value={add(rows, 'cars')} strong />
                    <CountCell column="test" value={add(rows, 'test')} strong />
                    <CountCell column="ehq" value={add(rows, 'test')} strong />
                    <CountCell column="monitoring" value={add(rows, 'monitoring')} strong />
                    <CountCell column="contract" value={add(rows, 'contract')} strong />
                    {onFull ? <TD column="full" /> : null}
                  </TR>
                </>
              )}
            </TBody>
          </Table>
        )}
      </PageMain>
    </>
  )
}

function CountCell({
  column,
  value,
  strong,
}: {
  column: string
  value: number
  strong?: boolean
}) {
  const { t } = useTranslation()
  return (
    <TD column={column} className={strong ? 'text-center text-signal tabular-nums' : 'text-center tabular-nums'}>
      {value} {t('resolutionPage.pieces')}
    </TD>
  )
}

function NameLink({ name, onClick }: { name: string; onClick?: () => void }) {
  if (!onClick) return <span className="line-clamp-2">{name || '—'}</span>
  return (
    <Button
      variant="link"
      size="inline"
      className="!h-auto !w-full !justify-start !px-0 !text-left !font-medium"
      onClick={onClick}
    >
      <span className="line-clamp-2">{name || '—'}</span>
    </Button>
  )
}
