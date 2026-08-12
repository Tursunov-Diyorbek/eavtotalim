import { apiClientV2 } from './client'
import type { ApiEnvelope } from './auth'
import type { ScheduleDayItem } from '@/types'

/** O‘quvchi dars jadvali — GET /my-time-table */
export async function fetchMyTimeTable(): Promise<ScheduleDayItem[]> {
  const res = await apiClientV2.get<ApiEnvelope<ScheduleDayItem[]>>(
    '/my-time-table',
  )
  return Array.isArray(res.data) ? res.data : []
}
