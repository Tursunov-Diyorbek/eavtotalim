import { useQuery } from '@tanstack/react-query'
import { fetchAutodromeAttendance, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useAutodromeAttendanceQuery(enabled = true) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.myAttendance.autodrome(),
    queryFn: fetchAutodromeAttendance,
    enabled: isAuthenticated && enabled,
  })
}
