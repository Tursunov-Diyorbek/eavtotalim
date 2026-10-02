import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchDebtorFilterGroups, fetchDebtors, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useDebtorsQuery(
  args: {
    page: number
    showCount: number
    fio?: string
    groupId?: string
  },
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.debtors.list(args),
    queryFn: () => fetchDebtors(args),
    enabled: isAuthenticated && enabled,
    placeholderData: keepPreviousData,
  })
}

export function useDebtorFilterGroupsQuery(enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.debtors.groups(),
    queryFn: fetchDebtorFilterGroups,
    enabled: isAuthenticated && enabled,
  })
}
