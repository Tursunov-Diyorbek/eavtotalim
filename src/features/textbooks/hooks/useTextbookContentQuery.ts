import { useQuery } from '@tanstack/react-query'
import { fetchTextbookContent, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useTextbookContentQuery(topicId: string | undefined) {
  const { isAuthenticated } = useAuth()
  const id = topicId ?? ''

  return useQuery({
    queryKey: queryKeys.textbooks.content(id),
    queryFn: () => fetchTextbookContent(id),
    enabled: isAuthenticated && Boolean(id),
  })
}
