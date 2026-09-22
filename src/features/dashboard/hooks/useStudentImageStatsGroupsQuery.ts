import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  fetchStudentImageStatsGroupStudents,
  fetchStudentImageStatsGroups,
  queryKeys,
} from '@/api'
import { isDirectorRole } from '@/config'
import { useAuth } from '@/features/auth'
import type { StudentImageStudentStatus } from '@/types'

export function useStudentImageStatsGroupsQuery(enabled: boolean) {
  const { isAuthenticated, user } = useAuth()

  return useQuery({
    queryKey: queryKeys.directorDashboard.imageStatsGroups(),
    queryFn: fetchStudentImageStatsGroups,
    enabled: enabled && isAuthenticated && isDirectorRole(user),
  })
}

export function useStudentImageStatsGroupStudentsQuery(
  groupId: number | string | null,
  params: {
    page: number
    status: StudentImageStudentStatus
    search: string
  },
  enabled: boolean,
) {
  const { isAuthenticated, user } = useAuth()
  const search = params.search.trim()

  return useQuery({
    queryKey: queryKeys.directorDashboard.imageStatsGroupStudents(
      groupId ?? 0,
      params.page,
      params.status,
      search,
    ),
    queryFn: () =>
      fetchStudentImageStatsGroupStudents(groupId as number | string, {
        page: params.page,
        status: params.status,
        search,
      }),
    enabled:
      enabled &&
      groupId != null &&
      isAuthenticated &&
      isDirectorRole(user),
    placeholderData: keepPreviousData,
  })
}
