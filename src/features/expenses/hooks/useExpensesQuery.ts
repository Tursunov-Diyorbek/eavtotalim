import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createExpense,
  createExpenseType,
  deleteExpense,
  deleteExpenseType,
  fetchExpenseTypes,
  fetchExpenses,
  fetchExpensesBetweenDates,
  fetchMonthlyExpenses,
  queryKeys,
  updateExpense,
  updateExpenseType,
} from '@/api'
import { useAuth } from '@/features/auth'
import type { ExpensePayload, ExpenseTypePayload } from '@/types/expenses'

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all })
}

export function useExpensesQuery(filters: {
  page: number
  showCount: number
  date?: string
  from?: string
  to?: string
  enabled?: boolean
}) {
  const { isAuthenticated } = useAuth()
  const { enabled = true, ...args } = filters
  return useQuery({
    queryKey: queryKeys.expenses.list(args),
    queryFn: () => fetchExpenses(args),
    enabled: enabled && isAuthenticated,
  })
}

export function useExpenseTypesQuery(filters: {
  page: number
  showCount: number
  search?: string
  withOrganization?: boolean
  enabled?: boolean
}) {
  const { isAuthenticated } = useAuth()
  const { enabled = true, ...args } = filters
  return useQuery({
    queryKey: queryKeys.expenses.types(args),
    queryFn: () => fetchExpenseTypes(args),
    enabled: enabled && isAuthenticated,
  })
}

export function useMonthlyExpensesQuery(year: string, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.expenses.monthly(year),
    queryFn: () => fetchMonthlyExpenses(year),
    enabled: enabled && isAuthenticated && Boolean(year),
  })
}

export function useRangeExpensesQuery(
  from: string,
  to: string,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.expenses.range(from, to),
    queryFn: () => fetchExpensesBetweenDates(from, to),
    enabled: enabled && isAuthenticated,
  })
}

export function useCreateExpenseMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => invalidate(queryClient),
  })
}

export function useUpdateExpenseMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ExpensePayload }) =>
      updateExpense(id, payload),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => invalidate(queryClient),
  })
}

export function useCreateExpenseTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createExpenseType,
    onSuccess: () => invalidate(queryClient),
  })
}

export function useUpdateExpenseTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ExpenseTypePayload
    }) => updateExpenseType(id, payload),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useDeleteExpenseTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteExpenseType,
    onSuccess: () => invalidate(queryClient),
  })
}
