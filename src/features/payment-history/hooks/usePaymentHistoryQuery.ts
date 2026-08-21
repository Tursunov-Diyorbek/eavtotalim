import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPaymentHistory,
  deleteStudentPayment,
  fetchGroupPaymentReport,
  fetchOrgPaymentReport,
  fetchPaymentCheck,
  fetchPaymentCreateList,
  fetchPaymentGroups,
  fetchPaymentHistory,
  fetchStudentForPayment,
  fetchStudentPaymentsIndex,
  fetchYearPaymentReport,
  queryKeys,
  storeStudentPayment,
} from '@/api'
import { useAuth } from '@/features/auth'
import type { CreatePaymentHistoryPayload } from '@/types/payment-history'

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.paymentHistory.all })
  void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
}

export function usePaymentHistoryListQuery(
  filters: {
    page: number
    fio?: string
    search?: string
    payTypeId?: number | null
    fromDate?: string
    toDate?: string
  },
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.paymentHistory.list(filters),
    queryFn: () => fetchPaymentHistory(filters),
    enabled: enabled && isAuthenticated,
  })
}

export function usePaymentGroupsQuery(enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.paymentHistory.groups(),
    queryFn: fetchPaymentGroups,
    enabled: enabled && isAuthenticated,
  })
}

export function useOrgPaymentReportQuery(
  page: number,
  showCount: number,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.paymentHistory.org({ page, showCount }),
    queryFn: () => fetchOrgPaymentReport(page, showCount),
    enabled: enabled && isAuthenticated,
  })
}

export function useGroupPaymentReportQuery(
  filters: { page: number; showCount: number; search?: string },
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.paymentHistory.groupReport(filters),
    queryFn: () => fetchGroupPaymentReport(filters),
    enabled: enabled && isAuthenticated,
  })
}

export function useStudentPaymentsIndexQuery(
  filters: { page: number; showCount: number; search?: string },
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.paymentHistory.students(filters),
    queryFn: () => fetchStudentPaymentsIndex(filters),
    enabled: enabled && isAuthenticated,
  })
}

export function useYearPaymentReportQuery(
  filters: {
    page: number
    showCount: number
    search?: string
    startDate: string
    endDate: string
  },
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.paymentHistory.year(filters),
    queryFn: () => fetchYearPaymentReport(filters),
    enabled: enabled && isAuthenticated && Boolean(filters.startDate && filters.endDate),
  })
}

export function usePaymentCreateListQuery(filters: {
  page: number
  showCount: number
  search?: string
  groupId?: string
  year?: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.paymentHistory.createList(filters),
    queryFn: () => fetchPaymentCreateList(filters),
    enabled: isAuthenticated,
  })
}

export function useStudentForPaymentQuery(id?: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.paymentHistory.student(id ?? ''),
    queryFn: () => fetchStudentForPayment(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function usePaymentCheckQuery(id?: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.paymentHistory.check(id ?? ''),
    queryFn: () => fetchPaymentCheck(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useCreatePaymentHistoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePaymentHistoryPayload) =>
      createPaymentHistory(payload),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useStoreStudentPaymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: storeStudentPayment,
    onSuccess: () => invalidate(queryClient),
  })
}

export function useDeleteStudentPaymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteStudentPayment,
    onSuccess: () => invalidate(queryClient),
  })
}
