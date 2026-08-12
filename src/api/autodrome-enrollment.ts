import { apiClientV2 } from './client'
import type { ApiEnvelope } from './auth'
import type { AutodromeEnrollmentData } from '@/types'

/** O‘quvchi — avtodrom kamerasiga yuborilish holati. */
export async function fetchAutodromeEnrollmentStatus(): Promise<AutodromeEnrollmentData> {
  const res = await apiClientV2.get<ApiEnvelope<AutodromeEnrollmentData>>(
    '/my-profile/autodrome-status',
  )
  return res.data
}
