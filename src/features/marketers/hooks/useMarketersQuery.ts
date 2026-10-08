import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createMarketer,
  deleteMarketer,
  fetchMarketer,
  fetchMarketerDistricts,
  fetchMarketerRegions,
  fetchMarketers,
  queryKeys,
  updateMarketer,
  type MarketerPayload,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useMarketersQuery(page: number, showCount: number) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.marketers.list(page, showCount),
    queryFn: () => fetchMarketers(page, showCount),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useMarketerQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.marketers.detail(id ?? ''),
    queryFn: () => fetchMarketer(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useMarketerRegionsQuery(enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.marketers.regions(),
    queryFn: fetchMarketerRegions,
    enabled: isAuthenticated && enabled,
  })
}

export function useMarketerDistrictsQuery(regionId: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.marketers.districts(regionId),
    queryFn: () => fetchMarketerDistricts(regionId),
    enabled: isAuthenticated && Boolean(regionId),
  })
}

function useInvalidate() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.marketers.all })
  }
}

export function useCreateMarketerMutation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (payload: MarketerPayload) => createMarketer(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateMarketerMutation(id: string) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (payload: MarketerPayload) => updateMarketer(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteMarketerMutation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: deleteMarketer,
    onSuccess: invalidate,
  })
}
