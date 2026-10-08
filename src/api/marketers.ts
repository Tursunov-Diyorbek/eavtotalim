import { fetchDistricts, fetchRegions } from '@/api/students'
import { apiClient, withAccessToken } from '@/api/client'
import { assertOk, unwrapEntity, unwrapPage, type ApiPage } from '@/lib/apiPage'
import type { MarketerItem } from '@/types/marketers'

type SaveBody = {
  status?: number | string | boolean
  message?: string
  data?: MarketerItem
}

function formOf(fields: Record<string, string | number | null | undefined>) {
  const body = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (value == null) continue
    body.append(key, String(value))
  }
  return body
}

function assertSaved(res: SaveBody) {
  if (String(res.status) === '4' || String(res.status) === '2') {
    throw new Error(res.message || 'Validation error')
  }
  assertOk(res)
}

/** GET v1 /marketolog-index */
export async function fetchMarketers(
  page = 1,
  showCount = 10,
): Promise<ApiPage<MarketerItem>> {
  const sp = new URLSearchParams({
    page: String(page),
    show_count: String(showCount),
  })
  const res = await apiClient.get<unknown>(
    withAccessToken(`/marketolog-index?${sp.toString()}`),
  )
  assertOk(res as SaveBody)
  return unwrapPage<MarketerItem>(res, page, showCount)
}

/** GET v1 /marketolog-show */
export async function fetchMarketer(id: string): Promise<MarketerItem> {
  const res = await apiClient.get<SaveBody>(
    withAccessToken(`/marketolog-show?marketolog_id=${encodeURIComponent(id)}`),
  )
  assertOk(res)
  return unwrapEntity<MarketerItem>(res)
}

export type MarketerPayload = {
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

/** POST v1 /marketolog-store */
export async function createMarketer(payload: MarketerPayload) {
  const res = await apiClient.postForm<SaveBody>(
    withAccessToken('/marketolog-store'),
    formOf(payload),
  )
  assertSaved(res)
  return res
}

/** POST v1 /marketolog-update */
export async function updateMarketer(id: string, payload: MarketerPayload) {
  const res = await apiClient.postForm<SaveBody>(
    withAccessToken('/marketolog-update'),
    formOf({ ...payload, marketolog_id: id, moderator_id: id }),
  )
  assertSaved(res)
  return res
}

/** POST v1 /marketolog-delete — eski forma `moderator_id` yuboradi. */
export async function deleteMarketer(id: number) {
  const res = await apiClient.postForm<SaveBody>(
    withAccessToken('/marketolog-delete'),
    formOf({ moderator_id: id, marketolog_id: id }),
  )
  assertOk(res)
  return res
}

export function fetchMarketerRegions() {
  return fetchRegions()
}

export function fetchMarketerDistricts(regionId: string) {
  return fetchDistricts(regionId)
}
