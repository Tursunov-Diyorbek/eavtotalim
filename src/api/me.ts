import { apiClientV2 } from './client'
import { getAccessToken } from '@/lib/authStorage'
import { dedupeAsync } from '@/lib/dedupeAsync'
import type { MeData } from '@/types'
import type { ApiEnvelope } from './auth'

const meInflight = new Map<string, Promise<MeData>>()

async function fetchMeRaw(): Promise<MeData> {
  // Token faqat Authorization header orqali — querydagi eski token
  // refreshdan keyin 401 qaytarib, login ga tashlab yubormasin.
  const res = await apiClientV2.get<ApiEnvelope<MeData>>('/auth/me')
  return res.data
}

/** Bir xil token uchun parallel /me so‘rovlarini bitta qiladi. */
export function fetchMe(token?: string): Promise<MeData> {
  const key = token ?? getAccessToken() ?? 'anon'
  return dedupeAsync(`me:${key}`, meInflight, fetchMeRaw)
}
