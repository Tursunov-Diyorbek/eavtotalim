import { apiClientV2 } from './client'
import { assertOk, buildListQuery, unwrapEntity, unwrapPage } from '@/lib/apiPage'
import type { AutodromeCameraItem } from '@/types/autodrome-camera'
import type {
  AutodromeAttendanceChart,
  AutodromeMyCameras,
  AutodromeTodayGroup,
  AutodromeTodayVisitor,
  AutodromeWidgets,
  PassedCameraStudent,
} from '@/types/autodrome-dashboard'

export async function fetchAutodromeWidgets() {
  const res = await apiClientV2.get<Record<string, unknown>>('/autodrome-stats/widgets')
  assertOk(res)
  return unwrapEntity<AutodromeWidgets>(res)
}

export async function fetchAutodromeAttendanceChart() {
  const res = await apiClientV2.get<Record<string, unknown>>('/autodrome-stats/attendance')
  assertOk(res)
  return unwrapEntity<AutodromeAttendanceChart>(res)
}

function partExtra(part: 1 | 2 | null) {
  if (part === 1) return { 'parts[0]': 1 }
  if (part === 2) return { 'parts[1]': 2 }
  return {}
}

export async function fetchAutodromeTodayGroups(args: {
  page: number
  showCount: number
  groupSearch?: string
  organizationSearch?: string
  part: 1 | 2 | null
}) {
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    extra: {
      group_search: args.groupSearch?.trim(),
      organization_search: args.organizationSearch?.trim(),
      ...partExtra(args.part),
    },
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/autodrome-stats/today-groups?${query}`,
  )
  assertOk(res)
  return unwrapPage<AutodromeTodayGroup>(res, args.page, args.showCount)
}

export async function fetchAutodromeTodayVisitors(args: {
  page: number
  showCount: number
  studentSearch?: string
  groupSearch?: string
  organizationSearch?: string
  part: 1 | 2 | null
}) {
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    extra: {
      student_search: args.studentSearch?.trim(),
      group_search: args.groupSearch?.trim(),
      organization_search: args.organizationSearch?.trim(),
      ...partExtra(args.part),
    },
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/autodrome-stats/today-visitors?${query}`,
  )
  assertOk(res)
  return unwrapPage<AutodromeTodayVisitor>(res, args.page, args.showCount)
}

export async function fetchPassedCameraStudents(args: {
  page: number
  showCount: number
  studentSearch?: string
  groupSearch?: string
  organizationSearch?: string
}) {
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    extra: {
      student_search: args.studentSearch?.trim(),
      group_search: args.groupSearch?.trim(),
      organization_search: args.organizationSearch?.trim(),
    },
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/autodrome-student-attendances/students-first-entry?${query}`,
  )
  assertOk(res)
  return unwrapPage<PassedCameraStudent>(res, args.page, args.showCount)
}

export async function fetchAutodromeMyCameras(): Promise<AutodromeMyCameras> {
  const query = buildListQuery({ show_count: 200 })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/autodrome-cameras/my?${query}`,
  )
  assertOk(res)
  const nested = res.data
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const payload = nested as Record<string, unknown>
    const list = Array.isArray(payload.data)
      ? (payload.data as AutodromeCameraItem[])
      : []
    return {
      cameras: list,
      syncedAt: typeof payload.synced_at === 'string' ? payload.synced_at : null,
    }
  }
  if (Array.isArray(nested)) {
    return { cameras: nested as AutodromeCameraItem[] }
  }
  return { cameras: [] }
}
