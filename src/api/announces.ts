import { apiClientV2 } from './client'
import type { AnnounceItem } from '@/types/announces'

function asList(payload: unknown): AnnounceItem[] {
  if (Array.isArray(payload)) return payload as AnnounceItem[]
  if (payload && typeof payload === 'object') {
    const obj = payload as { data?: unknown }
    if (Array.isArray(obj.data)) return obj.data as AnnounceItem[]
  }
  return []
}

/** Bildirishnomalar — GET /announces/my-announces */
export async function fetchMyAnnounces(): Promise<AnnounceItem[]> {
  const res = await apiClientV2.get<{
    status?: number | boolean
    data?: unknown
    message?: string
  }>('/announces/my-announces')
  return asList(res.data ?? res)
}

/** O‘qildi — GET /announces/read-announce/:id */
export async function markAnnounceRead(id: number): Promise<void> {
  await apiClientV2.get(`/announces/read-announce/${id}`)
}
