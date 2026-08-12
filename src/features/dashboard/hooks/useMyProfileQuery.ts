import { useQuery } from '@tanstack/react-query'
import { fetchMyProfile, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

/** O‘quvchi /my-profile — toifa va guruh detalari. */
export function useMyProfileQuery() {
  const { isAuthenticated, user } = useAuth()
  const isStudent = user?.role === 5 || user?.roles?.includes('student')

  return useQuery({
    queryKey: queryKeys.myProfile.detail(),
    queryFn: fetchMyProfile,
    enabled: isAuthenticated && isStudent,
  })
}
