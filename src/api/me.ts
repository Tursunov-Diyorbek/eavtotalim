import { apiClientV2 } from './client'
import type { ApiEnvelope } from './auth'
import { dedupeAsync } from '@/lib/dedupeAsync'
import type { MeData } from '@/types'

const meInflight = new Map<string, Promise<MeData>>()

async function fetchMeRaw(token: string): Promise<MeData> {
  const res = await apiClientV2.get<ApiEnvelope<MeData>>(
    `/auth/me?token=${encodeURIComponent(token)}`,
  )
  return res.data
}

/** Bir xil token uchun parallel /me so‘rovlarini bitta qiladi. */
export function fetchMe(token: string): Promise<MeData> {
  return dedupeAsync(`me:${token}`, meInflight, () => fetchMeRaw(token))
}
