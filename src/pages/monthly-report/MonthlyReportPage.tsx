import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { fetchDistricts, fetchMonthlyReport, fetchRegions } from '@/api'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  EmptyTR,
  ErrorMessage,
  ExportButton,
  FilterTH,
  FilterTR,
  HeaderTR,
  Input,
  ListPageSkeleton,
  OrganizationLabel,
  OrganizationSelect,
  RegionDistrict,
  Pagination,
  Select,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
  Tabs,
} from '@/components/ui'
import { routes } from '@/config'
import {
  useMonthlyAreaQuery,
  useMonthlyOrganizationQuery,
  useMonthlyRegionQuery,
} from '@/features/monthly-report'
import { useOpenedOnce, usePageState } from '@/hooks'
import type { FilterItem } from '@/lib/apiPage'
import { downloadTableXls, escapeHtml } from '@/pages/region-report/xls'
import type { MonthlyReportRow } from '@/types/monthly-report'

type TabId = 'region' | 'area' | 'org'

function currentMonthValue() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function splitMonth(value: string) {
  const [yearText, monthText] = value.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  if (year >= 2000 && month >= 1 && month <= 12) return { year, month }
  const now = currentMonthValue().split('-')
  return { year: Number(now[0]), month: Number(now[1]) }
}

function percentText(value: number | null) {
  if (value == null) return ''
  return `${value.toFixed(2)} %`
}

function countText(value: number | null) {
  if (value == null) return ''
  return String(value)
}

function Mark({
  tone,
  text,
}: {
  tone: 'rose' | 'amber'
  text: string
}) {
  if (!text) return null
  return (
    <span
      className={
        tone === 'rose'
          ? 'flex w-full justify-center rounded-md bg-rose-soft px-2 py-1 text-[13px] font-medium text-rose tabular-nums'
          : 'flex w-full justify-center rounded-md bg-amber-soft px-2 py-1 text-[13px] font-medium text-amber tabular-nums'
      }
    >
      {text}
    </span>
  )
}

function filtersOf(regionId: string, areaId: string, organizationId = '') {
  const filters: FilterItem[] = []
  if (regionId) filters.push({ fieldKey: 'region_id', fieldOperator: '=', fieldValue: regionId })
  if (areaId) filters.push({ fieldKey: 'area_id', fieldOperator: '=', fieldValue: areaId })
  if (organizationId) {
    filters.push({ fieldKey: 'organization_id', fieldOperator: '=', fieldValue: organizationId })
  }
  return filters
}

export function MonthlyReportPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [monthValue, setMonthValue] = usePageState('month', currentMonthValue())
  const [tab, setTab] = usePageState<TabId>('tab', 'region')
  const [regionId, setRegionId] = usePageState('region', '')
  const [areaId, setAreaId] = usePageState('area', '')
  const [organizationId, setOrganizationId] = usePageState('organization', '')
  const [areaPage, setAreaPage] = useState(1)
  const [areaPageSize, setAreaPageSize] = useState(10)
  const [orgPage, setOrgPage] = useState(1)
  const [orgPageSize, setOrgPageSize] = useState(10)
  const [exporting, setExporting] = useState(false)
  const { year, month } = splitMonth(monthValue)
  const safeMonth = `${year}-${String(month).padStart(2, '0')}`
  const monthName = t(`autodromeAttendancePage.month${month}`)
  const period = `${year} - ${monthName}`

  const [regionsEnabled, openRegions] = useOpenedOnce(Boolean(regionId))
  const [areasEnabled, openAreas] = useOpenedOnce(Boolean(areaId))
  const regionsQuery = useQuery({
    queryKey: ['monthly-report', 'region-options'],
    queryFn: fetchRegions,
    enabled: regionsEnabled,
  })
  const areasQuery = useQuery({
    queryKey: ['monthly-report', 'area-options', regionId],
    queryFn: () => fetchDistricts(regionId),
    enabled: areasEnabled && Boolean(regionId),
  })
  const regionOptions = (regionsQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || String(item.id),
  }))
  const areaOptions = (areasQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || String(item.id),
  }))

  const areaFilters = useMemo(() => filtersOf(regionId, areaId), [areaId, regionId])
  const orgFilters = useMemo(
    () => filtersOf(regionId, areaId, organizationId),
    [areaId, organizationId, regionId],
  )

  const regionQuery = useMonthlyRegionQuery(year, month, tab === 'region')
  const areaQuery = useMonthlyAreaQuery(year, month, areaPage, areaPageSize, areaFilters, tab === 'area')
  const orgQuery = useMonthlyOrganizationQuery(year, month, orgPage, orgPageSize, orgFilters, tab === 'org')

  const regionRows = regionQuery.data?.rows ?? []
  const areaRows = areaQuery.data?.rows ?? []
  const orgRows = orgQuery.data?.rows ?? []
  const areaTotal = areaQuery.data?.total ?? 0
  const orgTotal = orgQuery.data?.total ?? 0

  function changeMonth(value: string) {
    setMonthValue(value || currentMonthValue())
    setAreaPage(1)
    setOrgPage(1)
  }

  function changeRegion(value: string) {
    setRegionId(value)
    setAreaId('')
    setAreaPage(1)
    setOrgPage(1)
  }

  async function exportXls() {
    const heading =
      tab === 'region'
        ? t('monthlyReport.regions', { period })
        : tab === 'area'
          ? t('monthlyReport.districts', { period })
          : t('monthlyReport.organizations', { period })
    setExporting(true)
    try {
      const rows =
        tab === 'region'
          ? regionRows
          : tab === 'area'
            ? (await fetchMonthlyReport({ scope: 'area', year, month, pageSize: 'all' })).rows
            : (await fetchMonthlyReport({ scope: 'organization', year, month, pageSize: 'all' })).rows
      if (!rows.length) return
      const body = rows
        .map((row, index) => {
          if (tab === 'region') {
            return `<tr><td>${index + 1}</td><td>${escapeHtml(row.name)}</td><td>${countText(row.lessonSum)}</td><td>${countText(row.absentSum)}</td><td>${percentText(row.absentPercent)}</td><td>${percentText(row.monitoringPercent)}</td></tr>`
          }
          if (tab === 'area') {
            return `<tr><td>${index + 1}</td><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.regionName)}</td><td>${percentText(row.absentPercent)}</td><td>${percentText(row.monitoringPercent)}</td></tr>`
          }
          const org = row.inn ? `${row.name} (${row.inn})` : row.name
          return `<tr><td>${index + 1}</td><td>${escapeHtml(org)}</td><td>${escapeHtml(row.regionName)}</td><td>${escapeHtml(row.areaName)}</td><td>${percentText(row.absentPercent)}</td><td>${percentText(row.monitoringPercent)}</td></tr>`
        })
        .join('')
      const head =
        tab === 'region'
          ? `<th>№</th><th>${escapeHtml(heading)}</th><th>${escapeHtml(t('monthlyReport.lessonSum'))}</th><th>${escapeHtml(t('monthlyReport.absentSum'))}</th><th>${escapeHtml(t('monthlyReport.absentPercent'))}</th><th>${escapeHtml(t('monthlyReport.monitoring'))}</th>`
          : tab === 'area'
            ? `<th>№</th><th>${escapeHtml(heading)}</th><th>${escapeHtml(t('monthlyReport.regionsPlain'))}</th><th>${escapeHtml(t('monthlyReport.absentPercent'))}</th><th>${escapeHtml(t('monthlyReport.monitoring'))}</th>`
            : `<th>№</th><th>${escapeHtml(heading)}</th><th>${escapeHtml(t('monthlyReport.regionsPlain'))}</th><th>${escapeHtml(t('monthlyReport.districtsPlain'))}</th><th>${escapeHtml(t('monthlyReport.absentPercent'))}</th><th>${escapeHtml(t('monthlyReport.monitoring'))}</th>`
      downloadTableXls(
        `${tab === 'region' ? 'Viloyatlar' : tab === 'area' ? 'Tumanlar' : 'Tashkilotlar'}.xls`,
        `<table border="1"><tr>${head}</tr>${body}</table>`,
      )
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <Header
        title={<span className="uppercase">{t('monthlyReport.title')}</span>}
        actions={
          <div className="flex shrink-0 flex-nowrap items-center gap-2">
            <div className="w-40 shrink-0">
              <Input
                type="month"
                size="sm"
                label=""
                id="monthly-report-month"
                name="monthly-report-month"
                aria-label={t('monthlyReport.month')}
                value={safeMonth}
                onChange={(event) => changeMonth(event.target.value)}
              />
            </div>
            <ExportButton loading={exporting} onClick={() => void exportXls()}>
              EXPORT (XLS)
            </ExportButton>
          </div>
        }
      />
      <PageMain fill>
        <Tabs
          className="shrink-0"
          size="sm"
          value={tab}
          onChange={setTab}
          aria-label={t('monthlyReport.title')}
          items={[
            { value: 'region', label: t('monthlyReport.regionsTab') },
            { value: 'area', label: t('monthlyReport.districtsTab') },
            { value: 'org', label: t('monthlyReport.organizationsTab') },
          ]}
        />
        <div className="flex min-h-0 flex-1 flex-col">
          {tab === 'region' ? (
            <CountTable
              rows={regionRows}
              loading={regionQuery.isLoading && !regionQuery.data}
              error={regionQuery.isError && !regionQuery.data}
              nameHeader={t('monthlyReport.regions', { period })}
              storageKey="monthly-report-regions"
            />
          ) : null}
          {tab === 'area' ? (
            <PlaceTable
              rows={areaRows}
              loading={areaQuery.isLoading && !areaQuery.data}
              error={areaQuery.isError && !areaQuery.data}
              page={areaPage}
              pageSize={areaPageSize}
              storageKey="monthly-report-areas"
              regionId={regionId}
              areaId={areaId}
              regionOptions={regionOptions}
              areaOptions={areaOptions}
              regionsLoading={regionsQuery.isFetching && regionOptions.length === 0}
              areasLoading={areasQuery.isFetching && areaOptions.length === 0}
              onOpenRegions={openRegions}
              onOpenAreas={openAreas}
              onRegion={changeRegion}
              onArea={(value) => {
                setAreaId(value)
                setAreaPage(1)
                setOrgPage(1)
              }}
            />
          ) : null}
          {tab === 'org' ? (
            <OrgTable
              rows={orgRows}
              loading={orgQuery.isLoading && !orgQuery.data}
              error={orgQuery.isError && !orgQuery.data}
              page={orgPage}
              pageSize={orgPageSize}
              nameHeader={t('monthlyReport.organizations', { period })}
              regionId={regionId}
              areaId={areaId}
              organizationId={organizationId}
              regionOptions={regionOptions}
              areaOptions={areaOptions}
              regionsLoading={regionsQuery.isFetching && regionOptions.length === 0}
              areasLoading={areasQuery.isFetching && areaOptions.length === 0}
              onOpenRegions={openRegions}
              onOpenAreas={openAreas}
              onRegion={changeRegion}
              onArea={(value) => {
                setAreaId(value)
                setAreaPage(1)
                setOrgPage(1)
              }}
              onOrganization={(value) => {
                setOrganizationId(value)
                setOrgPage(1)
              }}
              onOpen={(id) => navigate(`${routes.allOrganizations}/${id}`)}
            />
          ) : null}
        </div>
        {tab === 'region' && regionQuery.data ? (
          <p className="shrink-0 text-sm text-muted">
            {t('common.total', { count: regionQuery.data.total })}
          </p>
        ) : null}
        {tab === 'area' ? (
          <Pagination
            className="shrink-0"
            storageKey="monthly-areas"
            page={areaPage}
            pageSize={areaPageSize}
            total={areaTotal}
            totalPages={Math.max(1, Math.ceil(areaTotal / areaPageSize) || 1)}
            onPageChange={setAreaPage}
            onPageSizeChange={(size) => {
              setAreaPageSize(size)
              setAreaPage(1)
            }}
          />
        ) : null}
        {tab === 'org' ? (
          <Pagination
            className="shrink-0"
            storageKey="monthly-orgs"
            page={orgPage}
            pageSize={orgPageSize}
            total={orgTotal}
            totalPages={Math.max(1, Math.ceil(orgTotal / orgPageSize) || 1)}
            onPageChange={setOrgPage}
            onPageSizeChange={(size) => {
              setOrgPageSize(size)
              setOrgPage(1)
            }}
          />
        ) : null}
      </PageMain>
    </>
  )
}

function CountTable({
  rows,
  loading,
  error,
  nameHeader,
  storageKey,
}: {
  rows: MonthlyReportRow[]
  loading: boolean
  error: boolean
  nameHeader: string
  storageKey: string
}) {
  const { t } = useTranslation()
  if (error) return <ErrorMessage />
  if (loading) return <ListPageSkeleton rows={8} />
  return (
    <Table storageKey={storageKey} fill>
      <THead>
        <HeaderTR>
          <TH column="index" className="w-12 text-center">
            №
          </TH>
          <TH column="name" className="min-w-56 text-left">
            {nameHeader}
          </TH>
          <TH column="lesson" className="min-w-44 text-center">
            {t('monthlyReport.lessonSum')}
          </TH>
          <TH column="absent" className="min-w-36 text-center">
            {t('monthlyReport.absentSum')}
          </TH>
          <TH column="absentPercent" className="min-w-36 text-center">
            {t('monthlyReport.absentPercent')}
          </TH>
          <TH column="monitoring" className="min-w-40 text-center">
            {t('monthlyReport.monitoring')}
          </TH>
        </HeaderTR>
      </THead>
      <TBody>
        {rows.length === 0 ? (
          <EmptyTR colSpan={6} />
        ) : (
          rows.map((row, index) => (
            <TR key={`${row.name}-${index}`}>
              <TD column="index" className="text-center text-muted">
                {index + 1}
              </TD>
              <TD column="name">{row.name || '—'}</TD>
              <TD column="lesson">
                <Mark tone="rose" text={countText(row.lessonSum)} />
              </TD>
              <TD column="absent">
                <Mark tone="rose" text={countText(row.absentSum)} />
              </TD>
              <TD column="absentPercent">
                <Mark tone="rose" text={percentText(row.absentPercent)} />
              </TD>
              <TD column="monitoring">
                <Mark tone="amber" text={percentText(row.monitoringPercent)} />
              </TD>
            </TR>
          ))
        )}
      </TBody>
    </Table>
  )
}

function PlaceTable({
  rows,
  loading,
  error,
  page,
  pageSize,
  storageKey,
  regionId,
  areaId,
  regionOptions,
  areaOptions,
  regionsLoading,
  areasLoading,
  onOpenRegions,
  onOpenAreas,
  onRegion,
  onArea,
}: {
  rows: MonthlyReportRow[]
  loading: boolean
  error: boolean
  page: number
  pageSize: number
  storageKey: string
  regionId: string
  areaId: string
  regionOptions: { value: string; label: string }[]
  areaOptions: { value: string; label: string }[]
  regionsLoading: boolean
  areasLoading: boolean
  onOpenRegions: () => void
  onOpenAreas: () => void
  onRegion: (value: string) => void
  onArea: (value: string) => void
}) {
  const { t } = useTranslation()
  if (error) return <ErrorMessage />
  if (loading) return <ListPageSkeleton rows={8} />
  return (
    <Table storageKey={storageKey} fill>
      <THead>
        <HeaderTR>
          <TH column="index" className="w-12 text-center">
            №
          </TH>
          <TH column="place" className="min-w-80 text-left">
            {t('common.regionDistrict')}
          </TH>
          <TH column="absentPercent" className="min-w-36 text-center">
            {t('monthlyReport.absentPercent')}
          </TH>
          <TH column="monitoring" className="min-w-40 text-center">
            {t('monthlyReport.monitoring')}
          </TH>
        </HeaderTR>
        <FilterTR>
          <FilterTH column="index" />
          <FilterTH column="place">
            <div className="flex items-center gap-1.5">
              <Select
                size="sm"
                clearable
                className="!w-full !min-w-40"
                value={regionId}
                placeholder={t('monthlyReport.regionsPlain')}
                onOpen={onOpenRegions}
                loading={regionsLoading}
                options={regionOptions}
                onChange={(event) => onRegion(event.target.value)}
              />
              <Select
                size="sm"
                clearable
                className="!w-full !min-w-40"
                disabled={!regionId}
                value={areaId}
                placeholder={t('monthlyReport.districtsPlain')}
                onOpen={onOpenAreas}
                loading={areasLoading}
                options={areaOptions}
                onChange={(event) => onArea(event.target.value)}
              />
            </div>
          </FilterTH>
          <FilterTH column="absentPercent" />
          <FilterTH column="monitoring" />
        </FilterTR>
      </THead>
      <TBody>
        {rows.length === 0 ? (
          <EmptyTR colSpan={4} />
        ) : (
          rows.map((row, index) => (
            <TR key={`${row.name}-${index}`}>
              <TD column="index" className="text-center text-muted">
                {(page - 1) * pageSize + index + 1}
              </TD>
              <TD column="place">
                <RegionDistrict region={row.regionName} district={row.name} />
              </TD>
              <TD column="absentPercent">
                <Mark tone="rose" text={percentText(row.absentPercent)} />
              </TD>
              <TD column="monitoring">
                <Mark tone="amber" text={percentText(row.monitoringPercent)} />
              </TD>
            </TR>
          ))
        )}
      </TBody>
    </Table>
  )
}

function OrgTable({
  rows,
  loading,
  error,
  page,
  pageSize,
  nameHeader,
  regionId,
  areaId,
  organizationId,
  regionOptions,
  areaOptions,
  regionsLoading,
  areasLoading,
  onOpenRegions,
  onOpenAreas,
  onRegion,
  onArea,
  onOrganization,
  onOpen,
}: {
  rows: MonthlyReportRow[]
  loading: boolean
  error: boolean
  page: number
  pageSize: number
  nameHeader: string
  regionId: string
  areaId: string
  organizationId: string
  regionOptions: { value: string; label: string }[]
  areaOptions: { value: string; label: string }[]
  regionsLoading: boolean
  areasLoading: boolean
  onOpenRegions: () => void
  onOpenAreas: () => void
  onRegion: (value: string) => void
  onArea: (value: string) => void
  onOrganization: (value: string) => void
  onOpen: (id: number) => void
}) {
  const { t } = useTranslation()
  if (error) return <ErrorMessage />
  if (loading) return <ListPageSkeleton rows={8} />
  return (
    <Table storageKey="monthly-report-organizations" fill>
      <THead>
        <HeaderTR>
          <TH column="index" className="w-12 text-center">
            №
          </TH>
          <TH column="name" className="min-w-96 text-left">
            {nameHeader}
          </TH>
          <TH column="place" className="min-w-80 text-left">
            {t('common.regionDistrict')}
          </TH>
          <TH column="absentPercent" className="min-w-36 text-center">
            {t('monthlyReport.absentPercent')}
          </TH>
          <TH column="monitoring" className="min-w-40 text-center">
            {t('monthlyReport.monitoring')}
          </TH>
        </HeaderTR>
        <FilterTR>
          <FilterTH column="index" />
          <FilterTH column="name">
            <OrganizationSelect
              size="sm"
              className="!w-full !min-w-80"
              valueKey="id"
              value={organizationId}
              onChange={(event) => onOrganization(event.target.value)}
            />
          </FilterTH>
          <FilterTH column="place">
            <div className="flex items-center gap-1.5">
              <Select
                size="sm"
                clearable
                className="!w-full !min-w-40"
                value={regionId}
                placeholder={t('monthlyReport.regionsPlain')}
                onOpen={onOpenRegions}
                loading={regionsLoading}
                options={regionOptions}
                onChange={(event) => onRegion(event.target.value)}
              />
              <Select
                size="sm"
                clearable
                className="!w-full !min-w-40"
                disabled={!regionId}
                value={areaId}
                placeholder={t('monthlyReport.districtsPlain')}
                onOpen={onOpenAreas}
                loading={areasLoading}
                options={areaOptions}
                onChange={(event) => onArea(event.target.value)}
              />
            </div>
          </FilterTH>
          <FilterTH column="absentPercent" />
          <FilterTH column="monitoring" />
        </FilterTR>
      </THead>
      <TBody>
        {rows.length === 0 ? (
          <EmptyTR colSpan={5} />
        ) : (
          rows.map((row, index) => (
            <TR key={`${row.organizationId ?? row.name}-${index}`}>
              <TD column="index" className="text-center text-muted">
                {(page - 1) * pageSize + index + 1}
              </TD>
              <TD column="name">
                {row.organizationId ? (
                  <Button
                    variant="link"
                    size="inline"
                    className="!h-auto !justify-start text-left"
                    onClick={() => onOpen(row.organizationId!)}
                  >
                    <OrganizationLabel stacked name={row.name} inn={row.inn} />
                  </Button>
                ) : (
                  <OrganizationLabel stacked name={row.name} inn={row.inn} />
                )}
              </TD>
              <TD column="place">
                <RegionDistrict region={row.regionName} district={row.areaName} />
              </TD>
              <TD column="absentPercent">
                <Mark tone="rose" text={percentText(row.absentPercent)} />
              </TD>
              <TD column="monitoring">
                <Mark tone="amber" text={percentText(row.monitoringPercent)} />
              </TD>
            </TR>
          ))
        )}
      </TBody>
    </Table>
  )
}
