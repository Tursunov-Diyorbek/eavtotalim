import { apiClientV2 } from './client'
import { buildListQuery, unwrapPage, type FilterItem } from '@/lib/apiPage'
import type { GaiRatingRecord, GaiRatingRow } from '@/types/organization-gai-rating'

type Envelope = {
  status?: number | boolean | string
  response_code?: number | string
  message?: string
  data?: unknown
  total_pages?: number
}

export type OrganizationGaiRatingFilters = {
  year: number
  period: number
  search: string
  regionId: string
  areaId: string
  category: string
  sortDirection: 'asc' | 'desc'
}

/** Eski `getOrganizationGaiRankings`. */
export async function fetchOrganizationGaiRankings(
  args: OrganizationGaiRatingFilters & { page: number; showCount: number },
) {
  const sp = new URLSearchParams()
  sp.set('year', String(args.year))
  sp.set('period', String(args.period))
  sp.set('page', String(args.page))
  sp.set('show_count', String(args.showCount))
  sp.set('sort_by', 'total_score')
  sp.set('sort_direction', args.sortDirection)
  const search = args.search.trim()
  if (search) sp.set('search', search)
  if (args.regionId) sp.set('region_id', args.regionId)
  if (args.areaId) sp.set('area_id', args.areaId)
  if (args.category) sp.set('category', args.category)

  const res = await apiClientV2.get<Envelope & Record<string, unknown>>(
    `/organization-gai-rating/rankings?${sp}`,
  )
  const page = unwrapPage<GaiRatingRow>(res, args.page, args.showCount)
  const failed = res.status === 0 || res.status === false || res.status === '0'
  if (failed && page.data.length === 0) {
    throw new Error(res.message || 'Request failed')
  }
  const nested = res.data
  const box =
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : res
  const totalPages = Number(box.total_pages)
  if (totalPages > 0) return { ...page, last_page: totalPages }
  return page
}

export type OrganizationGaiRatingListFilters = {
  inn: string
  year: string
  periodStart: string
  periodEnd: string
}

const LIST_RELATIONS = ['organization', 'organization_gai_rating_criteria']

function listFilters(args: OrganizationGaiRatingListFilters): FilterItem[] {
  const filters: FilterItem[] = []
  const inn = args.inn.trim()
  if (inn) {
    filters.push({ fieldKey: 'organization.inn', fieldOperator: '=', fieldValue: inn })
  }
  if (args.year) {
    filters.push({ fieldKey: 'year', fieldOperator: '=', fieldValue: args.year })
  }
  if (args.periodStart) {
    filters.push({
      fieldKey: 'period_start_date',
      fieldOperator: '>=',
      fieldValue: args.periodStart,
    })
  }
  if (args.periodEnd) {
    filters.push({
      fieldKey: 'period_end_date',
      fieldOperator: '<=',
      fieldValue: args.periodEnd,
    })
  }
  return filters
}

/** Eski `indexOrganizationGaiRatings`. */
export async function fetchOrganizationGaiRatingList(
  args: OrganizationGaiRatingListFilters & { page: number; showCount: number },
) {
  const extra: Record<string, string> = {}
  LIST_RELATIONS.forEach((name, index) => {
    extra[`relations[${index}]`] = name
  })
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    filters: listFilters(args),
    extra,
  })
  const res = await apiClientV2.get<Envelope & Record<string, unknown>>(
    `/organization-gai-rating?${query}`,
  )
  const page = unwrapPage<GaiRatingRecord>(res, args.page, args.showCount)
  const code = Number(res.response_code)
  const failedStatus = res.status === 0 || res.status === false || res.status === '0'
  const failedCode = Number.isFinite(code) && code > 0 && code !== 200 && code !== 201
  if ((failedStatus || failedCode) && page.data.length === 0) {
    throw new Error(res.message || 'Request failed')
  }
  const nested = res.data
  const box =
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : res
  const totalPages = Number(box.total_pages)
  if (totalPages > 0) return { ...page, last_page: totalPages }
  return page
}
