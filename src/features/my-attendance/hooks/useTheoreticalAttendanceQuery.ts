import { useQuery } from '@tanstack/react-query'
import { fetchTheoreticalAttendance, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useTheoreticalAttendanceQuery(
  year: number,
  month: number,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.myAttendance.theoretical(year, month),
    queryFn: () => fetchTheoreticalAttendance(year, month),
    enabled: isAuthenticated && enabled,
  })
}
