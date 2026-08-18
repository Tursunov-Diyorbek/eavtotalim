import { apiClientV2 } from './client'
import {
  assertOk,
  buildListQuery,
  unwrapEntity,
  unwrapPage,
  type FilterItem,
} from '@/lib/apiPage'
import type {
  CreateGroupPayload,
  GroupCounts,
  GroupItem,
  GroupsFilters,
  GroupsPageData,
  UpdateGroupPayload,
} from '@/types/groups'

const RELATIONS = [
  'organization',
  'grouped_students_count',
  'inspection_group_report',
]

/** GET v2 /groups/get-group-counts */
export async function fetchGroupCounts(): Promise<GroupCounts> {
  const res = await apiClientV2.get<{
    status?: number | boolean
    data?: GroupCounts
    message?: string
  }>('/groups/get-group-counts')
  assertOk(res)
  return res.data ?? {}
}

/** GET v2 /groups — direktor guruhlar ro‘yxati */
export async function fetchGroups(
  filters: GroupsFilters,
): Promise<GroupsPageData> {
  const filterItems: FilterItem[] = []

  if (filters.eduStatus !== 'all') {
    filterItems.push({
      fieldKey: 'edu_status',
      fieldOperator: '=',
      fieldValue: filters.eduStatus,
    })
  }
  if (filters.eduTypeId != null) {
    filterItems.push({
      fieldKey: 'edu_type_id',
      fieldOperator: '=',
      fieldValue: filters.eduTypeId,
    })
  }
  const name = filters.name?.trim()
  if (name) {
    filterItems.push({
      fieldKey: 'name_uz',
      fieldOperator: 'LIKE',
      fieldValue: name,
    })
  }
  if (filters.timetable !== undefined && filters.timetable !== '') {
    filterItems.push({
      fieldKey: 'timetable',
      fieldOperator: '=',
      fieldValue: filters.timetable,
    })
  }
  if (filters.weekDays && filters.weekDays.length > 0) {
    filterItems.push({
      fieldKey: 'week_days',
      fieldOperator: 'LIKE',
      fieldValue:
        filters.weekDays.length === 1
          ? filters.weekDays[0]
          : JSON.stringify(filters.weekDays.map(String)),
    })
  }
  if (filters.startTime) {
    filterItems.push({
      fieldKey: 'start_time',
      fieldOperator: '>=',
      fieldValue: filters.startTime.length === 5 ? `${filters.startTime}:00` : filters.startTime,
    })
  }
  if (filters.endTime) {
    filterItems.push({
      fieldKey: 'end_time',
      fieldOperator: '<=',
      fieldValue: filters.endTime.length === 5 ? `${filters.endTime}:00` : filters.endTime,
    })
  }

  const extra: Record<string, string> = { without_students: '1' }
  RELATIONS.forEach((rel, i) => {
    extra[`relations[${i}]`] = rel
  })

  const query = buildListQuery({
    page: filters.page,
    show_count: filters.showCount,
    filters: filterItems,
    sort: filters.sortKey
      ? [{ fieldKey: filters.sortKey, fieldValue: filters.sortOrder ?? 'ASC' }]
      : undefined,
    extra,
  })

  const res = await apiClientV2.get<Record<string, unknown>>(`/groups?${query}`)
  assertOk(res)
  const page = unwrapPage<GroupItem>(res, filters.page, filters.showCount)
  return {
    data: page.data,
    total_items: page.total_items,
    last_page: page.last_page,
  }
}

export async function createGroup(payload: CreateGroupPayload) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
    validator_errors?: unknown
  }>('/groups', payload)
  if (res.status === 2) {
    throw new Error(res.message || 'Validation error')
  }
  assertOk(res)
  return res
}

export async function deleteGroup(id: number) {
  const res = await apiClientV2.delete<{
    status?: number | boolean
    message?: string
  }>(`/groups/${id}`)
  assertOk(res)
  return res
}

/** GET v2 /groups/show/:id */
export async function fetchGroupShow(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(`/groups/show/${id}`)
  assertOk(res)
  return unwrapEntity<GroupItem>(res)
}

/** GET v2 /groups/show/:id/students */
export async function fetchGroupShowStudents(id: string, page = 1, showCount = 50) {
  const query = buildListQuery({ page, show_count: showCount })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/groups/show/${id}/students?${query}`,
  )
  assertOk(res)
  return unwrapPage<Record<string, unknown>>(res, page, showCount)
}

/** PUT v2 /groups/:id */
export async function updateGroup(id: string, payload: UpdateGroupPayload) {
  const res = await apiClientV2.put<{
    status?: number | boolean
    message?: string
    validator_errors?: unknown
  }>(`/groups/${id}`, payload)
  if (res.status === 2) {
    throw new Error(res.message || 'Validation error')
  }
  assertOk(res)
  return res
}
