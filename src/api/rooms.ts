import { apiClient, withAccessToken } from './client'
import { assertOk, unwrapEntity, unwrapPage } from '@/lib/apiPage'

export type RoomItem = {
  id: number
  name_uz?: string | null
  name?: string | null
  status?: number | string | null
  photo?: string | null
}

export async function fetchRooms() {
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken('/rooms'),
  )
  assertOk(res)
  const page = unwrapPage<RoomItem>(res, 1, 100)
  if (page.data.length) return page.data
  const entity = unwrapEntity<{ data?: RoomItem[] }>(res)
  return Array.isArray(entity.data) ? entity.data : []
}

export async function fetchRoom(id: string) {
  const rooms = await fetchRooms()
  const found = rooms.find((row) => String(row.id) === String(id))
  if (!found) throw new Error('Not found')
  return found
}

export async function createRoom(formData: FormData) {
  const res = await apiClient.postForm<{
    status?: number | boolean
    message?: string
  }>(withAccessToken('/rooms'), formData)
  assertOk(res)
  return res
}

export async function updateRoom(id: string, formData: FormData) {
  const res = await apiClient.putForm<{
    status?: number | boolean
    message?: string
  }>(withAccessToken(`/rooms/${id}`), formData)
  assertOk(res)
  return res
}

export async function deleteRoom(id: number) {
  const res = await apiClient.delete<{
    status?: number | boolean
    message?: string
  }>(withAccessToken(`/rooms/${id}`))
  assertOk(res)
  return res
}
