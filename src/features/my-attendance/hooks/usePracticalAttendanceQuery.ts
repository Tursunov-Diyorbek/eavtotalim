import { useQuery } from '@tanstack/react-query'
import { fetchPracticalAttendance, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function usePracticalAttendanceQuery(enabled = true) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.myAttendance.practical(),
    queryFn: fetchPracticalAttendance,
    enabled: isAuthenticated && enabled,
  })
}
