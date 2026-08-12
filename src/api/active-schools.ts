import { apiClientV2 } from './client'
import type {
  ActiveSchoolItem,
  ActiveSchoolsPage,
  ActiveSchoolsSearchParams,
} from '@/types'

/** Faol avtomaktablar — GET /general/licensed-organizations */
export async function fetchActiveSchools(
  params: ActiveSchoolsSearchParams = {},
): Promise<ActiveSchoolsPage> {
  const page = Math.max(1, params.page ?? 1)
  const showCount = Math.max(1, params.show_count ?? 10)

  const sp = new URLSearchParams()
  sp.set('page', String(page))
  sp.set('show_count', String(showCount))
  if (params.name) sp.set('name', params.name)
  if (params.inn) sp.set('inn', params.inn)

  const res = await apiClientV2.get<{
    status?: number | boolean
    response_code?: number
    success?: boolean
    data?:
      | ActiveSchoolItem[]
      | {
          data?: ActiveSchoolItem[]
          total_items?: number
          total?: number
          current_page?: number
          last_page?: number
          per_page?: number
        }
    message?: string
  }>(`/general/licensed-organizations?${sp.toString()}`)

  if (res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Active schools unavailable')
  }

  const payload = res.data
  if (Array.isArray(payload)) {
    return {
      data: payload,
      total_items: payload.length,
      current_page: page,
      last_page: 1,
      per_page: showCount,
    }
  }

  if (payload && typeof payload === 'object') {
    const list = Array.isArray(payload.data) ? payload.data : []
    const total = payload.total_items ?? payload.total ?? list.length
    return {
      data: list,
      total_items: total,
      current_page: payload.current_page ?? page,
      last_page:
        payload.last_page ??
        Math.max(1, Math.ceil(total / showCount) || 1),
      per_page: payload.per_page ?? showCount,
    }
  }

  return {
    data: [],
    total_items: 0,
    current_page: page,
    last_page: 1,
    per_page: showCount,
  }
}
