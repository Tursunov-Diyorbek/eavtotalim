import { useQuery } from '@tanstack/react-query'
import { fetchStudentImageStats, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'
import { isDirectorRole } from '@/config'

export function useStudentImageStatsQuery() {
  const { isAuthenticated, user } = useAuth()

  return useQuery({
    queryKey: queryKeys.directorDashboard.imageStats(),
    queryFn: fetchStudentImageStats,
    enabled: isAuthenticated && isDirectorRole(user),
  })
}
