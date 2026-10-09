import { apiClientV2 } from './client'
import type { DtpRecord } from '@/types/annual-dtp'

/** GET v2 /dtp-records/index */
export async function fetchDtpRecords() {
  const res = await apiClientV2.get<unknown>('/dtp-records/index')
  const body = (res ?? {}) as Record<string, unknown>
  const nested = body.data
  if (Array.isArray(nested)) return nested as DtpRecord[]
  if (nested && typeof nested === 'object') {
    const inner = (nested as Record<string, unknown>).data
    if (Array.isArray(inner)) return inner as DtpRecord[]
  }
  if (Array.isArray(res)) return res as DtpRecord[]
  return []
}
