import { apiClientV2 } from './client'
import { assertOk, asNamedList, unwrapEntity } from '@/lib/apiPage'

export type TrailerItem = {
  id: number
  number?: string | null
  status?: number | string | null
  mspd_status?: number | string | null
  image?: string | null
}

export async function fetchTrailers(): Promise<TrailerItem[]> {
  const res = await apiClientV2.get<unknown>('/car-trailer')
  assertOk(res as { status?: number | boolean; message?: string })
  return asNamedList<TrailerItem>(unwrapEntity(res) ?? res)
}

export async function fetchTrailer(id: string) {
  const list = await fetchTrailers()
  const found = list.find((row) => String(row.id) === String(id))
  if (!found) throw new Error('Not found')
  return found
}

export async function createTrailer(formData: FormData) {
  const res = await apiClientV2.postForm<{
    status?: number | boolean
    message?: string
  }>('/car-trailer', formData)
  assertOk(res)
  return res
}

export async function updateTrailer(id: string, formData: FormData) {
  const res = await apiClientV2.postForm<{
    status?: number | boolean
    message?: string
  }>(`/car-trailer/${id}`, formData)
  assertOk(res)
  return res
}

export async function deleteTrailer(id: number) {
  const res = await apiClientV2.delete<{
    status?: number | boolean
    message?: string
  }>(`/car-trailer/${id}`)
  assertOk(res)
  return res
}
