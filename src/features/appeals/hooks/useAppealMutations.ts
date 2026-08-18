import { useMutation, useQueryClient } from '@tanstack/react-query'
import { closeAppeal, queryKeys, storeAppeal, updateAppealStatus } from '@/api'
import type { StoreAppealInput, UpdateAppealStatusInput } from '@/api/appeals'

export function useStoreAppealMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: StoreAppealInput) => storeAppeal(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.appeals.all })
    },
  })
}

export function useCloseAppealMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, comment }: { id: number | string; comment: string }) =>
      closeAppeal(id, comment),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: queryKeys.appeals.all })
      void qc.invalidateQueries({
        queryKey: queryKeys.appeals.detail(String(vars.id)),
      })
    },
  })
}

export function useUpdateAppealStatusMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateAppealStatusInput) => updateAppealStatus(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: queryKeys.appeals.all })
      void qc.invalidateQueries({
        queryKey: queryKeys.appeals.detail(String(vars.id)),
      })
    },
  })
}
