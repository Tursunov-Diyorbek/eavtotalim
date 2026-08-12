import { apiClientV2 } from './client'
import type { ApiEnvelope } from './auth'
import type { MyProfileData } from '@/types'

/** O‘quvchi profili — guruh, toifa, … */
export async function fetchMyProfile(): Promise<MyProfileData> {
  const res = await apiClientV2.get<ApiEnvelope<MyProfileData>>('/my-profile')
  return res.data
}
