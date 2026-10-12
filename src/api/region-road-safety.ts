import { apiClient, withAccessToken } from './client'
import type { RegionRoadSafetyOfficer } from '@/types/region-road-safety'

export type RegionRoadSafetyInput = {
  region_id: number
  last_name: string
  first_name: string
  middle_name: string
  username: string
  password: string
  status?: number | null
}

function rec(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function text(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function idOf(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

function assertSaved(res: Record<string, unknown>) {
  const status = res.status
  const code = Number(res.response_code)
  const ok =
    status === 1 ||
    status === '1' ||
    status === true ||
    code === 200 ||
    code === 201 ||
    res.success === true
  const failed = status === 0 || status === false || status === '0' || status === 2
  if (failed && !ok) {
    throw new Error(typeof res.message === 'string' ? res.message : 'Request failed')
  }
  if (!ok && failed) {
    throw new Error(typeof res.message === 'string' ? res.message : 'Request failed')
  }
}

function readList(res: Record<string, unknown>): unknown[] {
  const code = Number(res.response_code)
  const success = res.success === true || code === 200 || code === 201
  const failed = res.status === 0 || res.status === false || res.status === '0'
  if (failed && !success && res.status !== 1 && res.status !== '1') {
    throw new Error(typeof res.message === 'string' ? res.message : 'Request failed')
  }
  if (Array.isArray(res.data)) return res.data
  const nested = rec(res.data).data
  return Array.isArray(nested) ? nested : []
}

function officer(value: unknown): RegionRoadSafetyOfficer {
  const row = rec(value)
  const user = rec(row.user)
  const region = rec(row.region)
  const status = row.status
  return {
    id: Number(row.id) || 0,
    userId: idOf(row.user_id) ?? idOf(user.id),
    lastName: text(row.last_name),
    firstName: text(row.first_name),
    middleName: text(row.middle_name),
    username: text(user.username) || text(row.username),
    regionId: idOf(region.id) ?? idOf(row.region_id),
    regionName: text(region.name),
    status: status === 1 || status === '1' ? 1 : 0,
  }
}

export async function fetchRegionRoadSafety() {
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken('/region-road-safety-index'),
  )
  return readList(res).map(officer)
}

export async function createRegionRoadSafety(input: RegionRoadSafetyInput) {
  const res = await apiClient.post<Record<string, unknown>>(
    withAccessToken('/save-region-road-safety-data'),
    input,
  )
  assertSaved(res)
  return res
}

export async function updateRegionRoadSafety(id: number, input: RegionRoadSafetyInput) {
  const res = await apiClient.post<Record<string, unknown>>(
    withAccessToken('/region-road-safety-update'),
    { ...input, id },
  )
  assertSaved(res)
  return res
}

export async function deleteRegionRoadSafety(id: number) {
  const res = await apiClient.post<Record<string, unknown>>(
    withAccessToken('/region-road-safety-delete'),
    { id },
  )
  assertSaved(res)
  return res
}
