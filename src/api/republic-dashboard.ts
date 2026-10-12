import { apiClientV2 } from './client'
import type { RegionDailyRow, SuperiorOrgRow } from '@/types/republic-dashboard'

function num(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function readList(res: Record<string, unknown>): unknown[] {
  const code = Number(res.response_code)
  const success = res.success === true || code === 200 || code === 201
  const failed = res.status === 0 || res.status === false || res.status === '0'
  if (failed && !success) {
    throw new Error(typeof res.message === 'string' ? res.message : 'Request failed')
  }
  const data = res.data
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const inner = (data as { data?: unknown }).data
    if (Array.isArray(inner)) return inner
  }
  return []
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

export async function fetchRegionDailyReport(date: string): Promise<RegionDailyRow[]> {
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/daily-rs-report/index-region?date=${encodeURIComponent(date)}`,
  )
  return readList(res).map((item) => {
    const row = asRecord(item)
    const region = asRecord(row.region)
    const lang = asRecord(region.lang)
    const percent = row.absent_percent
    return {
      region: {
        id: num(region.id),
        name: typeof region.name === 'string' ? region.name : null,
        lang: {
          uz: typeof lang.uz === 'string' ? lang.uz : null,
          ru: typeof lang.ru === 'string' ? lang.ru : null,
          kiril: typeof lang.kiril === 'string' ? lang.kiril : null,
          qq: typeof lang.qq === 'string' ? lang.qq : null,
          en: typeof lang.en === 'string' ? lang.en : null,
        },
      },
      all_organizations_count: num(row.all_organizations_count),
      active_organizations_count: num(row.active_organizations_count),
      active_groups_count: num(row.active_groups_count),
      today_has_lesson_groups_count: num(row.today_has_lesson_groups_count),
      active_students_count: num(row.active_students_count),
      today_has_lesson_students_count: num(row.today_has_lesson_students_count),
      absent_students_count: num(row.absent_students_count),
      absent_percent: percent == null || percent === '' ? null : num(percent),
    }
  })
}

export async function fetchSuperiorOrganizations(): Promise<SuperiorOrgRow[]> {
  const res = await apiClientV2.get<Record<string, unknown>>(
    '/organization/index-by-superior',
  )
  return readList(res).map((item) => {
    const row = asRecord(item)
    const org = asRecord(row.superior_organization)
    const modes = Array.isArray(row.operating_modes) ? row.operating_modes : []
    const countOf = (id: number) => {
      const found = modes.find((mode) => num(asRecord(mode).operating_mode_id) === id)
      return found ? num(asRecord(found).count) : 0
    }
    return {
      superior_organization_id: num(row.superior_organization_id),
      name: typeof org.name === 'string' ? org.name : '',
      total_count: num(row.total_count),
      active: countOf(1),
      reformed: countOf(2),
      suspended: countOf(3),
    }
  })
}
