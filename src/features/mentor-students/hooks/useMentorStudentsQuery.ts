import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  fetchActiveMentors,
  fetchMentorStats,
  fetchMentorStudentGroups,
  fetchMentorStudents,
  queryKeys,
} from '@/api'
import { useAuth } from '@/features/auth'
import type { MentorStudentsArgs } from '@/api/mentor-students'

export function useMentorStatsQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.mentorStudents.stats(),
    queryFn: fetchMentorStats,
    enabled: isAuthenticated,
  })
}

export function useMentorStudentsQuery(args: MentorStudentsArgs) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.mentorStudents.list(args),
    queryFn: () => fetchMentorStudents(args),
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
  })
}

export function useActiveMentorsQuery(enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.mentorStudents.active(),
    queryFn: fetchActiveMentors,
    enabled: isAuthenticated && enabled,
    staleTime: 60_000,
  })
}

export function useMentorStudentGroupsQuery(enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.mentorStudents.groups(),
    queryFn: fetchMentorStudentGroups,
    enabled: isAuthenticated && enabled,
  })
}
