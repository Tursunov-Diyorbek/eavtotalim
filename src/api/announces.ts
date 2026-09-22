import { assertOk } from '@/lib/apiPage'
import { apiClientV2 } from './client'
import type { AnnounceItem } from '@/types/announces'

/**
 * Eski ModalNotification: `response.data.data.data`
 * (axios wrapper + paginated envelope). Bizda client JSON body qaytaradi.
 */
function asAnnounceList(payload: unknown): AnnounceItem[] {
  let cur: unknown = payload
  for (let depth = 0; depth < 5; depth++) {
    if (Array.isArray(cur)) return cur as AnnounceItem[]
    if (!cur || typeof cur !== 'object') break
    const next = (cur as { data?: unknown }).data
    if (next === undefined) break
    cur = next
  }
  return []
}

/** Bildirishnomalar — GET /announces/my-announces */
export async function fetchMyAnnounces(): Promise<AnnounceItem[]> {
  const res = await apiClientV2.get<{
    status?: number | boolean | string
    data?: unknown
    message?: string
  }>('/announces/my-announces')
  assertOk(res)
  return asAnnounceList(res)
}

/** O‘qildi — GET /announces/read-announce/:id */
export async function markAnnounceRead(id: number): Promise<void> {
  await apiClientV2.get(`/announces/read-announce/${id}`)
}
