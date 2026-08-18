import { useQuery } from '@tanstack/react-query'
import { fetchDailyPaymentByType, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'
import { isDirectorRole } from '@/config'

function todayIso() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function useDailyPaymentsQuery() {
  const { isAuthenticated, user } = useAuth()
  const day = todayIso()

  return useQuery({
    queryKey: queryKeys.directorDashboard.dailyPayments(day, day),
    queryFn: () => fetchDailyPaymentByType(day, day),
    enabled: isAuthenticated && isDirectorRole(user),
  })
}
