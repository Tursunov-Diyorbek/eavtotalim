import { apiClientV2 } from './client'
import type { RoadSignType, RoadSignsPage } from '@/types'

function asTypeList(payload: unknown): RoadSignType[] {
  if (Array.isArray(payload)) return payload as RoadSignType[]
  if (payload && typeof payload === 'object') {
    const obj = payload as { data?: unknown }
    if (Array.isArray(obj.data)) return obj.data as RoadSignType[]
  }
  return []
}

/** Belgi turlari — GET /road-sign/types/index */
export async function fetchRoadSignTypes(): Promise<RoadSignType[]> {
  const res = await apiClientV2.get<{
    status?: number
    data?: { data?: RoadSignType[] } | RoadSignType[]
    message?: string
  }>('/road-sign/types/index')

  if (res.status === 0) {
    throw new Error(res.message || 'Road sign types unavailable')
  }

  return asTypeList(res.data)
}

function roadSignsQuery(typeId: number | string, page: number) {
  const sp = new URLSearchParams()
  sp.set('show_count', '12')
  sp.set('page', String(page))
  sp.set('filters[0][fieldKey]', 'road_sign_type_id')
  sp.set('filters[0][fieldOperator]', '=')
  sp.set('filters[0][fieldValue]', String(typeId))
  // Ba’zi backendlarda content relations orqali keladi
  sp.append('relations[]', 'content')
  return `?${sp.toString()}`
}

/** Turdagi belgilar — GET /road-sign/index */
export async function fetchRoadSignsByType(
  typeId: number | string,
  page = 1,
): Promise<RoadSignsPage> {
  const res = await apiClientV2.get<{
    status?: number
    data?: {
      data?: RoadSignItemLike[]
      total_items?: number
      current_page?: number
      last_page?: number
    }
  }>(`/road-sign/index${roadSignsQuery(typeId, page)}`)

  const pageData = res.data
  if (!pageData || typeof pageData !== 'object') {
    return { data: [], total_items: 0 }
  }

  return {
    data: Array.isArray(pageData.data) ? pageData.data : [],
    total_items: pageData.total_items ?? 0,
    current_page: pageData.current_page,
    last_page: pageData.last_page,
  }
}

/** Bitta belgi (to‘liq content) — bir nechta endpoint uriniladi */
export async function fetchRoadSignById(
  id: number | string,
): Promise<RoadSignItemLike | null> {
  const paths = [
    `/road-sign/show/${id}`,
    `/road-sign/get/${id}`,
    `/road-sign/${id}`,
  ]

  for (const path of paths) {
    try {
      const res = await apiClientV2.get<{
        status?: number
        data?: RoadSignItemLike | { data?: RoadSignItemLike }
      }>(path)
      const payload = res.data
      if (!payload) continue
      if (typeof payload === 'object' && 'id' in payload) {
        return payload as RoadSignItemLike
      }
      if (
        typeof payload === 'object' &&
        'data' in payload &&
        payload.data &&
        typeof payload.data === 'object' &&
        'id' in payload.data
      ) {
        return payload.data as RoadSignItemLike
      }
    } catch {
      /* next */
    }
  }

  return null
}

type RoadSignItemLike = RoadSignsPage['data'][number]

