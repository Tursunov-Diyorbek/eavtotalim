import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, ListChecks, TriangleAlert } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyTR,
  ErrorMessage,
  ExportButton,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  OrganizationLabel,
  OrganizationSelect,
  Pagination,
  RegionDistrict,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Tooltip,
  notify,
  type BadgeTone,
} from '@/components/ui'
import { fetchDistricts, fetchOrganizationGaiRankings, fetchRegions } from '@/api'
import { useOrganizationGaiRankingsQuery } from '@/features/organization-gai-rating'
import { useOpenedOnce, usePageState } from '@/hooks'
import { asLangName } from '@/lib/apiPage'
import { cn } from '@/lib/cn'
import { downloadTableXls, escapeHtml } from '@/pages/region-report/xls'
import type { GaiRatingCriterion, GaiRatingRow } from '@/types/organization-gai-rating'

const CURRENT_YEAR = new Date().getFullYear()

const CRITERIA_MAX = [30, 10, 30, 30]

const CRITERIA_BY_CODE: Record<
  string,
  { max: number; titleKey: string; details: { key: string; labelKey: string }[] }
> = {
  student_exam_results_score: {
    max: 30,
    titleKey: 'exam',
    details: [
      { key: 'graduated', labelKey: 'dashboard.gai_graduated' },
      { key: 'exam_taken', labelKey: 'dashboard.gai_exam_taken' },
      { key: 'passed', labelKey: 'dashboard.gai_passed' },
    ],
  },
  teacher_score: {
    max: 10,
    titleKey: 'teachers',
    details: [
      { key: 'total', labelKey: 'dashboard.gai_total' },
      { key: 'oliy_phd_yoki_dsi', labelKey: 'dashboard.gai_oliy_phd_yoki_dsi' },
      { key: 'oliy', labelKey: 'dashboard.gai_oliy' },
      { key: 'orta', labelKey: 'dashboard.gai_orta' },
      { key: 'orta_maxsus', labelKey: 'dashboard.gai_orta_maxsus' },
    ],
  },
  student_traffic_fines_score: {
    max: 30,
    titleKey: 'fines',
    details: [
      { key: 'graduated', labelKey: 'dashboard.gai_graduated' },
      { key: 'fines_count', labelKey: 'dashboard.gai_fines_count' },
      { key: 'penalty_score', labelKey: 'dashboard.gai_penalty_score' },
    ],
  },
  student_traffic_accidents_score: {
    max: 30,
    titleKey: 'accidents',
    details: [
      { key: 'graduated', labelKey: 'dashboard.gai_graduated' },
      { key: 'guilty_accidents', labelKey: 'dashboard.gai_guilty_accidents' },
    ],
  },
}

const TONE: Record<
  'teal' | 'amber' | 'rose' | 'neutral',
  { badge: BadgeTone; stroke: string; text: string; bar: string; soft: string }
> = {
  teal: {
    badge: 'teal',
    stroke: 'var(--color-teal)',
    text: 'text-teal',
    bar: 'bg-teal',
    soft: 'bg-teal-soft text-teal',
  },
  amber: {
    badge: 'amber',
    stroke: 'var(--color-amber)',
    text: 'text-amber',
    bar: 'bg-amber',
    soft: 'bg-amber-soft text-amber',
  },
  rose: {
    badge: 'rose',
    stroke: 'var(--color-rose)',
    text: 'text-rose',
    bar: 'bg-rose',
    soft: 'bg-rose-soft text-rose',
  },
  neutral: {
    badge: 'neutral',
    stroke: 'var(--color-muted)',
    text: 'text-muted',
    bar: 'bg-muted',
    soft: 'bg-fog text-muted',
  },
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function formatScore(value: unknown) {
  if (value == null || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return num.toFixed(2)
}

function formatDetail(value: unknown) {
  if (value == null || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return Number.isInteger(num) ? String(num) : num.toFixed(1)
}

function formatDate(value?: string | null) {
  if (!value) return ''
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (match) return `${match[3]}.${match[2]}.${match[1]}`
  return value
}

function placeName(value: unknown, lang: string) {
  if (typeof value === 'string') return value
  const text = asLangName(value, lang)
  return text === '—' ? '' : text
}

function criteriaCode(item: GaiRatingCriterion) {
  return item.code || item.organization_gai_rating_criteria?.code || ''
}

function criteriaList(row: GaiRatingRow) {
  const list = row.criteria ?? row.ratings ?? row.organization_gai_ratings ?? row.items ?? []
  return Array.isArray(list) ? list : []
}

function criteriaTitle(item: GaiRatingCriterion) {
  return (
    item.title ||
    item.name ||
    item.criteria_name ||
    item.organization_gai_rating_criteria?.title ||
    item.organization_gai_rating_criteria?.name ||
    ''
  )
}

function criteriaMax(item: GaiRatingCriterion, index: number, total: number) {
  const meta = CRITERIA_BY_CODE[criteriaCode(item)]
  if (meta) return meta.max
  if (CRITERIA_MAX[index] != null) return CRITERIA_MAX[index]
  const count = total > 0 ? total : CRITERIA_MAX.length
  return Math.round(100 / count)
}

function totalScore(row: GaiRatingRow) {
  if (row.total_score != null && row.total_score !== '') return row.total_score
  if (row.score != null && row.score !== '') return row.score
  if (row.umumiy_ball != null && row.umumiy_ball !== '') return row.umumiy_ball
  const items = criteriaList(row)
  if (!items.length) return null
  return items.reduce((sum, item) => {
    const value = Number(item.score)
    return Number.isNaN(value) ? sum : sum + value
  }, 0)
}

function orgName(row: GaiRatingRow) {
  return (
    row.name ||
    row.name_uz ||
    row.organization_name ||
    row.organization?.name ||
    row.organization?.name_uz ||
    ''
  )
}

function orgInn(row: GaiRatingRow) {
  return row.inn || row.organization_inn || row.organization?.inn || ''
}

function categoryTone(row: GaiRatingRow) {
  const key = String(row.category || '').toLowerCase()
  if (key === 'green') return TONE.teal
  if (key === 'yellow') return TONE.amber
  if (key === 'red') return TONE.rose
  const score = Number(totalScore(row))
  if (!Number.isNaN(score)) {
    if (score >= 80) return TONE.teal
    if (score >= 50) return TONE.amber
    return TONE.rose
  }
  return TONE.neutral
}

function categoryLabel(row: GaiRatingRow, t: (key: string) => string) {
  if (row.category_label) return row.category_label
  const key = String(row.category || '').toLowerCase()
  if (key === 'green') return t('gaiRatingByOrgPage.green')
  if (key === 'yellow') return t('gaiRatingByOrgPage.yellow')
  if (key === 'red') return t('gaiRatingByOrgPage.red')
  const score = Number(totalScore(row))
  if (!Number.isNaN(score)) {
    if (score >= 80) return t('gaiRatingByOrgPage.green')
    if (score >= 50) return t('gaiRatingByOrgPage.yellow')
    return t('gaiRatingByOrgPage.red')
  }
  return '—'
}

function rowKey(row: GaiRatingRow, year: string, period: string, index: number) {
  if (row.id != null) return `id-${row.id}`
  const inn = orgInn(row)
  return `${row.organization_id ?? inn}_${row.year || year}_${row.period || period}_${index}`
}

function yearOptions(selected: string) {
  const years = new Set<number>()
  for (let year = CURRENT_YEAR; year >= 2024; year -= 1) years.add(year)
  const picked = Number(selected)
  if (picked > 0) years.add(picked)
  return [...years]
    .sort((a, b) => b - a)
    .map((year) => ({ value: String(year), label: String(year) }))
}

function stamp() {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}`
}

function ScoreDonut({ value, color }: { value: number; color: string }) {
  const size = 132
  const stroke = 12
  const radius = (size - stroke) / 2
  const length = 2 * Math.PI * radius
  const target = Number.isFinite(value) ? value : 0
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? target : 0))

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(target)
      return
    }
    setShown(0)
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setShown(target))
    })
    return () => cancelAnimationFrame(id)
  }, [target])

  const pct = Math.max(0, Math.min(1, shown / 100))
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-fog)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${length * pct} ${length}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 700ms ease-out' }}
      />
      <text
        x="50%"
        y="46%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--color-deep)"
        fontSize="26"
        fontWeight="650"
      >
        {formatScore(target)}
      </text>
      <text
        x="50%"
        y="64%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--color-muted)"
        fontSize="12"
      >
        / 100
      </text>
    </svg>
  )
}

function Rise({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const [on, setOn] = useState(prefersReducedMotion)
  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = window.setTimeout(() => setOn(true), delay)
    return () => window.clearTimeout(id)
  }, [delay])
  return (
    <div
      className={cn(
        'transition duration-500 ease-out',
        on ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
      )}
    >
      {children}
    </div>
  )
}

function CriteriaCard({
  index,
  item,
  max,
  barClass,
  softClass,
  delay,
}: {
  index: number
  item: GaiRatingCriterion
  max: number
  barClass: string
  softClass: string
  delay: number
}) {
  const { t } = useTranslation()
  const meta = CRITERIA_BY_CODE[criteriaCode(item)]
  const fullTitle = criteriaTitle(item)
  const title = meta ? t(`gaiRatingByOrgPage.${meta.titleKey}`) : fullTitle || '—'
  const hasScore = item.score != null && item.score !== ''
  const numeric = Number(item.score)
  const target =
    hasScore && !Number.isNaN(numeric) ? Math.max(0, Math.min(100, (numeric / max) * 100)) : 0
  const [pct, setPct] = useState(() => (prefersReducedMotion() ? target : 0))

  useEffect(() => {
    if (prefersReducedMotion()) {
      setPct(target)
      return
    }
    setPct(0)
    const id = window.setTimeout(() => setPct(target), 120 + delay)
    return () => window.clearTimeout(id)
  }, [target, delay])

  const details = meta
    ? meta.details
        .filter((field) => item.details?.[field.key] != null)
        .map((field) => ({
          key: field.key,
          label: t(field.labelKey),
          value: formatDetail(item.details?.[field.key]),
        }))
    : Object.entries(item.details ?? {}).map(([key, value]) => ({
        key,
        label: t(`dashboard.gai_${key}`, { defaultValue: key }),
        value: formatDetail(value),
      }))

  return (
    <Rise delay={delay}>
      <div className="h-full rounded-xl border border-mist/80 bg-white p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                'grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold',
                softClass,
              )}
            >
              {index + 1}
            </span>
            <span className="truncate text-[13px] font-medium text-deep" title={fullTitle || title}>
              {title}
            </span>
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums text-deep">
            {hasScore ? (
              <>
                {formatScore(item.score)}
                <span className="text-xs font-medium text-muted"> / {max}</span>
              </>
            ) : (
              <span className="text-muted">—</span>
            )}
          </p>
        </div>
        {hasScore ? (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fog">
            <div
              className={cn('h-full rounded-full', barClass)}
              style={{ width: `${pct}%`, transition: 'width 700ms ease-out' }}
            />
          </div>
        ) : (
          <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-amber">
            <TriangleAlert className="size-3.5" aria-hidden />
            {t('gaiRatingByOrgPage.notCalculated')}
          </p>
        )}
        {details.length > 0 ? (
          <div
            className="mt-2 grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${details.length}, minmax(0, 1fr))` }}
          >
            {details.map((row) => (
              <div key={row.key} className="rounded-lg bg-fog/80 px-1.5 py-1.5 text-center">
                <div className="text-sm font-semibold tabular-nums text-deep">{row.value}</div>
                <div className="text-[10px] leading-tight text-muted">{row.label}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Rise>
  )
}

function detailText(item: GaiRatingCriterion, t: (key: string) => string) {
  const meta = CRITERIA_BY_CODE[criteriaCode(item)]
  if (!item.details || !meta) return ''
  return meta.details
    .filter((field) => item.details?.[field.key] != null)
    .map((field) => `${t(field.labelKey)}: ${formatDetail(item.details?.[field.key])}`)
    .join('; ')
}

export function OrganizationGaiRatingPage() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [expanded, setExpanded] = useState<string[]>([])
  const [exporting, setExporting] = useState(false)
  const [year, setYear] = usePageState('year', String(CURRENT_YEAR))
  const [period, setPeriod] = usePageState('period', '1')
  const [regionId, setRegionId] = usePageState('region', '')
  const [areaId, setAreaId] = usePageState('area', '')
  const [organizationInn, setOrganizationInn] = usePageState('organizationInn', '')
  const [category, setCategory] = usePageState('category', '')
  const [sortDirection, setSortDirection] = usePageState<'asc' | 'desc'>('sortDirection', 'desc')
  const [regionsEnabled, openRegions] = useOpenedOnce(Boolean(regionId))
  const [areasEnabled, openAreas] = useOpenedOnce(Boolean(areaId))

  useEffect(() => {
    setPage(1)
    setExpanded([])
  }, [year, period, regionId, areaId, organizationInn, category, sortDirection, pageSize])

  const filters = {
    year: Number(year) || CURRENT_YEAR,
    period: Number(period) === 2 ? 2 : 1,
    search: organizationInn,
    regionId,
    areaId,
    category,
    sortDirection,
  }
  const { data, isLoading, isError } = useOrganizationGaiRankingsQuery({
    ...filters,
    page,
    showCount: pageSize,
  })
  const regionsQuery = useQuery({
    queryKey: ['organization-gai-rating', 'region-options'],
    queryFn: fetchRegions,
    enabled: regionsEnabled,
  })
  const areasQuery = useQuery({
    queryKey: ['organization-gai-rating', 'area-options', regionId],
    queryFn: () => fetchDistricts(regionId),
    enabled: areasEnabled && Boolean(regionId),
  })

  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const regionOptions = (regionsQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || String(item.id),
  }))
  const areaOptions = (areasQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name || String(item.id),
  }))
  const periodOptions = [
    { value: '1', label: t('gaiRatingByOrgPage.period1') },
    { value: '2', label: t('gaiRatingByOrgPage.period2') },
  ]
  const categoryOptions = [
    { value: 'green', label: t('gaiRatingByOrgPage.green') },
    { value: 'yellow', label: t('gaiRatingByOrgPage.yellow') },
    { value: 'red', label: t('gaiRatingByOrgPage.red') },
  ]

  function toggle(key: string) {
    setExpanded((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]))
  }

  function resetFilters() {
    setYear(String(CURRENT_YEAR))
    setPeriod('1')
    setRegionId('')
    setAreaId('')
    setOrganizationInn('')
    setCategory('')
    setSortDirection('desc')
  }

  async function exportXls() {
    setExporting(true)
    try {
      const result = await fetchOrganizationGaiRankings({
        ...filters,
        page: 1,
        showCount: 100000,
      })
      const head = [
        '№',
        t('common.organization'),
        t('common.regionDistrict'),
        t('gaiRatingByOrgPage.year'),
        t('gaiRatingByOrgPage.total'),
        t('gaiRatingByOrgPage.category'),
        t('gaiRatingByOrgPage.criteria'),
        t('gaiRatingByOrgPage.score'),
        t('gaiRatingByOrgPage.details'),
        t('gaiRatingByOrgPage.periodStart'),
        t('gaiRatingByOrgPage.periodEnd'),
      ]
      const body = result.data
        .flatMap((row, index) => {
          const items = criteriaList(row)
          const region = placeName(row.region ?? row.organization?.region, i18n.language) || row.region_name || ''
          const area = placeName(row.area ?? row.organization?.area, i18n.language) || row.area_name || ''
          const base = [
            index + 1,
            `${escapeHtml(orgName(row))}${orgInn(row) ? `<br>${escapeHtml(orgInn(row))}` : ''}`,
            escapeHtml([region, area].filter(Boolean).join(' / ')),
            row.year || filters.year,
            formatScore(totalScore(row)),
            escapeHtml(categoryLabel(row, t)),
          ]
          if (!items.length) {
            return [`<tr>${[...base, '', '', '', '', ''].map((cell) => `<td>${cell}</td>`).join('')}</tr>`]
          }
          return items.map((item, itemIndex) => {
            const cells = itemIndex === 0 ? base : base.map(() => '')
            return `<tr>${[
              ...cells,
              escapeHtml(
                criteriaTitle(item) ||
                  (CRITERIA_BY_CODE[criteriaCode(item)]
                    ? t(`gaiRatingByOrgPage.${CRITERIA_BY_CODE[criteriaCode(item)].titleKey}`)
                    : ''),
              ),
              formatScore(item.score),
              escapeHtml(detailText(item, t)),
              escapeHtml(formatDate(item.period_start_date)),
              escapeHtml(formatDate(item.period_end_date)),
            ]
              .map((cell) => `<td>${cell}</td>`)
              .join('')}</tr>`
          })
        })
        .join('')
      downloadTableXls(
        `gai_reytinglari_by_organization_${stamp()}.xls`,
        `<table><thead><tr>${head.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`,
      )
      notify.success(t('monthlyRiskScorePage.exported'))
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t('monthlyRiskScorePage.exportError'))
    } finally {
      setExporting(false)
    }
  }

  const rangeLabel =
    filters.period === 2 ? t('gaiRatingByOrgPage.range2') : t('gaiRatingByOrgPage.range1')

  return (
    <>
      <Header
        title={t('gaiRatingByOrgPage.title')}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Select
              size="sm"
              className="!w-24 !min-w-24"
              value={year}
              options={yearOptions(year)}
              onChange={(event) => setYear(event.target.value)}
            />
            <Select
              size="sm"
              className="!w-64 !min-w-64"
              value={String(filters.period)}
              options={periodOptions}
              onChange={(event) => setPeriod(event.target.value)}
            />
            <Select
              size="sm"
              clearable
              className="!w-44 !min-w-44"
              value={regionId}
              onOpen={openRegions}
              loading={regionsQuery.isFetching && regionOptions.length === 0}
              options={regionOptions}
              placeholder={t('monthlyRiskByOrgPage.pickRegion')}
              onChange={(event) => {
                setRegionId(event.target.value)
                setAreaId('')
              }}
            />
            <Select
              size="sm"
              clearable
              className="!w-44 !min-w-44"
              value={areaId}
              disabled={!regionId}
              onOpen={openAreas}
              loading={areasQuery.isFetching && areaOptions.length === 0}
              options={areaOptions}
              placeholder={t('monthlyRiskByOrgPage.pickArea')}
              onChange={(event) => setAreaId(event.target.value)}
            />
            <Select
              size="sm"
              clearable
              className="!w-32 !min-w-32"
              value={category}
              options={categoryOptions}
              placeholder={t('gaiRatingByOrgPage.category')}
              onChange={(event) => setCategory(event.target.value)}
            />
            <ExportButton loading={exporting} onClick={() => void exportXls()}>
              {t('gaiRatingByOrgPage.excel')}
            </ExportButton>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              {t('monthlyRiskScorePage.clear')}
            </Button>
          </div>
        }
      />
      <PageMain fill>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {isError ? (
            <ErrorMessage />
          ) : isLoading && !data ? (
            <ListPageSkeleton rows={8} />
          ) : (
            <>
              <Table storageKey="organization-gai-rating">
                <THead>
                  <HeaderTR>
                    <TH className="w-16">№</TH>
                    <TH className="w-72 min-w-72 max-w-72">{t('common.organization')}</TH>
                    <TH className="w-48 min-w-48">{t('common.regionDistrict')}</TH>
                    <TH className="w-20">{t('gaiRatingByOrgPage.year')}</TH>
                    <TH className="w-36">
                      <Tooltip
                        content={t(
                          sortDirection === 'desc'
                            ? 'gaiRatingByOrgPage.sortToAsc'
                            : 'gaiRatingByOrgPage.sortToDesc',
                        )}
                      >
                        <Button
                          variant="ghost"
                          size="inline"
                          className="inline-flex items-center !h-auto gap-1 font-semibold"
                          onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
                        >
                          {t('gaiRatingByOrgPage.total')}
                          {sortDirection === 'desc' ? (
                            <ArrowDown className="size-3.5" aria-hidden />
                          ) : (
                            <ArrowUp className="size-3.5" aria-hidden />
                          )}
                        </Button>
                      </Tooltip>
                    </TH>
                    <TH className="w-28">{t('gaiRatingByOrgPage.category')}</TH>
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
                    <FilterTH />
                    <FilterTH />
                    <FilterTH />
                    <FilterTH />
                  </FilterTR>
                </THead>
                <TBody>
                  {rows.length === 0 ? (
                    <EmptyTR colSpan={6} />
                  ) : (
                    rows.map((row, index) => {
                      const key = rowKey(row, year, period, index)
                      const open = expanded.includes(key)
                      const tone = categoryTone(row)
                      const items = criteriaList(row)
                      const region =
                        placeName(row.region ?? row.organization?.region, i18n.language) ||
                        row.region_name ||
                        ''
                      const area =
                        placeName(row.area ?? row.organization?.area, i18n.language) ||
                        row.area_name ||
                        ''
                      return (
                        <Fragment key={key}>
                          <TR className="cursor-pointer" onClick={() => toggle(key)}>
                            <TD className="text-center">
                              <span className="inline-flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-expanded={open}
                                  aria-label={t('gaiRatingByOrgPage.toggle')}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    toggle(key)
                                  }}
                                >
                                  {open ? (
                                    <ChevronDown className="size-3.5" aria-hidden />
                                  ) : (
                                    <ChevronRight className="size-3.5" aria-hidden />
                                  )}
                                </Button>
                                <span className="text-muted">{(page - 1) * pageSize + index + 1}</span>
                              </span>
                            </TD>
                            <TD className="w-72 max-w-72 overflow-hidden">
                              <OrganizationLabel
                                stacked
                                className="max-w-full [&>span]:block [&>span]:max-w-full [&>span]:min-w-0"
                                name={orgName(row)}
                                inn={orgInn(row)}
                              />
                            </TD>
                            <TD className="w-48 max-w-48 overflow-hidden">
                              <RegionDistrict region={region} district={area} />
                            </TD>
                            <TD className="text-center">{row.year || filters.year}</TD>
                            <TD className={cn('text-center text-sm font-semibold tabular-nums', tone.text)}>
                              {formatScore(totalScore(row))}
                            </TD>
                            <TD className="text-center">
                              <Badge tone={tone.badge}>{categoryLabel(row, t)}</Badge>
                            </TD>
                          </TR>
                          {open ? (
                            <TR>
                              <TD className="bg-fog/40 p-3" colSpan={6}>
                                <Rise>
                                  <div className="rounded-xl border border-mist/80 bg-white p-4">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-deep">
                                      <ListChecks className="size-4 text-signal" aria-hidden />
                                      {t('gaiRatingByOrgPage.results', {
                                        year: row.year || filters.year,
                                        range: rangeLabel,
                                      })}
                                    </div>
                                    <div className="grid items-start gap-4 lg:grid-cols-[160px_minmax(0,1fr)]">
                                      <div className="flex flex-col items-center gap-1">
                                        <ScoreDonut
                                          value={Number(totalScore(row)) || 0}
                                          color={tone.stroke}
                                        />
                                        <p className="text-sm font-medium text-deep">
                                          {t('dashboard.totalScore')}
                                        </p>
                                        <Badge tone={tone.badge}>{categoryLabel(row, t)}</Badge>
                                      </div>
                                      <div className="grid gap-2.5 sm:grid-cols-2">
                                        {items.length ? (
                                          items.map((item, itemIndex) => (
                                            <CriteriaCard
                                              key={criteriaCode(item) || itemIndex}
                                              index={itemIndex}
                                              item={item}
                                              max={criteriaMax(item, itemIndex, items.length)}
                                              barClass={tone.bar}
                                              softClass={tone.soft}
                                              delay={itemIndex * 80}
                                            />
                                          ))
                                        ) : (
                                          <p className="text-sm text-muted">
                                            {t('gaiRatingByOrgPage.emptyCriteria')}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </Rise>
                              </TD>
                            </TR>
                          ) : null}
                        </Fragment>
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
