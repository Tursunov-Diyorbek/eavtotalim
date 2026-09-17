import { useQuery } from '@tanstack/react-query'
import { fetchMyProfilePayments, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

/** O‘quvchi to‘lovlari — `/my-profile/payments` (ko‘rsatish tugmasi bilan). */
export function useMyProfilePaymentsQuery(enabled = false) {
  const { isAuthenticated, user } = useAuth()
  const isStudent = user?.role === 5 || user?.roles?.includes('student')

  return useQuery({
    queryKey: queryKeys.myProfile.payments(),
    queryFn: fetchMyProfilePayments,
    enabled: isAuthenticated && isStudent && enabled,
  })
}
