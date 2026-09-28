import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchDailyArrivals, queryKeys, refetchDailyArrivals } from '@/api'
import { notify } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { useTranslation } from 'react-i18next'

export function useDailyArrivalsQuery(filters: {
  page: number
  showCount: number
  fio: string
  groupId: string
  groupName?: string
  date: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.dailyArrivals.list(filters),
    queryFn: () => fetchDailyArrivals(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useRefetchDailyArrivalsMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (args: { date: string; groupId?: string }) =>
      refetchDailyArrivals(args.date, args.groupId),
    onSuccess: (res) => {
      notify.success(res.message || t('dailyArrivalsPage.refetched'))
      void queryClient.invalidateQueries({ queryKey: queryKeys.dailyArrivals.all })
    },
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  })
}
