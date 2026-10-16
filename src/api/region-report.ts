import { apiClient, withAccessToken } from './client'
import type {
  AreaReport,
  AreaReportRow,
  OrgReport,
  OrgReportRow,
  RegionReport,
  RegionReportEduType,
  RegionReportRow,
} from '@/types/region-report'

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

function num(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function listOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

/** Eski sahifa statusni tekshirmaydi. Status 0 bo‘lsa ham `data` bo‘lsa ko‘rsatiladi. */
function bodyOf(res: Record<string, unknown>) {
  const nested = rec(res.data)
  if (Array.isArray(nested.data) || Array.isArray(nested.edu_types)) return nested
  const failed = res.status === 0 || res.status === false || res.status === '0'
  const code = Number(res.response_code)
  const ok = code === 200 || code === 201 || res.success === true || res.status === 1 || res.status === '1'
  if (failed && !ok && !Array.isArray(res.data)) {
    throw new Error(typeof res.message === 'string' ? res.message : 'Request failed')
  }
  return res
}

function eduTypes(value: unknown): RegionReportEduType[] {
  return listOf(value).map((item) => {
    const row = rec(item)
    const shortName =
      text(row.short_name_uz) || text(row.short_name) || text(row.name) || text(row.code)
    return {
      id: idOf(row.id),
      shortName,
      code: text(row.code) || shortName,
    }
  })
}

function countAt(
  reports: unknown[],
  type: RegionReportEduType,
  index: number,
  field: string,
  matchId: boolean,
) {
  const found = matchId && type.id != null
    ? reports.find((item) => Number(rec(item).edu_type_id) === type.id)
    : reports[index]
  return num(rec(found)[field])
}

function regionRow(value: unknown, types: RegionReportEduType[]): RegionReportRow {
  const row = rec(value)
  const region = rec(row.region)
  const reports = listOf(row.report_by_edu_types)
  return {
    regionId: idOf(region.id),
    regionName: text(region.name),
    active: num(row.active_organizations_count),
    archive: num(row.archive_organizations_count),
    byEdu: types.map((type, index) =>
      countAt(reports, type, index, 'active_organizations_count', false),
    ),
  }
}

function areaRow(value: unknown, types: RegionReportEduType[]): AreaReportRow {
  const row = rec(value)
  const area = rec(row.area)
  const reports = listOf(row.report_by_edu_types)
  const groups = reports.reduce<number>(
    (sum, item) => sum + num(rec(item).active_groups_count),
    0,
  )
  const students = reports.reduce<number>(
    (sum, item) => sum + num(rec(item).active_students_count),
    0,
  )
  return {
    areaId: idOf(area.id),
    areaName: text(area.name),
    schools: num(row.active_organizations_count),
    schoolByEdu: types.map((type, index) =>
      countAt(reports, type, index, 'active_organizations_count', true),
    ),
    groups,
    students,
    studentByEdu: types.map((type, index) =>
      countAt(reports, type, index, 'active_students_count', true),
    ),
  }
}

function orgRow(value: unknown, types: RegionReportEduType[]): OrgReportRow {
  const row = rec(value)
  const organization = rec(row.organization)
  const reports = listOf(row.report_by_edu_types)
  const status = organization.status
  return {
    id: idOf(organization.id),
    name: text(organization.name),
    active: status === 1 || status === '1' || status === 2 || status === '2',
    byEdu: types.map((type, index) =>
      countAt(reports, type, index, 'active_students_count', false),
    ),
  }
}

/** GET v1 /inspection-region-reports */
export async function fetchRegionReport(): Promise<RegionReport> {
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken('/inspection-region-reports'),
  )
  const body = bodyOf(res)
  const types = eduTypes(body.edu_types)
  return {
    eduTypes: types,
    rows: listOf(body.data).map((row) => regionRow(row, types)),
  }
}

/** GET v1 /inspection-area-edu-type-reports?region_id= */
export async function fetchAreaReport(regionId: string): Promise<AreaReport> {
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken(
      `/inspection-area-edu-type-reports?region_id=${encodeURIComponent(regionId)}`,
    ),
  )
  const body = bodyOf(res)
  const region = rec(body.region)
  const types = eduTypes(body.edu_types)
  return {
    regionId: idOf(region.id) ?? idOf(regionId),
    regionName: text(region.name),
    eduTypes: types,
    rows: listOf(body.data).map((row) => areaRow(row, types)),
  }
}

/** POST v1 /inspection-area-edu-type-reports-update */
export async function refreshAreaReport(regionId: string) {
  const formData = new FormData()
  formData.append('region_id', regionId)
  const res = await apiClient.postForm<Record<string, unknown>>(
    withAccessToken('/inspection-area-edu-type-reports-update'),
    formData,
  )
  const status = res.status
  const code = Number(res.response_code)
  const ok =
    status === 1 ||
    status === '1' ||
    status === true ||
    code === 200 ||
    code === 201 ||
    res.success === true
  if (!ok) {
    throw new Error(typeof res.message === 'string' ? res.message : 'Request failed')
  }
}

/** GET v1 /inspection-organization-reports */
export async function fetchOrgReport(areaId: string, regionId: string): Promise<OrgReport> {
  const params = new URLSearchParams({
    area_id: areaId,
    region_id: regionId,
    type_report: 'active',
  })
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken(`/inspection-organization-reports?${params.toString()}`),
  )
  const body = bodyOf(res)
  const area = rec(body.area)
  const types = eduTypes(body.edu_types)
  return {
    areaName: text(area.name),
    eduTypes: types,
    rows: listOf(body.data).map((row) => orgRow(row, types)),
  }
}
