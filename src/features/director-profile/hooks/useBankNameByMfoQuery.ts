import { useQuery } from '@tanstack/react-query'
import { fetchBankNameByMfo, queryKeys } from '@/api'

export function useBankNameByMfoQuery(mfo: string) {
  const code = mfo.trim()

  return useQuery({
    queryKey: queryKeys.directorProfile.bankName(code),
    queryFn: () => fetchBankNameByMfo(code),
    enabled: code.length >= 5,
    staleTime: 60_000,
  })
}
