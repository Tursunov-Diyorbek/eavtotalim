import { fetchDistricts, fetchRegions } from '@/api/students'
import { apiClient, withAccessToken } from '@/api/client'
import { assertOk, unwrapPage, type ApiPage } from '@/lib/apiPage'
import type { AccountantItem } from '@/types/accountants'

type SaveBody = {
  status?: number | string | boolean
  message?: string
  data?: AccountantItem
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

/** GET v1 /accountant */
export async function fetchAccountants(word = ''): Promise<ApiPage<AccountantItem>> {
  const sp = new URLSearchParams()
  if (word.trim()) sp.set('word', word.trim())
  const query = sp.toString()
  const res = await apiClient.get<unknown>(
    withAccessToken(query ? `/accountant?${query}` : '/accountant'),
  )
  assertOk(res as SaveBody)
  return unwrapPage<AccountantItem>(res)
}

/** POST v1 /accountant-show */
export async function fetchAccountant(id: string): Promise<AccountantItem> {
  const res = await apiClient.postForm<SaveBody>(
    withAccessToken(`/accountant-show?accountant_id=${encodeURIComponent(id)}`),
    new FormData(),
  )
  assertOk(res)
  return res.data ?? {}
}

export type AccountantPayload = {
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

/** POST v1 /accountant-store */
export async function createAccountant(payload: AccountantPayload) {
  const res = await apiClient.postForm<SaveBody>(
    withAccessToken('/accountant-store'),
    formOf(payload),
  )
  assertSaved(res)
  return res
}

/** POST v1 /accountant-update */
export async function updateAccountant(id: string, payload: AccountantPayload) {
  const res = await apiClient.postForm<SaveBody>(
    withAccessToken('/accountant-update'),
    formOf({ ...payload, accountant_id: id }),
  )
  assertSaved(res)
  return res
}

/** POST v1 /accountant-delete */
export async function deleteAccountant(id: number) {
  const res = await apiClient.postForm<SaveBody>(
    withAccessToken('/accountant-delete'),
    formOf({ accountant_id: id }),
  )
  assertOk(res)
  return res
}

export function fetchAccountantRegions() {
  return fetchRegions()
}

export function fetchAccountantDistricts(regionId: string) {
  return fetchDistricts(regionId)
}
