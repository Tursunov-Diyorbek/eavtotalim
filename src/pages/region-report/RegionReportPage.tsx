import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ClipboardList } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  EmptyTR,
  ErrorMessage,
  ExportButton,
  HeaderTR,
  ListPageSkeleton,
  Panel,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
  Tooltip,
} from '@/components/ui'
import { regionReportAreaPath } from '@/config'
import { useRegionReportQuery } from '@/features/region-report'
import { downloadTableXls, escapeHtml, sum, yesterdayLabel } from './xls'

export function RegionReportPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const query = useRegionReportQuery()
  const report = query.data
  const rows = report?.rows ?? []
  const eduTypes = report?.eduTypes ?? []
  const active = sum(rows.map((row) => row.active))
  const archive = sum(rows.map((row) => row.archive))
  const total = active + archive
  const eduTotals = eduTypes.map((_, index) => sum(rows.map((row) => row.byEdu[index] ?? 0)))
  const colSpan = 3 + eduTypes.length

  function exportXls() {
    const heads = eduTypes
      .map((type) => `<th>${escapeHtml(type.shortName)}</th>`)
      .join('')
    const body = rows
      .map((row, index) => {
        const cells = row.byEdu.map((value) => `<td>${value}</td>`).join('')
        return `<tr><td>${index + 1}</td><td>${escapeHtml(row.regionName)}</td><td>${row.active}</td>${cells}</tr>`
      })
      .join('')
    const foot = eduTotals.map((value) => `<td>${value}</td>`).join('')
    downloadTableXls(
      "VILOYATLAR BO'YICHA HISOBOT (avtomaktablar kategoryalari).xls",
      `<table border="1"><tr><th rowspan="2">№</th><th rowspan="2">${escapeHtml(t('regionReportPage.province'))}</th><th rowspan="2">${escapeHtml(t('regionReportPage.total'))}</th><th colspan="${eduTypes.length}">${escapeHtml(t('regionReportPage.categoryTitle'))}</th></tr><tr>${heads}</tr>${body}<tr><td colspan="2">${escapeHtml(t('regionReportPage.total'))}</td><td>${active}</td>${foot}</tr></table>`,
    )
  }

  return (
    <>
      <Header
        title={
          <span className="inline-flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="uppercase">
              {t('regionReportPage.title')} (
              <span className="text-signal">{t('regionReportPage.bySchools')}</span>)
            </span>
            <span className="text-sm font-medium text-amber normal-case">{yesterdayLabel()}</span>
          </span>
        }
        actions={
          <ExportButton onClick={exportXls} disabled={!report || rows.length === 0} />
        }
      />
      <PageMain fill>
        {query.isError && !report ? (
          <ErrorMessage />
        ) : query.isLoading && !report ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <Panel padding="sm" className="shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-signal-soft text-signal">
                    <ClipboardList className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-deep">
                      {t('regionReportPage.cardTitle')}
                    </p>
                    <p className="text-[12px] text-muted">{t('regionReportPage.cardHint')}</p>
                  </div>
                </div>
                <p className="flex items-baseline gap-2 font-semibold">
                  <Tooltip content={t('regionReportPage.totalSchools')}>
                    <span className="font-display text-2xl text-deep">{total}</span>
                  </Tooltip>
                  <span className="text-muted">/</span>
                  <Tooltip content={t('regionReportPage.inactiveSchools')}>
                    <span className="text-lg text-muted">{archive}</span>
                  </Tooltip>
                  <span className="text-muted">/</span>
                  <Tooltip content={t('regionReportPage.activeSchools')}>
                    <span className="text-lg text-teal">{active}</span>
                  </Tooltip>
                </p>
              </div>
            </Panel>
            <Table storageKey="region-report" fill>
              <THead>
                <HeaderTR>
                  <TH column="index" rowSpan={2} className="w-12 text-center">
                    №
                  </TH>
                  <TH column="region" rowSpan={2} className="min-w-52">
                    {t('regionReportPage.province')}
                  </TH>
                  <TH column="active" rowSpan={2} className="w-24 text-center whitespace-nowrap">
                    <span className="text-teal">
                      {t('regionReportPage.total')}
                      <br />({t('regionReportPage.active')})
                    </span>
                  </TH>
                  {eduTypes.length > 0 ? (
                    <TH
                      colSpan={eduTypes.length}
                      registerColumn={false}
                      className="text-center"
                    >
                      <span className="text-[12px] font-semibold tracking-wide text-signal uppercase">
                        {t('regionReportPage.categoryTitle')}
                      </span>
                    </TH>
                  ) : null}
                </HeaderTR>
                {eduTypes.length > 0 ? (
                  <HeaderTR>
                    {eduTypes.map((type, index) => (
                      <TH
                        key={`${type.id ?? index}`}
                        column={`edu-${index}`}
                        columnLabel={type.shortName}
                        className="min-w-14 text-center whitespace-nowrap"
                      >
                        {type.shortName}
                      </TH>
                    ))}
                  </HeaderTR>
                ) : null}
              </THead>
              <TBody>
                {rows.length === 0 ? (
                  <EmptyTR colSpan={colSpan} />
                ) : (
                  <>
                    {rows.map((row, index) => (
                      <TR key={row.regionId ?? index}>
                        <TD column="index" className="text-center text-muted">
                          {index + 1}
                        </TD>
                        <TD column="region">
                          {row.regionId ? (
                            <Button
                              variant="link"
                              size="inline"
                              className="!h-auto max-w-full !justify-start !px-0 !font-medium"
                              onClick={() => navigate(regionReportAreaPath(row.regionId!))}
                            >
                              <span className="truncate">{row.regionName || '—'}</span>
                            </Button>
                          ) : (
                            row.regionName || '—'
                          )}
                        </TD>
                        <TD column="active" className="bg-teal-soft text-center font-semibold text-teal tabular-nums">
                          {row.active}
                        </TD>
                        {row.byEdu.map((value, eduIndex) => (
                          <TD
                            key={eduIndex}
                            column={`edu-${eduIndex}`}
                            className="text-center tabular-nums"
                          >
                            {value}
                          </TD>
                        ))}
                      </TR>
                    ))}
                    <TR className="bg-signal-soft/50 font-semibold hover:bg-signal-soft/50">
                      <TD column="index" colSpan={2} className="text-center text-signal">
                        {t('regionReportPage.total')}
                      </TD>
                      <TD column="active" className="bg-teal-soft text-center text-teal tabular-nums">
                        {active}
                      </TD>
                      {eduTotals.map((value, index) => (
                        <TD key={index} column={`edu-${index}`} className="text-center text-signal tabular-nums">
                          {value}
                        </TD>
                      ))}
                    </TR>
                  </>
                )}
              </TBody>
            </Table>
          </div>
        )}
      </PageMain>
    </>
  )
}
