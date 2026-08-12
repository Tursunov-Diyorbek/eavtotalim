import { useQuery } from '@tanstack/react-query'
import { fetchAppealTypes, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useAppealTypesQuery(enabled = true) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.appeals.types(),
    queryFn: fetchAppealTypes,
    enabled: isAuthenticated && enabled,
  })
}
