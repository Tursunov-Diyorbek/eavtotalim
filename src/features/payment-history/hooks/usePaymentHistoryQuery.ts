import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPaymentHistory,
  deleteStudentPayment,
  fetchAccountingGeneralReport,
  fetchAccountingGroupReport,
  fetchOrgPaymentReport,
  fetchPaymentCheck,
  fetchPaymentCreateList,
  fetchPaymentGroups,
  fetchPaymentHistory,
  fetchStudentForPayment,
  fetchAccountingPaymentShow,
  fetchStudentPaymentGroups,
  fetchStudentPaymentsIndex,
  setAccountingPaymentBonus,
  storeAccountingPayment,
  fetchAccountingYearlyReport,
  queryKeys,
  storeStudentPayment,
} from '@/api'
import { useAuth } from '@/features/auth'
import type {
  CreatePaymentHistoryPayload,
  SetAccountingBonusPayload,
  StoreAccountingPaymentPayload,
  StudentPaymentFilters,
} from '@/types/payment-history'

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
    placeholderData: keepPreviousData,
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

export function useAccountingGeneralReportQuery(year: number, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.paymentHistory.generalReport(year),
    queryFn: () => fetchAccountingGeneralReport(year),
    enabled: enabled && isAuthenticated,
    placeholderData: keepPreviousData,
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
    placeholderData: keepPreviousData,
  })
}

export function useGroupPaymentReportQuery(
  filters: { page: number; showCount: number; search?: string },
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.paymentHistory.groupReport(filters),
    queryFn: () => fetchAccountingGroupReport(filters),
    enabled: enabled && isAuthenticated,
    placeholderData: keepPreviousData,
  })
}

export function useAccountingPaymentShowQuery(studentId: number | null, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: [...queryKeys.paymentHistory.all, 'accounting-show', studentId],
    queryFn: () => fetchAccountingPaymentShow(studentId as number),
    enabled: enabled && isAuthenticated && Boolean(studentId),
  })
}

export function useStoreAccountingPaymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StoreAccountingPaymentPayload) => storeAccountingPayment(payload),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useSetAccountingBonusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SetAccountingBonusPayload) => setAccountingPaymentBonus(payload),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useStudentPaymentGroupsQuery(enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: [...queryKeys.paymentHistory.all, 'student-filter-groups'],
    queryFn: fetchStudentPaymentGroups,
    enabled: enabled && isAuthenticated,
  })
}

export function useStudentPaymentsIndexQuery(filters: StudentPaymentFilters, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.paymentHistory.students(filters),
    queryFn: () => fetchStudentPaymentsIndex(filters),
    enabled: enabled && isAuthenticated,
    placeholderData: keepPreviousData,
  })
}

export function useYearPaymentReportQuery(year: number, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.paymentHistory.year({ year }),
    queryFn: () => fetchAccountingYearlyReport(year),
    placeholderData: keepPreviousData,
    enabled: enabled && isAuthenticated && year > 0,
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
    placeholderData: keepPreviousData,
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
