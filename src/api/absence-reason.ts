import { apiClientV2 } from './client'
import { storeStudentAbsenceReason } from './groups'
import { assertOk, buildListQuery, unwrapPage, type FilterItem } from '@/lib/apiPage'
import type {
  AbsenceReasonRow,
  StudentAbsenceByStudentRow,
} from '@/types/absence-reason'

export { storeStudentAbsenceReason }

const RELATIONS = [
  'organization',
  'student',
  'group',
  'organization.region',
  'organization.area',
] as const

export async function fetchAbsenceReasonIndexApplications(args: {
  page: number
  showCount: number
  groupId?: string
}) {
  const filters: FilterItem[] = []
  if (args.groupId) {
    filters.push({
      fieldKey: 'group_id',
      fieldOperator: 'LIKE',
      fieldValue: args.groupId,
    })
  }
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
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/absence-reason/index-applications?${query}`,
  )
  assertOk(res)
  return unwrapPage<AbsenceReasonRow>(res, args.page, args.showCount)
}

export async function fetchAbsenceReasonByStudent(args: {
  page: number
  showCount: number
  groupId?: string
  lastName?: string
  firstName?: string
  middleName?: string
}) {
  const filters: FilterItem[] = []
  const lastName = args.lastName?.trim()
  const firstName = args.firstName?.trim()
  const middleName = args.middleName?.trim()
  if (lastName) {
    filters.push({
      fieldKey: 'student.last_name',
      fieldOperator: 'LIKE',
      fieldValue: `%${lastName}%`,
    })
  }
  if (firstName) {
    filters.push({
      fieldKey: 'student.first_name',
      fieldOperator: 'LIKE',
      fieldValue: `%${firstName}%`,
    })
  }
  if (middleName) {
    filters.push({
      fieldKey: 'student.middle_name',
      fieldOperator: 'LIKE',
      fieldValue: `%${middleName}%`,
    })
  }
  if (args.groupId) {
    filters.push({
      fieldKey: 'group_id',
      fieldOperator: 'LIKE',
      fieldValue: args.groupId,
    })
  }
  const extra: Record<string, string> = {}
  ;[...RELATIONS, 'group.edu_type'].forEach((name, index) => {
    extra[`relations[${index}]`] = name
  })
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    filters,
    extra,
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/absence-reason/index-applications-by-student?${query}`,
  )
  assertOk(res)
  return unwrapPage<StudentAbsenceByStudentRow>(res, args.page, args.showCount)
}

export async function rollbackAbsenceReason(id: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>(`/absence-reason/rollback/${id}`)
  assertOk(res)
  return res
}
