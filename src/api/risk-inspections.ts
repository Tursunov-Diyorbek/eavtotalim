import { apiClientV2 } from './client'
import { unwrapPage } from '@/lib/apiPage'
import type { RiskInspectionRow } from '@/types/risk-inspection'

type Envelope = {
  status?: number | boolean | string
  message?: string
  data?: unknown
}

export type RiskInspectionFilters = {
  organizationName: string
  status: string
}

function inspectionFilters(args: RiskInspectionFilters) {
  const filters: { fieldKey: string; fieldOperator: string; fieldValue: string }[] = []
  const name = args.organizationName.trim()
  if (name) {
    filters.push({
      fieldKey: 'organization.name',
      fieldOperator: 'LIKE',
      fieldValue: name,
    })
  }
  if (args.status) {
    filters.push({ fieldKey: 'status', fieldOperator: '=', fieldValue: args.status })
  }
  return filters
}

/** Eski `indexRiskIndicatorInspections`. Filterlar JSON satr. */
export async function fetchRiskInspections(
  args: RiskInspectionFilters & { page: number; showCount: number },
) {
  const sp = new URLSearchParams()
  sp.set('page', String(args.page))
  sp.set('show_count', String(args.showCount))
  sp.set('filters', JSON.stringify(inspectionFilters(args)))
  const res = await apiClientV2.get<Envelope & Record<string, unknown>>(
    `/risk-indicator-inspection?${sp}`,
  )
  if (res.status === 0 || res.status === false || res.status === '0') {
    throw new Error(res.message || 'Request failed')
  }
  const page = unwrapPage<RiskInspectionRow>(res, args.page, args.showCount)
  const nested = res.data
  const box =
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : res
  const totalPages = Number(box.total_pages)
  if (totalPages > 0) return { ...page, last_page: totalPages }
  return page
}

export async function createRiskInspection(body: {
  organization_id: string
  year: number
  month: number
  inspection_date: string
  description: string
}) {
  return apiClientV2.post<Envelope>('/risk-indicator-inspection', body)
}

export async function deleteRiskInspection(id: number) {
  return apiClientV2.delete<Envelope>(`/risk-indicator-inspection/${id}`)
}

export async function startRiskInspection(id: number) {
  return apiClientV2.put<Envelope>(
    `/risk-indicator-inspection/update-status/${id}/in-progress`,
  )
}

export async function completeRiskInspection(id: number) {
  return apiClientV2.put<Envelope>(
    `/risk-indicator-inspection/update-status/${id}/completed`,
  )
}
