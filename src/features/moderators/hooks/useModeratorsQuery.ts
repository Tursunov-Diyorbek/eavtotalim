import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createModerator,
  deleteModerator,
  fetchModerator,
  fetchModeratorDistricts,
  fetchModeratorRegions,
  fetchModerators,
  queryKeys,
  updateModerator,
  type ModeratorPayload,
} from '@/api'
import { useAuth } from '@/features/auth'
import type { ModeratorFilters } from '@/types/moderators'

export function useModeratorsQuery(filters: ModeratorFilters) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.moderators.list(filters),
    queryFn: () => fetchModerators(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useModeratorQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.moderators.detail(id ?? ''),
    queryFn: () => fetchModerator(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useModeratorRegionsQuery(enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.moderators.regions(),
    queryFn: fetchModeratorRegions,
    enabled: isAuthenticated && enabled,
  })
}

export function useModeratorDistrictsQuery(regionId: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.moderators.districts(regionId),
    queryFn: () => fetchModeratorDistricts(regionId),
    enabled: isAuthenticated && Boolean(regionId),
  })
}

function useInvalidate() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.moderators.all })
  }
}

export function useCreateModeratorMutation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (payload: ModeratorPayload) => createModerator(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateModeratorMutation(id: string) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (payload: ModeratorPayload) => updateModerator(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteModeratorMutation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: deleteModerator,
    onSuccess: invalidate,
  })
}
