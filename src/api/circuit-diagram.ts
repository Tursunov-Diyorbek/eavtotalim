import { apiClientV2 } from './client'
import type {
  AutodromeGuideDetail,
  AutodromeGuideListItem,
} from '@/types'

function asList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const obj = payload as { data?: unknown }
    if (Array.isArray(obj.data)) return obj.data as T[]
  }
  return []
}

/** i18n → API lang_id (eski front: uz=1, kr=2, ru=3) */
export function autodromeGuideLangId(lang: string): number {
  if (lang === 'ru') return 3
  if (lang === 'kiril' || lang === 'kr') return 2
  return 1
}

/**
 * Faol qo‘llanmalar — GET /autodrome-guides?status=1&lang_id=
 */
export async function fetchAutodromeGuides(
  lang: string,
  status = 1,
): Promise<AutodromeGuideListItem[]> {
  const langId = autodromeGuideLangId(lang)
  const sp = new URLSearchParams()
  sp.set('status', String(status))
  sp.set('lang_id', String(langId))

  const res = await apiClientV2.get<{
    status?: number
    success?: boolean
    data?: unknown
    message?: string
  }>(`/autodrome-guides?${sp.toString()}`)

  if (res.status === 0) {
    throw new Error(res.message || 'Autodrome guides unavailable')
  }

  return asList<AutodromeGuideListItem>(res.data)
}

/** Bitta qo‘llanma + items — GET /autodrome-guides/:id */
export async function fetchAutodromeGuideById(
  id: number | string,
): Promise<AutodromeGuideDetail | null> {
  const res = await apiClientV2.get<{
    status?: number
    data?: AutodromeGuideDetail | { data?: AutodromeGuideDetail }
    message?: string
  }>(`/autodrome-guides/${id}`)

  if (res.status === 0) {
    throw new Error(res.message || 'Autodrome guide unavailable')
  }

  const payload = res.data
  if (!payload) return null
  if (typeof payload === 'object' && 'items' in payload) {
    return payload as AutodromeGuideDetail
  }
  if (
    typeof payload === 'object' &&
    'data' in payload &&
    payload.data &&
    typeof payload.data === 'object'
  ) {
    return payload.data as AutodromeGuideDetail
  }
  if (typeof payload === 'object' && 'id' in payload) {
    return payload as AutodromeGuideDetail
  }
  return null
}
