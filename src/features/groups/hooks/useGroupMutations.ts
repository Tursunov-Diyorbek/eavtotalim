import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createGroup, deleteGroup, queryKeys, updateGroup } from '@/api'
import type { CreateGroupPayload, UpdateGroupPayload } from '@/types/groups'

export function useCreateGroupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => createGroup(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}

export function useDeleteGroupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}

export function useUpdateGroupMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateGroupPayload) => updateGroup(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}
