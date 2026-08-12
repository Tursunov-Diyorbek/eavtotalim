import { useQuery } from '@tanstack/react-query'
import { fetchFinalExamIndex, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useFinalExamIndexQuery(enabled = true) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.finalExam.index(),
    queryFn: fetchFinalExamIndex,
    enabled: isAuthenticated && enabled,
  })
}
