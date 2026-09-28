import { useQuery } from '@tanstack/react-query'
import { fetchFaceControlWarningList, queryKeys, type FaceWarningView } from '@/api'
import { useAuth } from '@/features/auth'

export function useFaceControlWarningListQuery(view: FaceWarningView) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.faceControlWarnings.list(view),
    queryFn: () => fetchFaceControlWarningList(view),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}
