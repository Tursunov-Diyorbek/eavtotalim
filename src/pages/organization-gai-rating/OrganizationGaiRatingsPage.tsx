import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  DateInput,
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
import { fetchOrganizationGaiRatingList } from '@/api'
import { useOrganizationGaiRatingListQuery } from '@/features/organization-gai-rating'
import { usePageState } from '@/hooks'
import { downloadTableXls, escapeHtml } from '@/pages/region-report/xls'
import type { GaiRatingRecord } from '@/types/organization-gai-rating'

const CURRENT_YEAR = new Date().getFullYear()

function yearOptions(selected: string) {
  const years = new Set<number>()
  for (let year = CURRENT_YEAR; year >= 2024; year -= 1) years.add(year)
  const picked = Number(selected)
  if (picked > 0) years.add(picked)
  return [...years]
    .sort((a, b) => b - a)
    .map((year) => ({ value: String(year), label: String(year) }))
}

function orgName(row: GaiRatingRecord) {
  return row.organization?.name || row.organization?.name_uz || ''
}

function isoDate(value?: string | null) {
  if (!value) return ''
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  return match ? match[1] : value
}

function formatScore(value: unknown) {
  if (value == null || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return num.toFixed(2)
}

function criteriaTitle(row: GaiRatingRecord) {
  return row.organization_gai_rating_criteria?.title || row.organization_gai_rating_criteria?.name || ''
}

function stamp() {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}`
}

export function OrganizationGaiRatingsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [exporting, setExporting] = useState(false)
  const [inn, setInn] = usePageState('organizationInn', '')
  const [year, setYear] = usePageState('year', String(CURRENT_YEAR))
  const [periodStart, setPeriodStart] = usePageState('periodStart', '')
  const [periodEnd, setPeriodEnd] = usePageState('periodEnd', '')

  useEffect(() => {
    setPage(1)
  }, [inn, year, periodStart, periodEnd, pageSize])

  const filters = { inn, year, periodStart, periodEnd }
  const { data, isLoading, isError } = useOrganizationGaiRatingListQuery({
    ...filters,
    page,
    showCount: pageSize,
  })
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  function resetFilters() {
    setInn('')
    setYear(String(CURRENT_YEAR))
    setPeriodStart('')
    setPeriodEnd('')
  }

  async function exportXls() {
    setExporting(true)
    try {
      const result = await fetchOrganizationGaiRatingList({
        ...filters,
        page: 1,
        showCount: 100000,
      })
      const head = [
        '№',
        t('common.organization'),
        t('gaiRatingsPage.criteria'),
        t('gaiRatingsPage.score'),
        t('gaiRatingsPage.year'),
        t('gaiRatingsPage.periodStart'),
        t('gaiRatingsPage.periodEnd'),
        t('gaiRatingsPage.periodType'),
      ]
      const body = result.data
        .map((row, index) => {
          const name = orgName(row)
          const cells = [
            index + 1,
            `${escapeHtml(name)}${row.organization?.inn ? `<br>${escapeHtml(row.organization.inn)}` : ''}`,
            escapeHtml(criteriaTitle(row)),
            formatScore(row.score),
            row.year ?? '',
            escapeHtml(isoDate(row.period_start_date)),
            escapeHtml(isoDate(row.period_end_date)),
            escapeHtml(row.period_type || ''),
          ]
          return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
        })
        .join('')
      downloadTableXls(
        `gai_reytinglari_${stamp()}.xls`,
        `<table><thead><tr>${head.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`,
      )
      notify.success(t('monthlyRiskScorePage.exported'))
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t('monthlyRiskScorePage.exportError'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <Header
        title={t('gaiRatingsPage.title')}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
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
            {t('gaiRatingsPage.hint')}
          </Notification>
          {isError ? (
            <ErrorMessage />
          ) : isLoading && !data ? (
            <ListPageSkeleton rows={8} />
          ) : (
            <>
              <Table storageKey="organization-gai-ratings">
                <THead>
                  <HeaderTR>
                    <TH className="w-16">№</TH>
                    <TH className="w-72 min-w-72 max-w-72">{t('common.organization')}</TH>
                    <TH className="min-w-64">{t('gaiRatingsPage.criteria')}</TH>
                    <TH className="w-24">{t('gaiRatingsPage.score')}</TH>
                    <TH className="w-72">{t('gaiRatingsPage.period')}</TH>
                    <TH className="w-28">{t('gaiRatingsPage.year')}</TH>
                    <TH className="w-32">{t('gaiRatingsPage.periodType')}</TH>
                  </HeaderTR>
                  <FilterTR>
                    <FilterTH />
                    <FilterTH>
                      <OrganizationSelect
                        size="sm"
                        className="!w-full !min-w-64"
                        value={inn}
                        onChange={(event) => setInn(event.target.value)}
                      />
                    </FilterTH>
                    <FilterTH />
                    <FilterTH />
                    <FilterTH>
                      <div className="flex gap-1">
                        <DateInput
                          size="sm"
                          className="w-36 shrink-0"
                          value={periodStart}
                          placeholder={t('gaiRatingsPage.periodStart')}
                          onChange={(event) => setPeriodStart(event.target.value)}
                        />
                        <DateInput
                          size="sm"
                          className="w-36 shrink-0"
                          value={periodEnd}
                          placeholder={t('gaiRatingsPage.periodEnd')}
                          onChange={(event) => setPeriodEnd(event.target.value)}
                        />
                      </div>
                    </FilterTH>
                    <FilterTH>
                      <Select
                        size="sm"
                        clearable
                        className="!w-full !min-w-24"
                        value={year}
                        options={yearOptions(year)}
                        placeholder={t('gaiRatingsPage.year')}
                        onChange={(event) => setYear(event.target.value)}
                      />
                    </FilterTH>
                    <FilterTH />
                  </FilterTR>
                </THead>
                <TBody>
                  {rows.length === 0 ? (
                    <EmptyTR colSpan={7} />
                  ) : (
                    rows.map((row, index) => {
                      const start = isoDate(row.period_start_date)
                      const end = isoDate(row.period_end_date)
                      const title = criteriaTitle(row)
                      return (
                        <TR key={row.id ?? index}>
                          <TD className="text-center text-muted">
                            {(page - 1) * pageSize + index + 1}
                          </TD>
                          <TD className="w-72 max-w-72 overflow-hidden">
                            <OrganizationLabel
                              stacked
                              className="max-w-full [&>span]:block [&>span]:max-w-full [&>span]:min-w-0"
                              name={orgName(row)}
                              inn={row.organization?.inn}
                            />
                          </TD>
                          <TD className="max-w-80 overflow-hidden">
                            <span className="block min-w-0 max-w-full truncate" title={title}>
                              {title || '—'}
                            </span>
                          </TD>
                          <TD className="text-center font-medium tabular-nums">
                            {formatScore(row.score)}
                          </TD>
                          <TD className="whitespace-nowrap text-center text-[13px]">
                            {start || end ? `${start || '—'} — ${end || '—'}` : '—'}
                          </TD>
                          <TD className="text-center">{row.year || '—'}</TD>
                          <TD className="text-center">{row.period_type || '—'}</TD>
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
