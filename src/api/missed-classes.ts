import { apiClientV2 } from './client'
import type {
  AbsenceReasonApplication,
  MissedClassAbsenceItem,
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

/** Qoldirilgan darslar — GET /my-profile/absences */
export async function fetchMissedAbsences(): Promise<MissedClassAbsenceItem[]> {
  const res = await apiClientV2.get<{
    status?: number | boolean
    data?: unknown
    message?: string
  }>('/my-profile/absences')

  if (res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Missed absences unavailable')
  }

  return asList<MissedClassAbsenceItem>(res.data)
}

/**
 * Qatnashmaganlik sabablari (справка)
 * GET /students/:professionId/absence-reason-applications
 */
export async function fetchAbsenceReasonApplications(
  professionId: number,
): Promise<AbsenceReasonApplication[]> {
  const res = await apiClientV2.get<{
    status?: number | boolean
    data?: unknown
    message?: string
  }>(`/students/${professionId}/absence-reason-applications`)

  if (res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Absence reasons unavailable')
  }

  return asList<AbsenceReasonApplication>(res.data)
}
