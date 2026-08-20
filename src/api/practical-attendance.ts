import { apiClientV2 } from './client'
import { assertOk, unwrapPage } from '@/lib/apiPage'
import type {
  PracticalAttendanceGroup,
  PracticalAttendanceStudent,
} from '@/types/practical-attendance'

export async function fetchPracticalAttendanceGroups(args: {
  page: number
  showCount: number
  groupSearch: string
  organizationSearch: string
  eduStatus: string
}) {
  const sp = new URLSearchParams()
  sp.set('page', String(args.page))
  sp.set('show_count', String(args.showCount))
  const group = args.groupSearch.trim()
  const org = args.organizationSearch.trim()
  if (group) sp.set('group_search', group)
  if (org) sp.set('organization_search', org)
  if (args.eduStatus !== '') sp.set('edu_status', args.eduStatus)
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/groups/practical-attendance?${sp}`,
  )
  assertOk(res)
  return unwrapPage<PracticalAttendanceGroup>(res, args.page, args.showCount)
}

export async function fetchPracticalAttendanceStudents(args: {
  groupId: string
  page: number
  showCount: number
  search: string
  month: number
  year: number
}) {
  const sp = new URLSearchParams()
  sp.set('page', String(args.page))
  sp.set('show_count', String(args.showCount))
  sp.set('month', String(args.month))
  sp.set('year', String(args.year))
  const search = args.search.trim()
  if (search) sp.set('student_search', search)
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/groups/show/${args.groupId}/practical-attendances?${sp}`,
  )
  assertOk(res)
  return unwrapPage<PracticalAttendanceStudent>(res, args.page, args.showCount)
}
