import { apiClient, apiClientV2 } from './client'
import type {
  PenaltyCategory,
  PenaltyDetail,
  PenaltyListItem,
} from '@/types'

function asList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const obj = payload as { data?: unknown }
    if (Array.isArray(obj.data)) return obj.data as T[]
  }
  return []
}

function toQuery(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    sp.set(key, String(value))
  }
  const q = sp.toString()
  return q ? `?${q}` : ''
}

/** Kategoriyalar — GET /v2/api/penalties/categories */
export async function fetchPenaltyCategories(): Promise<PenaltyCategory[]> {
  const res = await apiClientV2.get<{
    status?: number
    success?: boolean
    response_code?: number
    data?: PenaltyCategory[] | { data?: PenaltyCategory[] }
    message?: string
  }>('/penalties/categories')

  if (res.status === 0) {
    throw new Error(res.message || 'Penalty categories unavailable')
  }

  return asList<PenaltyCategory>(res.data)
}

/** Kategoriya jarimalari — GET /api/student/penalties/:id */
export async function fetchStudentPenalties(
  categoryId: number | string,
  langId: string,
): Promise<PenaltyListItem[]> {
  const res = await apiClient.get<{
    status?: number
    data?: PenaltyListItem[] | { data?: PenaltyListItem[] }
    message?: string
  }>(
    `/student/penalties/${categoryId}${toQuery({
      category_id: categoryId,
      lang_id: langId,
    })}`,
  )

  if (res.status === 0) {
    throw new Error(res.message || 'Penalties unavailable')
  }

  return asList<PenaltyListItem>(res.data)
}

/** Bitta jarima to‘liq — GET /api/student/penalties-show/:id */
export async function fetchStudentPenaltyShow(
  id: number | string,
  langId: string,
): Promise<PenaltyDetail | null> {
  const res = await apiClient.get<{
    status?: number
    data?: PenaltyDetail | { data?: PenaltyDetail }
    message?: string
  }>(
    `/student/penalties-show/${id}${toQuery({
      category_id: id,
      lang_id: langId,
    })}`,
  )

  const payload = res.data
  if (!payload) return null
  if (typeof payload === 'object' && 'penalties' in payload) {
    return payload as PenaltyDetail
  }
  if (
    typeof payload === 'object' &&
    'data' in payload &&
    payload.data &&
    typeof payload.data === 'object'
  ) {
    return payload.data as PenaltyDetail
  }
  if (typeof payload === 'object' && 'id' in payload) {
    return payload as PenaltyDetail
  }
  return null
}
