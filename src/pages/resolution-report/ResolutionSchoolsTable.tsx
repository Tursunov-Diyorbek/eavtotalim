import { useEffect, useState, type ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { FileText, TriangleAlert } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyTR,
  ErrorMessage,
  HeaderTR,
  ListPageSkeleton,
  Pagination,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from '@/components/ui'
import { PATH_PREFIX_FILE_HOST } from '@/config'
import { yesterdayLabel } from '@/pages/region-report/xls'
import type { ResolutionSchoolRow } from '@/types/resolution-report'

function fileHref(path: string) {
  if (!path) return ''
  if (/^https?:/i.test(path)) return path
  const host = PATH_PREFIX_FILE_HOST.replace(/\/$/, '')
  return `${host}/${path.replace(/^\//, '')}`
}

export function ResolutionSchoolsTable({
  title,
  hint,
  onBack,
  query,
  showStatus,
  showDate,
  actions,
  resetKey = '',
}: {
  title: string
  hint?: string
  onBack?: () => void
  query: UseQueryResult<ResolutionSchoolRow[]>
  showStatus: boolean
  showDate: boolean
  actions?: ReactNode
  resetKey?: string
}) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const rows = query.data ?? []
  const loading = query.isLoading && !query.data
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize) || 1)
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)
  const colSpan = showStatus ? 12 : 11

  useEffect(() => {
    setPage(1)
  }, [resetKey])

  return (
    <>
      <Header
        title={
          <span className="inline-flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="uppercase">
              {title}
              {hint ? (
                <>
                  {' '}
                  (<span className="text-signal">{hint}</span>)
                </>
              ) : null}
            </span>
            {showDate ? (
              <span className="text-sm font-medium text-amber normal-case">{yesterdayLabel()}</span>
            ) : null}
          </span>
        }
        actions={actions}
        onBack={onBack}
      />
      <PageMain fill>
        {query.isError && !query.data ? (
          <ErrorMessage />
        ) : loading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <Table storageKey={showStatus ? 'resolution-schools-area' : 'resolution-schools-region'} fill>
              <THead>
                <HeaderTR>
                  <TH rowSpan={2} column="index" className="w-12 text-center">
                    №
                  </TH>
                  <TH rowSpan={2} column="name" className="min-w-52 text-left">
                    {t('resolutionPage.school')}
                  </TH>
                  <TH rowSpan={2} column="inn" className="w-32 text-center">
                    {t('regionalCarsPage.inn')}
                  </TH>
                  <TH rowSpan={2} column="face" className="min-w-28 text-center">
                    {t('resolutionPage.face')}
                  </TH>
                  <TH colSpan={2} registerColumn={false} className="text-center">
                    {t('resolutionPage.cars')}
                  </TH>
                  <TH rowSpan={2} column="test" className="min-w-36 text-center">
                    {t('resolutionPage.test')}
                  </TH>
                  <TH rowSpan={2} column="ehq" className="min-w-36 text-center">
                    {t('resolutionPage.ehq')}
                  </TH>
                  <TH rowSpan={2} column="monitoring" className="min-w-28 text-center">
                    {t('resolutionPage.monitoring')}
                  </TH>
                  <TH rowSpan={2} column="contract" className="min-w-32 text-center">
                    {t('resolutionPage.contractStatus')}
                  </TH>
                  <TH rowSpan={2} column="file" className="min-w-28 text-center">
                    {t('resolutionPage.autodromeFile')}
                  </TH>
                  {showStatus ? (
                    <TH rowSpan={2} column="status" className="min-w-44 text-center">
                      {t('resolutionPage.status')}
                    </TH>
                  ) : null}
                </HeaderTR>
                <HeaderTR>
                  <TH column="gps" className="min-w-20 text-center">
                    {t('resolutionPage.gps')}
                  </TH>
                  <TH column="allCars" className="min-w-20 text-center">
                    {t('resolutionPage.all')}
                  </TH>
                </HeaderTR>
              </THead>
              <TBody>
                {pageRows.length === 0 ? (
                  <EmptyTR colSpan={colSpan} />
                ) : (
                  pageRows.map((row, index) => (
                    <TR key={row.id ?? index}>
                      <TD column="index" className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD column="name">
                        <span className="line-clamp-2">{row.name || '—'}</span>
                      </TD>
                      <TD column="inn" className="text-center whitespace-nowrap text-rose tabular-nums">
                        {row.inn || '—'}
                      </TD>
                      <TD column="face" className="text-center">
                        <MaybeName value={row.face} />
                      </TD>
                      <TD column="gps" className="text-center tabular-nums">
                        {row.gps}
                      </TD>
                      <TD column="allCars" className="text-center tabular-nums">
                        {row.cars}
                      </TD>
                      <TD column="test" className="text-center">
                        <MaybeName value={row.guide} />
                      </TD>
                      <TD column="ehq" className="text-center">
                        <MaybeName value={row.guide} />
                      </TD>
                      <TD column="monitoring" className="text-center">
                        <MonitoringBadge row={row} byArea={showStatus} />
                      </TD>
                      <TD column="contract" className="text-center">
                        <ContractBadge status={row.contractStatus} />
                      </TD>
                      <TD column="file" className="text-center">
                        <ContractFile row={row} byArea={showStatus} />
                      </TD>
                      {showStatus ? (
                        <TD column="status" className="text-center">
                          <ModeBadge mode={row.operatingMode} />
                        </TD>
                      ) : null}
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
            <Pagination
              className="shrink-0"
              page={page}
              pageSize={pageSize}
              total={rows.length}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
            />
          </div>
        )}
      </PageMain>
    </>
  )
}

function MaybeName({ value }: { value: string }) {
  if (value) return <span className="line-clamp-2">{value}</span>
  return <TriangleAlert className="mx-auto size-4 text-amber" aria-hidden />
}

function MonitoringBadge({ row, byArea }: { row: ResolutionSchoolRow; byArea: boolean }) {
  const { t } = useTranslation()
  const on = byArea ? row.monitoring : row.monitoringLegacy
  return (
    <Badge tone={on ? 'teal' : 'rose'}>
      {on ? t('resolutionPage.yes') : t('resolutionPage.no')}
    </Badge>
  )
}

function ContractBadge({ status }: { status: number | null }) {
  const { t } = useTranslation()
  if (status === 1) return <Badge tone="teal">{t('resolutionPage.approved')}</Badge>
  if (status === 2) return <Badge tone="rose">{t('resolutionPage.returned')}</Badge>
  if (status === 0) return <Badge tone="signal">{t('resolutionPage.fresh')}</Badge>
  return <Badge>{t('resolutionPage.no')}</Badge>
}

function ModeBadge({ mode }: { mode: number | null }) {
  const { t } = useTranslation()
  if (mode == null) return <span className="text-muted">—</span>
  if (mode === 1) return <Badge tone="teal">{t('resolutionPage.modeActive')}</Badge>
  if (mode === 2) return <Badge tone="amber">{t('resolutionPage.modeReform')}</Badge>
  if (mode === 3) return <Badge tone="rose">{t('resolutionPage.modeStopped')}</Badge>
  return <span className="text-muted">—</span>
}

function ContractFile({ row, byArea }: { row: ResolutionSchoolRow; byArea: boolean }) {
  const href = byArea
    ? row.autodromeStatusId === 2
      ? fileHref(row.autodromeFile)
      : ''
    : row.contractStatus === 1
      ? fileHref(row.agreementFile)
      : ''
  if (!href) return null
  return (
    <Button
      variant="link"
      size="inline"
      className="!h-auto !px-0"
      onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
    >
      <FileText className="size-4" aria-hidden />
    </Button>
  )
}
