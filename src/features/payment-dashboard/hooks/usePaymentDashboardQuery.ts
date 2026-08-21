import { useQuery } from '@tanstack/react-query'
import { fetchDailyPaymentByType, fetchDailyPayments, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function isoToday() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Eski `periodFilter(true)` — bir oy oldingi shu kun. */
export function isoMonthsAgo(months = 1) {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function usePaymentByTypeQuery(from: string, to: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.directorDashboard.dailyPayments(from, to),
    queryFn: () => fetchDailyPaymentByType(from, to),
    enabled: isAuthenticated && Boolean(from && to),
  })
}

export function useDailyPaymentListQuery(from: string, to: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.directorDashboard.dailyPaymentList(from, to),
    queryFn: () => fetchDailyPayments(from, to),
    enabled: isAuthenticated && Boolean(from && to),
  })
}
