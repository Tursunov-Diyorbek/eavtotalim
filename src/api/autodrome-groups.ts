import { apiClientV2 } from './client'
import {
  asNamedList,
  assertOk,
  buildListQuery,
  unwrapEntity,
  unwrapPage,
  type FilterItem,
} from '@/lib/apiPage'
import type {
  AutodromeGroupCounts,
  AutodromeOrgGroupRow,
  AutodromeOrgSchoolRow,
  GeneralEduType,
} from '@/types/autodrome-groups'

type Envelope = {
  status?: number | boolean | string
  response_code?: number | string
  success?: boolean
  message?: string
  data?: unknown
}

function groupsOk(res: Envelope) {
  const code = Number(res.response_code)
  if (code === 200 || code === 201 || res.success) return true
  return !(res.status === 0 || res.status === false || res.status === '0')
}

function isoDay(value?: string) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''
}

const GROUP_RELATIONS = ['organization', 'group', 'autodrome', 'edu_type']

export type AutodromeOrgGroupFilters = {
  page: number
  showCount: number
  organization?: string
  status?: string
  eduTypeId?: string
  startDate?: string
  endDate?: string
}

/** GET v2 `/autodrome-organization-groups/index-groups` */
export async function fetchAutodromeOrgGroups(filters: AutodromeOrgGroupFilters) {
  const items: FilterItem[] = []
  const org = filters.organization?.trim()
  if (org) {
    items.push({
      fieldKey: 'organization.inn',
      fieldOperator: 'LIKE',
      fieldValue: org,
    })
  }
  if (filters.status) {
    items.push({ fieldKey: 'status', fieldOperator: '=', fieldValue: filters.status })
  }
  if (filters.eduTypeId) {
    items.push({ fieldKey: 'edu_type_id', fieldOperator: '=', fieldValue: filters.eduTypeId })
  }
  const startDate = isoDay(filters.startDate)
  const endDate = isoDay(filters.endDate)
  if (startDate) {
    items.push({
      fieldKey: 'group.edu_starting_date',
      fieldOperator: '>=',
      fieldValue: startDate,
    })
  }
  if (endDate) {
    items.push({
      fieldKey: 'group.edu_ending_date',
      fieldOperator: '<=',
      fieldValue: endDate,
    })
  }
  const extra: Record<string, string> = {}
  GROUP_RELATIONS.forEach((name, index) => {
    extra[`relations[${index}]`] = name
  })
  const query = buildListQuery({
    page: filters.page,
    show_count: filters.showCount,
    filters: items,
    extra,
  })
  const res = await apiClientV2.get<Envelope>(
    `/autodrome-organization-groups/index-groups?${query}`,
  )
  if (!groupsOk(res)) {
    return {
      data: [],
      total_items: 0,
      current_page: filters.page,
      last_page: 1,
    }
  }
  return unwrapPage<AutodromeOrgGroupRow>(res, filters.page, filters.showCount)
}

/** GET v2 `/autodrome-organization-groups/index-counts` */
export async function fetchAutodromeOrgGroupCounts(): Promise<AutodromeGroupCounts> {
  const res = await apiClientV2.get<Envelope>('/autodrome-organization-groups/index-counts')
  assertOk(res)
  const data = unwrapEntity<{ countsActive?: number; countsEnded?: number }>(res)
  return {
    active: Number(data.countsActive ?? 0),
    ended: Number(data.countsEnded ?? 0),
  }
}

export type AutodromeOrgSchoolFilters = {
  page: number
  showCount: number
  inn?: string
}

/** GET v2 `/autodrome-organization-groups/index-by-organization` */
export async function fetchAutodromeOrgSchools(filters: AutodromeOrgSchoolFilters) {
  const items: FilterItem[] = []
  const inn = filters.inn?.trim()
  if (inn) {
    items.push({ fieldKey: 'organization.inn', fieldOperator: 'LIKE', fieldValue: inn })
  }
  const query = buildListQuery({
    page: filters.page,
    show_count: filters.showCount,
    filters: items,
    extra: { 'relations[0]': 'group' },
  })
  const res = await apiClientV2.get<Envelope>(
    `/autodrome-organization-groups/index-by-organization?${query}`,
  )
  assertOk(res)
  return unwrapPage<AutodromeOrgSchoolRow>(res, filters.page, filters.showCount)
}

/** GET v2 `/general/edu-types` */
export async function fetchGeneralEduTypes() {
  const res = await apiClientV2.get<Envelope>('/general/edu-types')
  assertOk(res)
  return asNamedList<GeneralEduType>(unwrapEntity(res) ?? res)
}
