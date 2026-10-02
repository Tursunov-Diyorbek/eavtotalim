import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchRefundStudentsByGroup,
  fetchReturnedPayments,
  queryKeys,
  storeReturnedPayment,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useRefundsQuery(args: {
  page: number
  showCount: number
  word?: string
  groupId?: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.refund.list(args),
    queryFn: () => fetchReturnedPayments(args),
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
  })
}

export function useRefundStudentsQuery(groupId: string, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.refund.students(groupId),
    queryFn: () => fetchRefundStudentsByGroup(groupId),
    enabled: isAuthenticated && enabled && Boolean(groupId),
  })
}

export function useStoreReturnedPaymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: storeReturnedPayment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.refund.all })
    },
  })
}
