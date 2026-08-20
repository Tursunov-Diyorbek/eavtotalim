import { useQuery } from '@tanstack/react-query'
import {
  fetchInfoExamResults,
  fetchInfoExamResultShow,
  queryKeys,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useInfoExamResultsQuery(filters: {
  page: number
  showCount: number
  word: string
  status: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.infoExamResults.list(filters),
    queryFn: () => fetchInfoExamResults(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useInfoExamResultShowQuery(examId: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.infoExamResults.show(examId),
    queryFn: () => fetchInfoExamResultShow(examId),
    enabled: isAuthenticated && Boolean(examId),
  })
}
