import { fetchDistricts, fetchRegions } from '@/api/students'
import { apiClient, withAccessToken } from '@/api/client'
import { assertOk, unwrapPage, type ApiPage } from '@/lib/apiPage'
import type { ModeratorFilters, ModeratorItem } from '@/types/moderators'

type SaveBody = {
  status?: number | string | boolean
  message?: string
  data?: ModeratorItem
}

function formOf(fields: Record<string, string | number | null | undefined>) {
  const body = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (value == null) continue
    body.append(key, String(value))
  }
  return body
}

function listPath(filters: ModeratorFilters) {
  const word = filters.word?.trim() ?? ''
  if (word) {
    return withAccessToken('/search-moderator')
  }
  const sp = new URLSearchParams({
    show_count: String(filters.showCount),
    page: String(filters.page),
  })
  return withAccessToken(`/filter-moderator?${sp}`)
}

function listBody(filters: ModeratorFilters) {
  const word = filters.word?.trim() ?? ''
  const status = filters.status && filters.status !== 'all' ? filters.status : 'all'
  if (word) {
    return formOf({
      word,
      show_count: filters.showCount,
      page: filters.page,
      category_id: 'all',
      region_id: 'all',
      area_id: 'all',
      status,
    })
  }
  return formOf({
    category_id: 'all',
    region_id: 'all',
    area_id: 'all',
    status,
  })
}

/** POST v1 /filter-moderator yoki /search-moderator */
export async function fetchModerators(filters: ModeratorFilters): Promise<ApiPage<ModeratorItem>> {
  const res = await apiClient.postForm<unknown>(listPath(filters), listBody(filters))
  assertOk(res as SaveBody)
  return unwrapPage<ModeratorItem>(res, filters.page, filters.showCount)
}

/** POST v1 /moderator-show */
export async function fetchModerator(id: string): Promise<ModeratorItem> {
  const res = await apiClient.postForm<SaveBody>(
    withAccessToken(`/moderator-show?moderator_id=${encodeURIComponent(id)}`),
    new FormData(),
  )
  assertOk(res)
  return res.data ?? {}
}

export type ModeratorPayload = {
  first_name: string
  last_name: string
  middle_name: string
  birthday: string
  gender: string
  username?: string
  address: string
  passport_seria: string
  passport_number: string
  phone: string
  region_id: string
  area_id: string
  email: string
  status: string
}

/** POST v1 /moderator-store */
export async function createModerator(payload: ModeratorPayload) {
  const res = await apiClient.postForm<SaveBody>(
    withAccessToken('/moderator-store'),
    formOf(payload),
  )
  if (String(res.status) === '4') {
    throw new Error(res.message || 'contract')
  }
  if (String(res.status) === '2') {
    throw new Error(res.message || 'Validation error')
  }
  assertOk(res)
  return res
}

/** POST v1 /moderator-update */
export async function updateModerator(id: string, payload: ModeratorPayload) {
  const res = await apiClient.postForm<SaveBody>(
    withAccessToken('/moderator-update'),
    formOf({ ...payload, moderator_id: id }),
  )
  if (String(res.status) === '4') {
    throw new Error(res.message || 'contract')
  }
  if (String(res.status) === '2') {
    throw new Error(res.message || 'Validation error')
  }
  assertOk(res)
  return res
}

/** POST v1 /moderator-delete */
export async function deleteModerator(id: number) {
  const res = await apiClient.postForm<SaveBody>(
    withAccessToken('/moderator-delete'),
    formOf({ moderator_id: id }),
  )
  assertOk(res)
  return res
}

export function fetchModeratorRegions() {
  return fetchRegions()
}

export function fetchModeratorDistricts(regionId: string) {
  return fetchDistricts(regionId)
}
