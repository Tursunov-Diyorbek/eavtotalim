import { useQuery } from '@tanstack/react-query'
import {
  fetchPracticalAttendanceGroups,
  fetchPracticalAttendanceStudents,
  queryKeys,
} from '@/api'
import { useAuth } from '@/features/auth'

export function usePracticalAttendanceGroupsQuery(filters: {
  page: number
  showCount: number
  groupSearch: string
  organizationSearch: string
  eduStatus: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.practicalAttendance.groups(filters),
    queryFn: () => fetchPracticalAttendanceGroups(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function usePracticalAttendanceStudentsQuery(filters: {
  groupId: string
  page: number
  showCount: number
  search: string
  month: number
  year: number
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.practicalAttendance.students(filters),
    queryFn: () => fetchPracticalAttendanceStudents(filters),
    enabled: isAuthenticated && Boolean(filters.groupId),
    placeholderData: (prev) => prev,
  })
}
