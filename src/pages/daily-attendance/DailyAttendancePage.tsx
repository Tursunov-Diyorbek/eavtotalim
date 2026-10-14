import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  DateInput,
  ExportButton,
  Notification,
  SearchInput,
  Select,
  Tabs,
} from '@/components/ui'
import { fetchDistricts, fetchRegions } from '@/api'
import { useAuth } from '@/features/auth'
import {
  useDailyAttendanceAreaQuery,
  useDailyAttendanceOrganizationQuery,
  useDailyAttendanceRegionQuery,
  useDailyAttendanceTypeOptionsQuery,
  useDailyAttendanceTypeQuery,
} from '@/features/daily-attendance'
import { useOpenedOnce, usePageState } from '@/hooks'
import type { FilterItem } from '@/lib/apiPage'
import { AttendanceCountTable, AttendanceTypeTable } from './AttendanceTable'
import {
  downloadOfficialXls,
  downloadRegionTemplate1,
  organizationTemplate1,
  organizationTemplate2,
  printOfficial,
  regionTemplate2Html,
  typesTemplate,
} from './export'

type TabId = 'region' | 'area' | 'org' | 'type'

function yesterdayIso() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function DailyAttendancePage() {
  const { t } = useTranslation()
  const { me } = useAuth()
  const lockedRegion =
    me?.user?.role === 11 && me.profession?.region_id
      ? String(me.profession.region_id)
      : ''
  const maxDate = yesterdayIso()
  const [date, setDate] = usePageState('date', maxDate)
  const [tab, setTab] = usePageState<TabId>('tab', 'region')
  const [inn, setInn] = usePageState('inn', '')
  const [region, setRegion] = usePageState('region', '')
  const [area, setArea] = usePageState('area', '')
  const [typeId, setTypeId] = usePageState('type', '')
  const safeDate = date && date <= maxDate ? date : maxDate
  const areaRegion = lockedRegion || region
  const [regionsEnabled, openRegions] = useOpenedOnce(Boolean(areaRegion))
  const [areasEnabled, openAreas] = useOpenedOnce(Boolean(area))
  const [typesEnabled, openTypes] = useOpenedOnce(Boolean(typeId))

  const regionsQuery = useQuery({
    queryKey: ['daily-attendance', 'region-options'],
    queryFn: fetchRegions,
    enabled: regionsEnabled,
  })
  const areasQuery = useQuery({
    queryKey: ['daily-attendance', 'area-options', areaRegion],
    queryFn: () => fetchDistricts(areaRegion),
    enabled: areasEnabled && Boolean(areaRegion),
  })
  const typesQuery = useDailyAttendanceTypeOptionsQuery(typesEnabled)

  const orgFilters = useMemo(() => {
    const filters: FilterItem[] = []
    if (areaRegion) filters.push({ fieldKey: 'region_id', fieldOperator: '=', fieldValue: areaRegion })
    if (area) filters.push({ fieldKey: 'area_id', fieldOperator: '=', fieldValue: area })
    if (typeId) {
      filters.push({ fieldKey: 'superior_organization_id', fieldOperator: '=', fieldValue: typeId })
    }
    if (inn.trim()) filters.push({ fieldKey: 'inn', fieldOperator: '=', fieldValue: inn.trim() })
    return filters
  }, [area, areaRegion, inn, typeId])

  const regionQuery = useDailyAttendanceRegionQuery(safeDate, lockedRegion, tab === 'region')
  const areaQuery = useDailyAttendanceAreaQuery(safeDate, areaRegion, tab === 'area')
  const orgQuery = useDailyAttendanceOrganizationQuery(safeDate, orgFilters, tab === 'org')
  const typeQuery = useDailyAttendanceTypeQuery(safeDate, tab === 'type')
  const active =
    tab === 'region' ? regionQuery : tab === 'area' ? areaQuery : tab === 'org' ? orgQuery : typeQuery

  const regionOptions = (regionsQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || String(item.id),
  }))
  const areaOptions = (areasQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || String(item.id),
  }))
  const typeOptions = (typesQuery.data ?? []).map((item) => ({
    value: item.id,
    label: item.name || String(item.id),
  }))

  const exportRows = () => {
    if (tab === 'type') return
    const rows = (tab === 'region' ? regionQuery : tab === 'area' ? areaQuery : orgQuery).data?.rows
    if (!rows?.length) return
    if (tab === 'region') {
      downloadRegionTemplate1(safeDate, rows, "Viloyatlar bo'yicha kunlik davomat (shablon 1)")
      return
    }
    if (tab === 'area') {
      downloadRegionTemplate1(safeDate, rows, "Tumanlar bo'yicha kunlik davomat")
      return
    }
    downloadOfficialXls(
      "Avtomaktablar bo'yicha kunlik davomat (shablon 1)",
      organizationTemplate1(safeDate, rows),
    )
  }

  const exportOfficial = () => {
    if (tab === 'region') {
      const rows = regionQuery.data?.rows ?? []
      if (!rows.length) return
      downloadOfficialXls(
        "Viloyatlar bo'yicha kunlik davomat (shablon 2)",
        regionTemplate2Html(safeDate, rows),
      )
      return
    }
    if (tab === 'org') {
      const rows = orgQuery.data?.rows ?? []
      if (!rows.length) return
      const heading = areaRegion ? `${rows[0]?.kiril || ''} ` : 'Ҳайдовчиларни '
      downloadOfficialXls(
        "Avtomaktablar bo'yicha kunlik davomat (shablon 2)",
        organizationTemplate2(safeDate, rows, heading),
      )
    }
  }

  const exportPdf = () => {
    if (tab === 'region') {
      const rows = regionQuery.data?.rows ?? []
      if (rows.length) printOfficial(regionTemplate2Html(safeDate, rows))
      return
    }
    if (tab === 'org') {
      const rows = orgQuery.data?.rows ?? []
      if (!rows.length) return
      const heading = areaRegion ? `${rows[0]?.kiril || ''} ` : 'Ҳайдовчиларни '
      printOfficial(organizationTemplate2(safeDate, rows, heading))
    }
  }

  const exportTypes = () => {
    const rows = typeQuery.data?.rows ?? []
    if (rows.length) downloadOfficialXls("Turlar bo'yicha (shablon 1)", typesTemplate(rows))
  }

  return (
    <>
      <Header
        title={lockedRegion ? t('dailyAttendance.districtTitle') : t('dailyAttendance.title')}
      />
      <PageMain fill>
        <Notification tone="warning" className="shrink-0">
          {t('dailyAttendance.hint')}
        </Notification>
        <Tabs
          className="shrink-0"
          size="sm"
          value={tab}
          onChange={setTab}
          aria-label={t('dailyAttendance.title')}
          items={[
            { value: 'region', label: t('dailyAttendance.byRegion') },
            { value: 'area', label: t('dailyAttendance.byDistrict') },
            { value: 'org', label: t('dailyAttendance.bySchool') },
            { value: 'type', label: t('dailyAttendance.byType') },
          ]}
        />
        <div className="flex shrink-0 flex-wrap items-end justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-deep uppercase">
            {tab === 'region'
              ? t('dailyAttendance.regionHeading')
              : tab === 'area'
                ? t('dailyAttendance.areaHeading')
                : tab === 'org'
                  ? t('dailyAttendance.schoolHeading')
                  : t('dailyAttendance.byType')}
          </h2>
          <div className="flex flex-wrap items-end justify-end gap-2">
            {tab === 'org' ? (
              <SearchInput
                value={inn}
                placeholder={t('dailyAttendance.inn')}
                onChange={(event) => setInn(event.target.value)}
                className="w-40"
              />
            ) : null}
            {(tab === 'area' || tab === 'org') && !lockedRegion ? (
              <Select
                size="sm"
                className="w-48"
                placeholder={t('dailyAttendance.byRegion')}
                value={region}
                clearable
                onOpen={openRegions}
                loading={regionsQuery.isFetching && regionOptions.length === 0}
                options={regionOptions}
                onChange={(event) => {
                  setRegion(event.target.value)
                  setArea('')
                }}
              />
            ) : null}
            {tab === 'org' ? (
              <Select
                size="sm"
                className="w-48"
                placeholder={t('dailyAttendance.district')}
                value={area}
                clearable
                disabled={!areaRegion}
                onOpen={openAreas}
                loading={areasQuery.isFetching && areaOptions.length === 0}
                options={areaOptions}
                onChange={(event) => setArea(event.target.value)}
              />
            ) : null}
            {tab === 'org' ? (
              <Select
                size="sm"
                className="w-44"
                placeholder={t('dailyAttendance.byType')}
                value={typeId}
                clearable
                onOpen={openTypes}
                loading={typesQuery.isFetching && typeOptions.length === 0}
                options={typeOptions}
                onChange={(event) => setTypeId(event.target.value)}
              />
            ) : null}
            <div className="flex shrink-0 items-end gap-2" style={{ flexWrap: 'nowrap' }}>
              <div className="shrink-0" style={{ width: 168 }}>
                <DateInput
                  size="sm"
                  className="w-full"
                  label={t('dailyAttendance.byDate')}
                  value={safeDate}
                  max={maxDate}
                  onChange={(event) => setDate(event.target.value || maxDate)}
                />
              </div>
              {tab === 'type' ? (
                <ExportButton onClick={exportTypes}>1 (XLS)</ExportButton>
              ) : (
                <ExportButton onClick={exportRows}>1 (XLS)</ExportButton>
              )}
              {tab === 'region' || tab === 'org' ? (
                <>
                  <ExportButton onClick={exportOfficial}>2 (XLS)</ExportButton>
                  <Button variant="outline" size="sm" onClick={exportPdf}>
                    2 (PDF)
                  </Button>
                </>
              ) : null}
              <Button
                variant="outline"
                size="icon"
                aria-label={t('common.refresh')}
                loading={active.isFetching}
                onClick={() => void active.refetch()}
              >
                <RefreshCw className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          {tab === 'region' ? <AttendanceCountTable query={regionQuery} kind="region" /> : null}
          {tab === 'area' ? <AttendanceCountTable query={areaQuery} kind="area" /> : null}
          {tab === 'org' ? <AttendanceCountTable query={orgQuery} kind="org" /> : null}
          {tab === 'type' ? <AttendanceTypeTable query={typeQuery} /> : null}
        </div>
      </PageMain>
    </>
  )
}
