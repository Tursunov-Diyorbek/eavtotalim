import { useQuery } from '@tanstack/react-query'
import { fetchRandomTestLatestResult, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useRandomTestLatestQuery(enabled = true) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.randomTests.latest(),
    queryFn: fetchRandomTestLatestResult,
    enabled: isAuthenticated && enabled,
  })
}
