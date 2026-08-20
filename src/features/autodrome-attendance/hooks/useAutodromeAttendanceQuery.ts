import { useQuery } from '@tanstack/react-query'
import {
  fetchAutodromeOrganizationGroups,
  fetchAutodromeStudentAttendances,
  queryKeys,
  type AutodromeGroupSortBy,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useAutodromeOrganizationGroupsQuery(filters: {
  page: number
  showCount: number
  groupName: string
  autodromeSearch: string
  sortBy: AutodromeGroupSortBy
  sortOrder: 'asc' | 'desc'
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeAttendance.groups(filters),
    queryFn: () => fetchAutodromeOrganizationGroups(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useAutodromeStudentAttendancesQuery(filters: {
  groupId: string
  month: number
  year: number
  search: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeAttendance.students(filters),
    queryFn: () => fetchAutodromeStudentAttendances(filters),
    enabled: isAuthenticated && Boolean(filters.groupId),
    placeholderData: (prev) => prev,
  })
}
