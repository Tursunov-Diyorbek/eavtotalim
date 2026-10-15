import { apiClientV2 } from './client'
import { unwrapPage } from '@/lib/apiPage'
import type { InspectorPerson, RiskInspectorRow } from '@/types/risk-inspector'

type Envelope = {
  status?: number | boolean | string
  message?: string
  data?: unknown
}

export type RiskInspectorFilters = {
  fullName: string
  phone: string
  passport: string
}

function inspectorFilters(args: RiskInspectorFilters) {
  const filters: { fieldKey: string; fieldOperator: string; fieldValue: string }[] = []
  const fullName = args.fullName.trim()
  const phone = args.phone.trim()
  const passport = args.passport.trim()
  if (fullName) {
    filters.push({ fieldKey: 'full_name', fieldOperator: 'LIKE', fieldValue: fullName })
  }
  if (phone) {
    filters.push({ fieldKey: 'phone', fieldOperator: 'LIKE', fieldValue: phone })
  }
  if (passport) {
    filters.push({ fieldKey: 'passport.serial', fieldOperator: 'LIKE', fieldValue: passport })
  }
  return filters
}

/**
 * Eski `indexRiskIndicatorInspectors`.
 * Filterlar `filters` queryda JSON satr (`JSON.stringify`), alohida `filters[i]` emas.
 */
export async function fetchRiskInspectors(
  args: RiskInspectorFilters & { page: number; showCount: number },
) {
  const sp = new URLSearchParams()
  sp.set('page', String(args.page))
  sp.set('show_count', String(args.showCount))
  sp.set('filters', JSON.stringify(inspectorFilters(args)))
  const res = await apiClientV2.get<Envelope & Record<string, unknown>>(
    `/risk-indicator-inspectors?${sp}`,
  )
  if (res.status === 0 || res.status === false || res.status === '0') {
    throw new Error(res.message || 'Request failed')
  }
  const page = unwrapPage<RiskInspectorRow>(res, args.page, args.showCount)
  const nested = res.data
  const box =
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : res
  const totalPages = Number(box.total_pages)
  if (totalPages > 0) return { ...page, last_page: totalPages }
  return page
}

export async function searchInspectorPerson(body: {
  passport_seria: string
  passport_number: string
  birthday: string
}) {
  return apiClientV2.post<Envelope & { data?: InspectorPerson | null }>(
    '/eavtotalim-mspd/person-info',
    body,
  )
}

export async function createRiskInspector(person: InspectorPerson) {
  return apiClientV2.post<Envelope>('/risk-indicator-inspectors', person)
}

export async function deleteRiskInspector(id: number) {
  return apiClientV2.delete<Envelope>(`/risk-indicator-inspectors/${id}`)
}
