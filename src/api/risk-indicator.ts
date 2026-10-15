import { apiClientV2 } from './client'
import { assertOk, buildListQuery, unwrapPage, type FilterItem } from '@/lib/apiPage'
import type {
  MonthlyRiskScoreRow,
  OrgRiskScoreRow,
  RiskIndicatorOption,
  TaqdimnomaExisting,
} from '@/types/risk-indicator'

type Envelope = { status?: number | boolean | string; message?: string }

export type MonthlyRiskScoreFilters = {
  /** `OrganizationSelect` — tanlangan tashkilot INN. */
  inn: string
  riskIndicatorId: string
  month: string
  year: string
}

function scoreFilters(args: MonthlyRiskScoreFilters): FilterItem[] {
  const filters: FilterItem[] = []
  const inn = args.inn.trim()
  if (inn) {
    filters.push({
      fieldKey: 'organization.inn',
      fieldOperator: '=',
      fieldValue: inn,
    })
  }
  if (args.riskIndicatorId) {
    filters.push({
      fieldKey: 'risk_indicator_id',
      fieldOperator: '=',
      fieldValue: args.riskIndicatorId,
    })
  }
  if (args.month) {
    filters.push({ fieldKey: 'month', fieldOperator: '=', fieldValue: args.month })
  }
  if (args.year) {
    filters.push({ fieldKey: 'year', fieldOperator: '=', fieldValue: args.year })
  }
  return filters
}

function withTotalPages<T extends { last_page: number }>(
  page: T,
  payload: Record<string, unknown>,
) {
  const nested = payload.data
  const box =
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : payload
  const totalPages = Number(box.total_pages)
  if (totalPages > 0) return { ...page, last_page: totalPages }
  return page
}

/** Eski `indexMonthlyRiskIndicatorScore`. */
export async function fetchMonthlyRiskScores(
  args: MonthlyRiskScoreFilters & { page: number; showCount: number },
) {
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    filters: scoreFilters(args),
  })
  const res = await apiClientV2.get<Envelope & Record<string, unknown>>(
    `/risk-indicator/monthly-risk-indicator-score?${query}`,
  )
  assertOk(res)
  const page = unwrapPage<MonthlyRiskScoreRow>(res, args.page, args.showCount)
  return withTotalPages(page, res)
}

export type OrgRiskScoreFilters = {
  inn: string
  regionId: string
  areaId: string
  month: string
  year: string
}

function orgFilters(args: OrgRiskScoreFilters): FilterItem[] {
  const filters: FilterItem[] = []
  const inn = args.inn.trim()
  if (inn) filters.push({ fieldKey: 'inn', fieldOperator: '=', fieldValue: inn })
  if (args.regionId) {
    filters.push({ fieldKey: 'region_id', fieldOperator: '=', fieldValue: args.regionId })
  }
  if (args.areaId) {
    filters.push({ fieldKey: 'area_id', fieldOperator: '=', fieldValue: args.areaId })
  }
  return filters
}

/** Eski `indexMonthlyRiskIndicatorScoreByOrganization`. Oy va yil filter emas, query param. */
export async function fetchOrgRiskScores(
  args: OrgRiskScoreFilters & { page: number; showCount: number },
) {
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    filters: orgFilters(args),
    extra: { month: args.month, year: args.year },
  })
  const res = await apiClientV2.get<Envelope & Record<string, unknown>>(
    `/risk-indicator/monthly-risk-indicator-score-by-organization?${query}`,
  )
  assertOk(res)
  const page = unwrapPage<OrgRiskScoreRow>(res, args.page, args.showCount)
  return withTotalPages(page, res)
}

type SavedEnvelope = Envelope & { response_code?: number | string; message?: string }

function assertSaved(res: SavedEnvelope) {
  const code = Number(res.response_code)
  const ok =
    code === 200 ||
    code === 201 ||
    code === 2001 ||
    res.status === 1 ||
    res.status === true ||
    res.status === '1'
  if (ok) return
  throw new Error(res.message || 'Request failed')
}

/** Eski `POST /monthly-risk-indicator-organization-scores`. */
export async function createOrgRiskScore(form: FormData) {
  const res = await apiClientV2.postForm<SavedEnvelope>(
    '/monthly-risk-indicator-organization-scores',
    form,
  )
  assertSaved(res)
  return res
}

/** Eski `POST .../:id?_method=PUT`. */
export async function updateOrgRiskScore(id: number, form: FormData) {
  const res = await apiClientV2.postForm<SavedEnvelope>(
    `/monthly-risk-indicator-organization-scores/${id}?_method=PUT`,
    form,
  )
  assertSaved(res)
  return res
}

export async function deleteTaqdimnomaScore(id: number) {
  const res = await apiClientV2.delete<SavedEnvelope>(
    `/risk-indicator/delete-taqdimnoma-score-from-organization/${id}`,
  )
  assertSaved(res)
  return res
}

/**
 * Eski `addTaqdimnomaScoreToOrganization`.
 * `status: 0` — allaqachon bor; `data` da mavjud yozuv qaytadi, xato emas.
 */
export async function addTaqdimnomaScore(body: {
  organization_id: string
  year: number
  month: number
  type: string
  description: string
}) {
  return apiClientV2.post<{
    status?: number | boolean | string
    message?: string
    data?: TaqdimnomaExisting | null
  }>('/risk-indicator/add-taqdimnoma-score-to-organization', body)
}

/** Eski `indexRiskIndicators` — filter optionlari. */
export async function fetchRiskIndicators() {
  const res = await apiClientV2.get<Envelope & Record<string, unknown>>(
    '/risk-indicator/index',
  )
  assertOk(res)
  const nested = res.data
  if (Array.isArray(nested)) return nested as RiskIndicatorOption[]
  if (nested && typeof nested === 'object') {
    const inner = (nested as Record<string, unknown>).data
    if (Array.isArray(inner)) return inner as RiskIndicatorOption[]
  }
  return []
}
