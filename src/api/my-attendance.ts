import { apiClientV2 } from './client'
import type {
  AutodromeAttendanceItem,
  AutodromeAttendancePayload,
  AutodromeAttendanceProgress,
  PracticalAttendanceItem,
  TheoreticalAttendanceByDate,
  TheoreticalAttendanceRecord,
} from '@/types'

function asList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const obj = payload as { data?: unknown; items?: unknown }
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.items)) return obj.items as T[]
  }
  return []
}

/**
 * Nazariy (kamera) davomat — GET /me/camera-attendances/organization
 * Javob: sana → yozuvlar map
 */
export async function fetchTheoreticalAttendance(
  year: number,
  month: number,
): Promise<TheoreticalAttendanceByDate> {
  const sp = new URLSearchParams()
  sp.set('limit', '100')
  sp.set('year', String(year))
  sp.set('month', String(month))

  const res = await apiClientV2.get<{
    status?: number
    data?: unknown
    message?: string
  }>(`/me/camera-attendances/organization?${sp.toString()}`)

  if (res.status === 0) {
    throw new Error(res.message || 'Attendance unavailable')
  }

  const payload = res.data
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {}
  }

  // Ba’zan { data: { "2026-01-01": [...] } }
  const mapCandidate =
    'data' in payload &&
    payload.data &&
    typeof payload.data === 'object' &&
    !Array.isArray(payload.data)
      ? (payload.data as Record<string, unknown>)
      : (payload as Record<string, unknown>)

  const result: TheoreticalAttendanceByDate = {}
  for (const [key, value] of Object.entries(mapCandidate)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue
    result[key] = Array.isArray(value)
      ? (value as TheoreticalAttendanceRecord[])
      : []
  }
  return result
}

/** Amaliy davomat — GET /student-practical-attendance/student-history */
export async function fetchPracticalAttendance(): Promise<
  PracticalAttendanceItem[]
> {
  const res = await apiClientV2.get<{
    status?: number
    data?: unknown
    message?: string
  }>('/student-practical-attendance/student-history')

  if (res.status === 0) {
    throw new Error(res.message || 'Practical attendance unavailable')
  }

  return asList<PracticalAttendanceItem>(res.data)
}

/** Avtodrom davomat — GET /my-profile/attendances/autodrome */
export async function fetchAutodromeAttendance(): Promise<{
  progress: AutodromeAttendanceProgress
  items: AutodromeAttendanceItem[]
}> {
  const res = await apiClientV2.get<{
    status?: number
    data?: AutodromeAttendancePayload | AutodromeAttendanceItem[]
    message?: string
  }>('/my-profile/attendances/autodrome')

  if (res.status === 0) {
    throw new Error(res.message || 'Autodrome attendance unavailable')
  }

  const payload = res.data
  if (Array.isArray(payload)) {
    return { progress: {}, items: payload }
  }
  if (payload && typeof payload === 'object') {
    return {
      progress: payload.progress ?? {},
      items: asList<AutodromeAttendanceItem>(payload),
    }
  }
  return { progress: {}, items: [] }
}
