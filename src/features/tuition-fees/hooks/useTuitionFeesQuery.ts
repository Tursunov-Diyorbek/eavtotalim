import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchStudentCreateOptions,
  fetchTuitionFees,
  queryKeys,
  storeOrUpdateTuitionFee,
  type StoreTuitionFeePayload,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useTuitionFeesQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.tuitionFees.list(),
    queryFn: fetchTuitionFees,
    enabled: isAuthenticated,
  })
}

export function useTuitionFeeEduTypesQuery(enabled: boolean) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.options(),
    queryFn: fetchStudentCreateOptions,
    enabled: isAuthenticated && enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useStoreTuitionFeeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StoreTuitionFeePayload) =>
      storeOrUpdateTuitionFee(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tuitionFees.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.directorLists.all })
    },
  })
}
