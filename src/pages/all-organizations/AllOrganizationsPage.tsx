import { useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Flag, School, Users } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  DateInput,
  EmptyTR,
  ErrorMessage,
  ExportButton,
  FilterTH,
  FilterTR,
  HeaderTR,
  OrganizationLabel,
  OrganizationSelect,
  Pagination,
  Panel,
  RegionDistrict,
  Select,
  SkeletonCard,
  TBody,
  TD,
  TH,
  TR,
  Table,
} from '@/components/ui'
import { fetchDistricts, fetchRegions } from '@/api/students'
import { useAuth } from '@/features/auth'
import { useAllOrganizationsQuery } from '@/features/all-organizations'
import { useRegionDailyReportQuery } from '@/features/republic-dashboard'
import { useOpenedOnce, usePageState } from '@/hooks'
import { formatDate, formatNumber } from '@/lib'
import type { InspectionOrgRow } from '@/types/all-organizations'

function yesterdayIso() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function downloadXls(filename: string, rows: InspectionOrgRow[], statusOf: (status: number | null) => string) {
  const body = rows
    .map(
      (row, index) =>
        `<tr><td>${index + 1}</td><td>${escapeHtml(row.name)}</td><td>${row.groups}</td><td>${row.students}</td><td>${escapeHtml(row.inn)}</td><td>${escapeHtml(row.region)}</td><td>${escapeHtml(row.area)}</td><td>${escapeHtml(statusOf(row.status))}</td></tr>`,
    )
    .join('')
  const html = `<table border="1"><tr><th>№</th><th>Tashkilot nomi</th><th>Guruhlar soni</th><th>O'quvchilar soni</th><th>INN</th><th>Viloyat</th><th>Tuman</th><th>Holati</th></tr>${body}</table>`
  const blob = new Blob([`\uFEFF${html}`], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function CountCard({
  icon,
  iconClass,
  title,
  hint,
  value,
  loading,
}: {
  icon: ReactNode
  iconClass: string
  title: string
  hint: string
  value: number
  loading: boolean
}) {
  if (loading) return <SkeletonCard />
  return (
    <Panel padding="sm" className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-deep">{title}</p>
          <p className="truncate text-[12px] text-muted">{hint}</p>
        </div>
      </div>
      <p className="font-display text-2xl font-semibold text-deep">{formatNumber(value)}</p>
    </Panel>
  )
}

export function AllOrganizationsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { me } = useAuth()
  const yesterday = yesterdayIso()
  const [date, setDate] = usePageState('date', yesterday)
  const [inn, setInn] = usePageState('inn', '')
  const [regionId, setRegionId] = usePageState('region', '')
  const [areaId, setAreaId] = usePageState('area', '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [regionsEnabled, openRegions] = useOpenedOnce(Boolean(regionId))
  const [areasEnabled, openAreas] = useOpenedOnce(Boolean(areaId))

  const safeDate = date && date <= yesterday ? date : yesterday
  const query = useAllOrganizationsQuery({
    date: safeDate,
    page,
    showCount: pageSize,
    inn: inn || undefined,
    regionId: regionId || undefined,
    areaId: areaId || undefined,
  })
  const stats = useRegionDailyReportQuery(safeDate)
  const homeRegion = me?.profession?.region_id
  const totals = useMemo(() => {
    const rows = (stats.data ?? []).filter((row) => !homeRegion || row.region.id === homeRegion)
    return {
      schools: rows.reduce((sum, row) => sum + row.active_organizations_count, 0),
      groups: rows.reduce((sum, row) => sum + row.active_groups_count, 0),
      students: rows.reduce((sum, row) => sum + row.active_students_count, 0),
    }
  }, [homeRegion, stats.data])

  const regions = useQuery({
    queryKey: ['regions', 'all-organizations'],
    queryFn: fetchRegions,
    enabled: regionsEnabled || Boolean(regionId),
  })
  const districts = useQuery({
    queryKey: ['districts', 'all-organizations', regionId],
    queryFn: () => fetchDistricts(regionId),
    enabled: Boolean(regionId) && (areasEnabled || Boolean(areaId)),
  })
  const regionOptions = (regions.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || String(item.id),
  }))
  const areaOptions = (districts.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || String(item.id),
  }))

  const rows = query.data?.data ?? []
  const total = query.data?.total_items ?? 0
  const totalPages = query.data?.last_page ?? 1

  function statusLabel(status: number | null) {
    if (status === 1) return t('allSchoolsPage.active')
    if (status === 2) return t('allSchoolsPage.reformed')
    if (status === 3) return t('allSchoolsPage.suspended')
    return '—'
  }

  function statusTone(status: number | null) {
    if (status === 1) return 'teal' as const
    if (status === 2) return 'amber' as const
    if (status === 3) return 'rose' as const
    return 'neutral' as const
  }

  return (
    <>
      <Header
        title={
          <span className="inline-flex items-center gap-2">
            {t('nav.allOrganizations')}
            <Badge tone="signal">{formatDate(safeDate)}</Badge>
          </span>
        }
        actions={
          <div className="flex items-end gap-2">
            <DateInput
              size="sm"
              value={safeDate}
              max={yesterday}
              onChange={(event) => {
                const next = event.target.value
                if (!next || next > yesterday) return
                setDate(next)
                setPage(1)
              }}
            />
            <ExportButton
              disabled={!rows.length}
              onClick={() => downloadXls('Avtomaktablar kategoryalari.xls', rows, statusLabel)}
            >
              {t('allSchoolsPage.export')}
            </ExportButton>
          </div>
        }
      />
      <PageMain fill>
        <div className="grid shrink-0 gap-2 sm:grid-cols-3">
          <CountCard
            loading={stats.isLoading && !stats.data}
            icon={<School className="size-5" />}
            iconClass="bg-signal-soft text-signal"
            title={t('allSchoolsPage.schools')}
            hint={t('allSchoolsPage.activeSchools')}
            value={totals.schools}
          />
          <CountCard
            loading={stats.isLoading && !stats.data}
            icon={<Flag className="size-5" />}
            iconClass="bg-indigo-soft text-indigo"
            title={t('allSchoolsPage.groups')}
            hint={t('allSchoolsPage.activeGroups')}
            value={totals.groups}
          />
          <CountCard
            loading={stats.isLoading && !stats.data}
            icon={<Users className="size-5" />}
            iconClass="bg-teal-soft text-teal"
            title={t('allSchoolsPage.students')}
            hint={t('allSchoolsPage.activeStudents')}
            value={totals.students}
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {query.isError && !query.data ? <ErrorMessage /> : null}
          <Table>
            <HeaderTR>
              <TH column="n" className="w-12">№</TH>
              <TH column="org">{t('allSchoolsPage.name')}</TH>
              <TH column="groups" className="w-24 whitespace-nowrap text-center">
                {t('allSchoolsPage.groups')}
              </TH>
              <TH column="students" className="w-28 whitespace-nowrap text-center">
                {t('allSchoolsPage.students')}
              </TH>
              <TH column="place" className="w-[22rem]">{t('common.regionDistrict')}</TH>
              <TH column="status" className="w-52">{t('allSchoolsPage.status')}</TH>
            </HeaderTR>
            <FilterTR>
              <FilterTH column="n" />
              <FilterTH column="org">
                <OrganizationSelect
                  size="sm"
                  className="w-full max-w-sm"
                  id="all-org"
                  name="all-org"
                  value={inn}
                  onChange={(event) => {
                    setInn(event.target.value)
                    setPage(1)
                  }}
                />
              </FilterTH>
              <FilterTH column="groups" />
              <FilterTH column="students" />
              <FilterTH column="place">
                <div className="flex items-center gap-1.5">
                  <Select
                    id="all-org-region"
                    name="all-org-region"
                    size="sm"
                    clearable
                    className="min-w-0 flex-1"
                    value={regionId}
                    placeholder={t('allSchoolsPage.region')}
                    onOpen={openRegions}
                    loading={regions.isFetching && regionOptions.length === 0}
                    options={regionOptions}
                    onChange={(event) => {
                      setRegionId(event.target.value)
                      setAreaId('')
                      setPage(1)
                    }}
                  />
                  <Select
                    id="all-org-area"
                    name="all-org-area"
                    size="sm"
                    clearable
                    className="min-w-0 flex-1"
                    value={areaId}
                    placeholder={t('allSchoolsPage.district')}
                    disabled={!regionId}
                    onOpen={openAreas}
                    loading={districts.isFetching && areaOptions.length === 0}
                    options={areaOptions}
                    onChange={(event) => {
                      setAreaId(event.target.value)
                      setPage(1)
                    }}
                  />
                </div>
              </FilterTH>
              <FilterTH column="status" />
            </FilterTR>
            <TBody>
              {query.isLoading && !query.data ? (
                <TR>
                  <TD colSpan={6}>
                    <SkeletonCard />
                  </TD>
                </TR>
              ) : query.isError && !query.data ? null : rows.length === 0 ? (
                <EmptyTR colSpan={6} />
              ) : (
                rows.map((row, index) => (
                  <TR key={row.id}>
                    <TD>{(page - 1) * pageSize + index + 1}</TD>
                    <TD className="max-w-md">
                      <Button
                        variant="link"
                        size="inline"
                        className="!h-auto max-w-full !min-w-0 !shrink !items-start !justify-start !px-0 !py-0 !font-normal [&>div>span:first-child]:!text-signal"
                        onClick={() => navigate(`/all-organizations/${row.id}`)}
                      >
                        <OrganizationLabel stacked name={row.name} inn={row.inn} />
                      </Button>
                    </TD>
                    <TD className="text-center tabular-nums">{formatNumber(row.groups)}</TD>
                    <TD className="text-center tabular-nums">{formatNumber(row.students)}</TD>
                    <TD>
                      <RegionDistrict region={row.region} district={row.area} />
                    </TD>
                    <TD>
                      <Badge tone={statusTone(row.status)} className="whitespace-nowrap">
                        {statusLabel(row.status)}
                      </Badge>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </div>
        <Pagination
          className="shrink-0"
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </PageMain>
    </>
  )
}
