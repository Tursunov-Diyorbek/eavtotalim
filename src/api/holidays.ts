import { apiClient, withAccessToken } from './client'
import { assertOk, unwrapPage } from '@/lib/apiPage'

export type HolidayItem = {
  id: number
  comment?: string | null
  start_date?: string | null
  end_date?: string | null
}

export async function fetchHolidays() {
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken('/holidays-index'),
  )
  assertOk(res)
  return unwrapPage<HolidayItem>(res, 1, 100).data
}

export async function createHoliday(formData: FormData) {
  const res = await apiClient.postForm<{
    status?: number | boolean
    message?: string
    validator_errors?: unknown
  }>(withAccessToken('/holidays-store'), formData)
  if (res.status === 2) {
    throw new Error(res.message || 'Validation error')
  }
  assertOk(res)
  return res
}

export async function deleteHoliday(id: number) {
  const formData = new FormData()
  formData.append('holiday_id', String(id))
  const res = await apiClient.postForm<{
    status?: number | boolean
    message?: string
  }>(withAccessToken('/holidays-delete'), formData)
  assertOk(res)
  return res
}
