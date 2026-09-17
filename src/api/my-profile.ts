import { apiClientV2 } from './client'
import type { ApiEnvelope } from './auth'
import type {
  MyProfileData,
  MyProfilePaymentsData,
  ScheduleDayItem,
} from '@/types'

/** O‘quvchi profili — guruh, toifa, tashkilot, davomat (eski StudentProfileV2) */
export async function fetchMyProfile(): Promise<MyProfileData> {
  const res = await apiClientV2.get<ApiEnvelope<MyProfileData>>('/my-profile')
  return res.data ?? {}
}

/** To‘lovlar — GET /my-profile/payments */
export async function fetchMyProfilePayments(): Promise<MyProfilePaymentsData> {
  const res = await apiClientV2.get<ApiEnvelope<MyProfilePaymentsData>>(
    '/my-profile/payments',
  )
  return res.data ?? {}
}

/** Joriy hafta jadvali — GET /this-week-timetable */
export async function fetchThisWeekTimetable(): Promise<ScheduleDayItem[]> {
  const res = await apiClientV2.get<ApiEnvelope<ScheduleDayItem[]>>(
    '/this-week-timetable',
  )
  return Array.isArray(res.data) ? res.data : []
}
