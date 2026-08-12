import { useQuery } from '@tanstack/react-query'
import { fetchAutodromeCameraStatus, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

/** Avtodrom kamerasidagi holat — `/my-profile/autodrome-camera-status`. */
export function useAutodromeCameraStatusQuery() {
  const { isAuthenticated, user } = useAuth()
  const isStudent = user?.role === 5 || user?.roles?.includes('student')

  return useQuery({
    queryKey: queryKeys.myProfile.autodromeCameraStatus(),
    queryFn: fetchAutodromeCameraStatus,
    enabled: isAuthenticated && isStudent,
  })
}
