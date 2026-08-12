import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteSavedTest, queryKeys } from '@/api'

export function useDeleteSavedTestMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (savedTestId: number) => deleteSavedTest(savedTestId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.savedTests.all })
    },
  })
}
