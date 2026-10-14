import { apiClient, apiClientV2, withAccessToken } from './client'
import { assertOk, buildListQuery, unwrapEntity, unwrapPage, type FilterItem } from '@/lib/apiPage'

export type RoomItem = {
  id: number
  name_uz?: string | null
  name?: string | null
  status?: number | string | null
  photo?: string | null
}

export type RegionalRoom = {
  id: number
  name?: string | null
  created_at?: string | null
  status?: number | string | null
  gai_status?: number | string | null
  organization?: { id?: number; name?: string | null; inn?: string | null } | null
  area?: { id?: number; name?: string | null } | null
}

export type RegionalRoomsFilters = {
  page: number
  showCount: number
  organizationId?: string
  regionId?: string
  areaId?: string
  gaiStatus?: string
}

/** GET v2 `/rooms/index` — viloyat bo‘yicha xonalar. */
export async function fetchRegionalRooms(filters: RegionalRoomsFilters) {
  const filterItems: FilterItem[] = []
  if (filters.areaId) {
    filterItems.push({ fieldKey: 'area_id', fieldOperator: '=', fieldValue: filters.areaId })
  }
  if (filters.organizationId) {
    filterItems.push({
      fieldKey: 'organization_id',
      fieldOperator: '=',
      fieldValue: filters.organizationId,
    })
  }
  if (filters.regionId) {
    filterItems.push({
      fieldKey: 'organization.region_id',
      fieldOperator: '=',
      fieldValue: filters.regionId,
    })
  }
  if (filters.gaiStatus !== undefined && filters.gaiStatus !== '') {
    filterItems.push({
      fieldKey: 'gai_status',
      fieldOperator: '=',
      fieldValue: filters.gaiStatus,
    })
  }
  const query = buildListQuery({
    page: filters.page,
    show_count: filters.showCount,
    filters: filterItems,
    extra: { 'relations[0]': 'organization', 'relations[1]': 'area' },
  })
  const res = await apiClientV2.get<Record<string, unknown>>(`/rooms/index?${query}`)
  assertOk(res)
  return unwrapPage<RegionalRoom>(res, filters.page, filters.showCount)
}

/** GET v2 `/rooms/enable-gai-status/:id` yoki `/rooms/disable-gai-status/:id`. */
export async function setRoomGaiStatus(roomId: number, active: boolean) {
  const path = active
    ? `/rooms/enable-gai-status/${roomId}`
    : `/rooms/disable-gai-status/${roomId}`
  const res = await apiClientV2.get<{
    status?: number | boolean | string
    message?: string
  }>(path)
  assertOk(res)
  return res
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
