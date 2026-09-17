import { useQuery } from '@tanstack/react-query'
import { fetchThisWeekTimetable, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

/** Joriy hafta dars jadvali — `/this-week-timetable`. */
export function useThisWeekTimetableQuery(enabled = true) {
  const { isAuthenticated, user } = useAuth()
  const isStudent = user?.role === 5 || user?.roles?.includes('student')

  return useQuery({
    queryKey: queryKeys.schedule.thisWeek(),
    queryFn: fetchThisWeekTimetable,
    enabled: isAuthenticated && isStudent && enabled,
  })
}
