import { useQuery } from '@tanstack/react-query'
import { fetchAutodromeEnrollmentStatus, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

/** Avtodromga yuborilish holati — `/my-profile/autodrome-status`. */
export function useAutodromeEnrollmentStatusQuery() {
  const { isAuthenticated, user } = useAuth()
  const isStudent = user?.role === 5 || user?.roles?.includes('student')

  return useQuery({
    queryKey: queryKeys.myProfile.autodromeEnrollmentStatus(),
    queryFn: fetchAutodromeEnrollmentStatus,
    enabled: isAuthenticated && isStudent,
  })
}
