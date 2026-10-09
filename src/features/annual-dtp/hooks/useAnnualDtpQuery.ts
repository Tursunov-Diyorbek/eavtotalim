import { useQuery } from '@tanstack/react-query'
import { fetchDtpRecords, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useAnnualDtpQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.annualDtp.list(),
    queryFn: fetchDtpRecords,
    enabled: isAuthenticated,
  })
}
