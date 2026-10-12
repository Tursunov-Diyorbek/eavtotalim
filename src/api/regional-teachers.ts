import { apiClientV2 } from './client'
import { buildListQuery, type FilterItem } from '@/lib/apiPage'
import type { RegionalTeacher } from '@/types/regional-teachers'

export type RegionalTeachersArgs = {
  page: number
  showCount: number
  lastName?: string
  firstName?: string
  middleName?: string
  jshir?: string
  inn?: string
  regionId?: string
  areaId?: string
  gaiStatus?: string
}

export type RegionalTeachersResult = {
  data: RegionalTeacher[]
  total_items: number
  current_page: number
  last_page: number
}

const RELATIONS = ['area', 'region', 'organization', 'edu_types', 'organization.area']

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
  const success = res.success === true || code === 200 || code === 201 || code === 202
  const failed = res.status === 0 || res.status === false || res.status === '0'
  if (failed && !success) {
    throw new Error(typeof res.message === 'string' ? res.message : 'Request failed')
  }
}

function like(items: FilterItem[], fieldKey: string, value?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return
  items.push({ fieldKey, fieldOperator: 'LIKE', fieldValue: `%${trimmed}%` })
}

function eq(items: FilterItem[], fieldKey: string, value?: string) {
  if (value == null || value === '') return
  items.push({ fieldKey, fieldOperator: '=', fieldValue: value })
}

function rowOf(value: unknown): RegionalTeacher | null {
  const item = asRecord(value)
  const id = num(item.id)
  if (!id) return null
  const org = asRecord(item.organization)
  const region = asRecord(item.region)
  const area = asRecord(item.area)
  const orgArea = asRecord(org.area)
  const edu = Array.isArray(item.edu_types) ? item.edu_types : []
  return {
    id,
    lastName: text(item.last_name),
    firstName: text(item.first_name),
    middleName: text(item.middle_name),
    phone: text(item.phone1),
    jshir: text(item.passport_jshir),
    passportSeria: text(item.passport_seria),
    passportNumber: text(item.passport_number),
    eduTypes: edu
      .map((entry) => text(asRecord(entry).character_name || asRecord(entry).short_name))
      .filter(Boolean),
    organizationId: num(org.id),
    organizationName: text(org.name),
    inn: text(org.inn),
    region: text(region.name),
    area: text(area.name || orgArea.name),
    gaiStatus: item.gai_status == null || item.gai_status === '' ? null : num(item.gai_status),
  }
}

/** Eski RegionalTeachers — `GET v2 /teachers`. */
export async function fetchRegionalTeachers(
  args: RegionalTeachersArgs,
): Promise<RegionalTeachersResult> {
  const filters: FilterItem[] = []
  like(filters, 'last_name', args.lastName)
  like(filters, 'first_name', args.firstName)
  like(filters, 'middle_name', args.middleName)
  like(filters, 'passport_jshir', args.jshir)
  eq(filters, 'organization.inn', args.inn)
  eq(filters, 'organization.region_id', args.regionId)
  eq(filters, 'area_id', args.areaId)
  eq(filters, 'gai_status', args.gaiStatus)
  const extra: Record<string, string> = {}
  RELATIONS.forEach((name, index) => {
    extra[`relations[${index}]`] = name
  })
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    filters,
    extra,
  })
  const res = await apiClientV2.get<Record<string, unknown>>(`/teachers?${query}`)
  accept(res)
  const box = asRecord(res.data)
  const raw = Array.isArray(box.data) ? box.data : Array.isArray(res.data) ? res.data : []
  const data = raw.map(rowOf).filter((row): row is RegionalTeacher => row != null)
  const total = num(box.total_items ?? res.total_items ?? data.length)
  const last = Math.max(1, Math.ceil(total / args.showCount) || 1)
  return { data, total_items: total, current_page: args.page, last_page: last }
}

/** `GET v2 /teachers/enable-gai-status/:id` yoki `disable-gai-status`. */
export async function setRegionalTeacherGaiStatus(id: number, active: boolean) {
  const path = active
    ? `/teachers/enable-gai-status/${id}`
    : `/teachers/disable-gai-status/${id}`
  const res = await apiClientV2.get<Record<string, unknown>>(path)
  const status = res.status
  const code = Number(res.response_code)
  const ok =
    status === 1 || status === '1' || status === true || code === 200 || code === 201
  const failed = status === 0 || status === false || status === '0' || status === 2
  if (!ok || (failed && code !== 200 && code !== 201)) {
    throw new Error(typeof res.message === 'string' ? res.message : 'Request failed')
  }
}
