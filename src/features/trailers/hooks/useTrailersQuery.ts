import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTrailer,
  deleteTrailer,
  disableTrailer,
  enableTrailer,
  fetchTrailer,
  fetchTrailers,
  queryKeys,
  updateTrailer,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useTrailersQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.trailers.list(),
    queryFn: fetchTrailers,
    enabled: isAuthenticated,
  })
}

export function useTrailerQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: [...queryKeys.trailers.all, 'detail', id ?? ''] as const,
    queryFn: () => fetchTrailer(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useCreateTrailerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTrailer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trailers.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.directorLists.all })
    },
  })
}

export function useUpdateTrailerMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => updateTrailer(id, formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trailers.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.directorLists.all })
    },
  })
}

function invalidateTrailers(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.trailers.all })
  void queryClient.invalidateQueries({ queryKey: queryKeys.directorLists.all })
}

export function useUpdateAnyTrailerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      updateTrailer(String(id), formData),
    onSuccess: () => invalidateTrailers(queryClient),
  })
}

export function useEnableTrailerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: enableTrailer,
    onSuccess: () => invalidateTrailers(queryClient),
  })
}

export function useDisableTrailerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: disableTrailer,
    onSuccess: () => invalidateTrailers(queryClient),
  })
}

export function useDeleteTrailerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTrailer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trailers.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.directorLists.all })
    },
  })
}
