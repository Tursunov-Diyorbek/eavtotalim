import { useQuery } from '@tanstack/react-query'
import { fetchSavedTopics, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useSavedTopicsQuery(enabled = true) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.lessons.savedTopics(),
    queryFn: fetchSavedTopics,
    enabled: isAuthenticated && enabled,
  })
}
