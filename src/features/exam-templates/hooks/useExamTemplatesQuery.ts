import { useQuery } from '@tanstack/react-query'
import { fetchExamTemplates, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useExamTemplatesQuery(enabled = true) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.examTemplates.list(),
    queryFn: fetchExamTemplates,
    enabled: isAuthenticated && enabled,
  })
}
