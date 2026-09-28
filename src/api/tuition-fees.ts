import { assertOk, unwrapPage } from '@/lib/apiPage'
import type { TuitionFeeItem } from '@/types/tuition-fees'
import { apiClientV2 } from './client'

/** GET /edu-type/prices/index */
export async function fetchTuitionFees(): Promise<TuitionFeeItem[]> {
  const res = await apiClientV2.get<Record<string, unknown>>(
    '/edu-type/prices/index',
  )
  assertOk(res)
  return unwrapPage<TuitionFeeItem>(res).data
}

export type StoreTuitionFeePayload = {
  edu_type_id: number
  price: string
  first_pay: string
  short_name?: string
}

/** POST /edu-type/prices/store-or-update */
export async function storeOrUpdateTuitionFee(payload: StoreTuitionFeePayload) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>('/edu-type/prices/store-or-update', payload)
  assertOk(res)
  return res
}
