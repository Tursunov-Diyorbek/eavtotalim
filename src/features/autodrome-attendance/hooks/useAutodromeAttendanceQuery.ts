import { useQuery } from '@tanstack/react-query'
import {
  fetchAutodromeOrganizationGroups,
  fetchAutodromeResGaiReport,
  fetchAutodromeStudentAttendances,
  queryKeys,
  type AutodromeGroupSortBy,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useAutodromeOrganizationGroupsQuery(filters: {
  page: number
  showCount: number
  groupName: string
  autodromeInn: string
  groupStatus: string
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

export function useAutodromeResGaiQuery(filters: {
  page: number
  showCount: number
  studentSearch: string
  organizationSearch: string
  groupStatus: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeAttendance.resGai(filters),
    queryFn: () => fetchAutodromeResGaiReport(filters),
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
