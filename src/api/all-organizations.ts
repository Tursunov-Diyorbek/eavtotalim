import { apiClientV2 } from './client'
import { buildListQuery, type FilterItem } from '@/lib/apiPage'
import type { InspectionOrgRow, InspectionOrganization } from '@/types/all-organizations'

export type AllOrganizationsArgs = {
  date: string
  page: number
  showCount: number
  inn?: string
  regionId?: string
  areaId?: string
}

export type AllOrganizationsResult = {
  data: InspectionOrgRow[]
  total_items: number
  current_page: number
  last_page: number
}

function num(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function text(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') return ''
  const raw = String(value).trim()
  if (!raw || raw === 'null' || raw === 'undefined') return ''
  return raw
}

function accept(res: Record<string, unknown>) {
  const code = Number(res.response_code)
  const success = res.success === true || code === 200 || code === 201
  const failed = res.status === 0 || res.status === false || res.status === '0'
  if (failed && !success) {
    throw new Error(typeof res.message === 'string' ? res.message : 'Request failed')
  }
}

function rowOf(value: unknown): InspectionOrgRow | null {
  const item = asRecord(value)
  const org = asRecord(item.organization)
  const id = num(org.id ?? item.id)
  if (!id) return null
  const status = item.status
  return {
    id,
    name: text(org.name ?? item.name),
    inn: text(org.inn ?? item.inn),
    groups: num(item.active_groups_count),
    students: num(item.active_students_count),
    region: text(asRecord(item.region).name),
    area: text(asRecord(item.area).name),
    status: status == null || status === '' ? null : num(status),
  }
}

/** Eski `DailyAttendanceReportByOrganizations` — `GET v2 /daily-rs-report/index-organization`. */
export async function fetchAllOrganizations(
  args: AllOrganizationsArgs,
): Promise<AllOrganizationsResult> {
  const filters: FilterItem[] = []
  if (args.regionId) {
    filters.push({
      fieldKey: 'organization.region_id',
      fieldOperator: '=',
      fieldValue: args.regionId,
    })
  }
  if (args.areaId) {
    filters.push({ fieldKey: 'area_id', fieldOperator: '=', fieldValue: args.areaId })
  }
  if (args.inn) {
    filters.push({ fieldKey: 'inn', fieldOperator: '=', fieldValue: args.inn })
  }
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    filters,
    extra: { date: args.date },
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/daily-rs-report/index-organization?${query}`,
  )
  accept(res)
  const box = asRecord(res.data)
  const raw = Array.isArray(box.data)
    ? box.data
    : Array.isArray(res.data)
      ? res.data
      : []
  const data = raw.map(rowOf).filter((row): row is InspectionOrgRow => row != null)
  const total = num(box.total_items ?? res.total_items ?? data.length)
  const last = Math.max(1, Math.ceil(total / args.showCount) || 1)
  return {
    data,
    total_items: total,
    current_page: args.page,
    last_page: last,
  }
}

function pickOrg(res: Record<string, unknown>): Record<string, unknown> {
  const data = asRecord(res.data)
  if (data.name || data.inn || data.director || data.report) return data
  const nested = asRecord(data.data)
  if (nested.name || nested.inn || nested.director || nested.report) return nested
  if (res.name || res.inn) return res
  return data
}

/** Eski `OrganizationAPI.getOrganization` — `GET v2 /organization/:id`. */
export async function fetchAllOrganization(id: string): Promise<InspectionOrganization> {
  const res = await apiClientV2.get<Record<string, unknown>>(`/organization/${id}`)
  accept(res)
  const org = pickOrg(res)
  if (!org.name && !org.inn && !org.id) {
    throw new Error('Request failed')
  }
  return org as InspectionOrganization
}
