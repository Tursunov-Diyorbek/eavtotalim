import { useQuery } from '@tanstack/react-query'
import { fetchDirectorEditMyData, queryKeys } from '@/api'
import { isDirectorRole } from '@/config'
import { useAuth } from '@/features/auth'

export function useDirectorEditDataQuery() {
  const { isAuthenticated, user } = useAuth()

  return useQuery({
    queryKey: queryKeys.directorProfile.editData(),
    queryFn: fetchDirectorEditMyData,
    enabled: isAuthenticated && isDirectorRole(user),
  })
}
