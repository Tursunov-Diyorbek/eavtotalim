import { useQuery } from '@tanstack/react-query'
import { fetchPenaltyCategories, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function usePenaltyCategoriesQuery(enabled = true) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.penalties.categories(),
    queryFn: fetchPenaltyCategories,
    enabled: isAuthenticated && enabled,
  })
}
