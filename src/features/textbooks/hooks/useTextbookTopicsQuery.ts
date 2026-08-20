import { useQuery } from '@tanstack/react-query'
import {
  fetchTextbookTopics,
  queryKeys,
  type FetchTextbookTopicsArgs,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useTextbookTopicsQuery(
  args: FetchTextbookTopicsArgs,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.textbooks.topics(args),
    queryFn: () => fetchTextbookTopics(args),
    enabled: isAuthenticated && enabled && Boolean(args.eduTypeLessonId),
    placeholderData: (prev) => prev,
  })
}
