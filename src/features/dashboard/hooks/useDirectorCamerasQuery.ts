import { useQuery } from '@tanstack/react-query'
import { fetchDirectorAutodromeCameras, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'
import { isDirectorRole } from '@/config'

export function useDirectorCamerasQuery(enabled: boolean) {
  const { isAuthenticated, user } = useAuth()

  return useQuery({
    queryKey: queryKeys.directorDashboard.cameras(),
    queryFn: fetchDirectorAutodromeCameras,
    enabled: isAuthenticated && isDirectorRole(user) && enabled,
  })
}
