import { useQuery } from '@tanstack/react-query'
import { fetchSavedExamTemplates, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useSavedExamTemplatesQuery(enabled = true) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.savedTests.list(),
    queryFn: fetchSavedExamTemplates,
    enabled: isAuthenticated && enabled,
  })
}
