import { useQuery } from '@tanstack/react-query'
import {
  fetchAutodromeAttendanceChart,
  fetchAutodromeMyCameras,
  fetchAutodromeTodayGroups,
  fetchAutodromeTodayVisitors,
  fetchAutodromeWidgets,
  fetchPassedCameraStudents,
  queryKeys,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useAutodromeWidgetsQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeDashboard.widgets(),
    queryFn: fetchAutodromeWidgets,
    enabled: isAuthenticated,
  })
}

export function useAutodromeAttendanceChartQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeDashboard.attendance(),
    queryFn: fetchAutodromeAttendanceChart,
    enabled: isAuthenticated,
  })
}

export function usePassedCameraStudentsQuery(filters: {
  page: number
  showCount: number
  studentSearch: string
  groupSearch: string
  organizationSearch: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeDashboard.passedCamera(filters),
    queryFn: () => fetchPassedCameraStudents(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useAutodromeMyCamerasQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeDashboard.cameras(),
    queryFn: fetchAutodromeMyCameras,
    enabled: isAuthenticated,
  })
}

export function useAutodromeTodayGroupsQuery(
  filters: {
    page: number
    showCount: number
    groupSearch: string
    organizationSearch: string
    part: 1 | 2 | null
  },
  enabled: boolean,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeDashboard.todayGroups(filters),
    queryFn: () => fetchAutodromeTodayGroups(filters),
    enabled: isAuthenticated && enabled,
    placeholderData: (prev) => prev,
  })
}

export function useAutodromeTodayVisitorsQuery(
  filters: {
    page: number
    showCount: number
    studentSearch: string
    groupSearch: string
    organizationSearch: string
    part: 1 | 2 | null
  },
  enabled: boolean,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeDashboard.todayVisitors(filters),
    queryFn: () => fetchAutodromeTodayVisitors(filters),
    enabled: isAuthenticated && enabled,
    placeholderData: (prev) => prev,
  })
}
