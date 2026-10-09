import { useQuery } from '@tanstack/react-query'
import { fetchMyGaiRating, queryKeys } from '@/api'
import { isDirectorRole } from '@/config'
import { useAuth } from '@/features/auth'

export function useGaiRatingQuery(year: number, period: number, enabled = true) {
  const { isAuthenticated, user } = useAuth()
  return useQuery({
    queryKey: queryKeys.directorDashboard.gaiRating(year, period),
    queryFn: () => fetchMyGaiRating(year, period),
    enabled: enabled && isAuthenticated && isDirectorRole(user),
  })
}
