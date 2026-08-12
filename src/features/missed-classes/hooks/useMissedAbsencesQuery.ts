import { useQuery } from '@tanstack/react-query'
import { fetchMissedAbsences, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useMissedAbsencesQuery(enabled = true) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.missedClasses.absences(),
    queryFn: fetchMissedAbsences,
    enabled: isAuthenticated && enabled,
  })
}
