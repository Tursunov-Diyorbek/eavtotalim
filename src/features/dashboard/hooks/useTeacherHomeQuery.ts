import { useQuery } from '@tanstack/react-query'
import { fetchTeacherGroups, fetchTeacherSchedule, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useTeacherGroupsQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.teacherHome.groups(),
    queryFn: fetchTeacherGroups,
    enabled: isAuthenticated,
  })
}

export function useTeacherScheduleQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.teacherHome.schedule(),
    queryFn: fetchTeacherSchedule,
    enabled: isAuthenticated,
  })
}
