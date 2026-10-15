import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  EmptyTR,
  ErrorMessage,
  ExportButton,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  Notification,
  OrganizationLabel,
  OrganizationSelect,
  Pagination,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { fetchMonthlyRiskScores } from '@/api'
import {
  useMonthlyRiskScoresQuery,
  useRiskIndicatorsQuery,
} from '@/features/risk-indicator'
import { useOpenedOnce, usePageState } from '@/hooks'
import { downloadTableXls, escapeHtml } from '@/pages/region-report/xls'
import type { MonthlyRiskScoreRow } from '@/types/risk-indicator'

const now = new Date()
const CURRENT_MONTH = String(now.getMonth() + 1)
const CURRENT_YEAR = String(now.getFullYear())

function text(value: string | number | null | undefined) {
  if (value == null || value === '') return '—'
  return String(value)
}

function organizationName(row: MonthlyRiskScoreRow) {
  return row.organization?.name || row.organization?.name_uz || ''
}

function stamp() {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}`
}

export function MonthlyRiskScorePage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [exporting, setExporting] = useState(false)
  const [organizationInn, setOrganizationInn] = usePageState('organizationInn', '')
  const [riskId, setRiskId] = usePageState('risk', '')
  const [month, setMonth] = usePageState('month', CURRENT_MONTH)
  const [year, setYear] = usePageState('year', CURRENT_YEAR)
  const [risksEnabled, openRisks] = useOpenedOnce(Boolean(riskId))

  useEffect(() => {
    setPage(1)
  }, [organizationInn, riskId, month, year, pageSize])

  const filters = { inn: organizationInn, riskIndicatorId: riskId, month, year }
  const { data, isLoading, isError } = useMonthlyRiskScoresQuery({
    ...filters,
    page,
    showCount: pageSize,
  })
  const risks = useRiskIndicatorsQuery(risksEnabled)
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: t(`autodromeAttendancePage.month${index + 1}`),
  }))
  const yearOptions = Array.from({ length: 8 }, (_, index) => {
    const value = String(Number(CURRENT_YEAR) - index)
    return { value, label: value }
  })
  if (year && !yearOptions.some((option) => option.value === year)) {
    yearOptions.unshift({ value: year, label: year })
  }
  const riskOptions = (risks.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || '—',
  }))

  function resetFilters() {
    setOrganizationInn('')
    setRiskId('')
    setMonth(CURRENT_MONTH)
    setYear(CURRENT_YEAR)
    setPage(1)
  }

  async function exportXls() {
    if (!month || !year) {
      notify.warning(t('monthlyRiskScorePage.needPeriod'))
      return
    }
    setExporting(true)
    try {
      const result = await fetchMonthlyRiskScores({
        ...filters,
        page: 1,
        showCount: 100000,
      })
      const body = result.data
        .map(
          (row, index) => `<tr>
            <td>${index + 1}</td>
            <td style="text-align:left">${escapeHtml(organizationName(row))}${row.organization?.inn ? `<br>${escapeHtml(row.organization.inn)}` : ''}</td>
            <td style="text-align:left">${escapeHtml(row.risk_indicator?.name || '')}</td>
            <td>${escapeHtml(text(row.score) === '—' ? '' : text(row.score))}</td>
            <td>${escapeHtml(text(row.month) === '—' ? '' : text(row.month))}</td>
            <td>${escapeHtml(text(row.year) === '—' ? '' : text(row.year))}</td>
          </tr>`,
        )
        .join('')
      const html = `<table border="1" cellpadding="5" cellspacing="0"><thead><tr>
        <th>№</th>
        <th>${escapeHtml(t('common.organization'))}</th>
        <th>${escapeHtml(t('monthlyRiskScorePage.indicator'))}</th>
        <th>${escapeHtml(t('monthlyRiskScorePage.score'))}</th>
        <th>${escapeHtml(t('monthlyRiskScorePage.month'))}</th>
        <th>${escapeHtml(t('monthlyRiskScorePage.year'))}</th>
      </tr></thead><tbody>${body}</tbody></table>`
      downloadTableXls(`risk-korsatkichlari_${stamp()}.xls`, html)
      notify.success(t('monthlyRiskScorePage.exported'))
    } catch {
      notify.error(t('monthlyRiskScorePage.exportError'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <Header
        title={t('monthlyRiskScorePage.title')}
        actions={
          <div className="flex items-center gap-2">
            <ExportButton loading={exporting} onClick={() => void exportXls()}>
              Excel
            </ExportButton>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              {t('monthlyRiskScorePage.clear')}
            </Button>
          </div>
        }
      />
      <PageMain fill>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <Notification tone="warning" className="shrink-0">
            {t('monthlyRiskScorePage.hint')}
          </Notification>
          {isError ? (
            <ErrorMessage />
          ) : isLoading && !data ? (
            <ListPageSkeleton rows={8} />
          ) : (
            <>
              <Table storageKey="monthly-risk-score">
                <THead>
                  <HeaderTR>
                    <TH className="w-12">№</TH>
                    <TH className="w-72 min-w-72 max-w-72">{t('common.organization')}</TH>
                    <TH className="w-72 min-w-72 max-w-72">
                      {t('monthlyRiskScorePage.indicator')}
                    </TH>
                    <TH className="w-20">{t('monthlyRiskScorePage.score')}</TH>
                    <TH className="w-40">{t('monthlyRiskScorePage.month')}</TH>
                    <TH className="w-32">{t('monthlyRiskScorePage.year')}</TH>
                  </HeaderTR>
                  <FilterTR>
                    <FilterTH />
                    <FilterTH>
                      <OrganizationSelect
                        size="sm"
                        className="!w-full !min-w-64"
                        value={organizationInn}
                        onChange={(event) => setOrganizationInn(event.target.value)}
                      />
                    </FilterTH>
                    <FilterTH>
                      <Select
                        size="sm"
                        clearable
                        className="!w-full !min-w-56"
                        value={riskId}
                        onChange={(event) => setRiskId(event.target.value)}
                        onOpen={openRisks}
                        loading={risks.isFetching && riskOptions.length === 0}
                        options={riskOptions}
                        placeholder={t('monthlyRiskScorePage.indicator')}
                      />
                    </FilterTH>
                    <FilterTH />
                    <FilterTH>
                      <Select
                        size="sm"
                        clearable
                        className="!w-full !min-w-32"
                        value={month}
                        onChange={(event) => setMonth(event.target.value)}
                        options={monthOptions}
                        placeholder={t('monthlyRiskScorePage.month')}
                      />
                    </FilterTH>
                    <FilterTH>
                      <Select
                        size="sm"
                        clearable
                        className="!w-full !min-w-24"
                        value={year}
                        onChange={(event) => setYear(event.target.value)}
                        options={yearOptions}
                        placeholder={t('monthlyRiskScorePage.year')}
                      />
                    </FilterTH>
                  </FilterTR>
                </THead>
                <TBody>
                  {rows.length === 0 ? (
                    <EmptyTR colSpan={6} />
                  ) : (
                    rows.map((row, index) => {
                      const name = organizationName(row)
                      const indicator = row.risk_indicator?.name || ''
                      return (
                        <TR key={row.id ?? index}>
                          <TD className="text-center">
                            {(page - 1) * pageSize + index + 1}
                          </TD>
                          <TD className="w-72 max-w-72 overflow-hidden">
                            <OrganizationLabel
                              stacked
                              className="max-w-full [&>span]:block [&>span]:max-w-full [&>span]:min-w-0"
                              name={name}
                              inn={row.organization?.inn}
                            />
                          </TD>
                          <TD className="w-72 max-w-72 overflow-hidden">
                            <span
                              className="block min-w-0 max-w-full truncate"
                              title={indicator}
                            >
                              {indicator || '—'}
                            </span>
                          </TD>
                          <TD className="text-center">{text(row.score)}</TD>
                          <TD className="text-center">
                            {row.month
                              ? t(`autodromeAttendancePage.month${row.month}`)
                              : '—'}
                          </TD>
                          <TD className="text-center">{text(row.year)}</TD>
                        </TR>
                      )
                    })
                  )}
                </TBody>
              </Table>
              <Pagination
                className="shrink-0"
                page={page}
                pageSize={pageSize}
                total={total}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </div>
      </PageMain>
    </>
  )
}
