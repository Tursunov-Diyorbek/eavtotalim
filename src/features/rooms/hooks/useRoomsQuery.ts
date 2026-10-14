import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRoom,
  deleteRoom,
  fetchRegionalRooms,
  fetchRoom,
  fetchRooms,
  queryKeys,
  setRoomGaiStatus,
  updateRoom,
} from '@/api'
import type { RegionalRoomsFilters } from '@/api/rooms'
import { useAuth } from '@/features/auth'

export function useRegionalRoomsQuery(filters: RegionalRoomsFilters) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.rooms.regional(filters),
    queryFn: () => fetchRegionalRooms(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useSetRoomGaiStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => setRoomGaiStatus(id, active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })
}

export function useRoomsQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.rooms.list(),
    queryFn: fetchRooms,
    enabled: isAuthenticated,
  })
}

export function useRoomQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: [...queryKeys.rooms.all, 'detail', id ?? ''] as const,
    queryFn: () => fetchRoom(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useCreateRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.directorLists.all })
    },
  })
}

export function useUpdateRoomMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => updateRoom(id, formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.directorLists.all })
    },
  })
}

export function useUpdateAnyRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      updateRoom(String(id), formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.directorLists.all })
    },
  })
}

export function useDeleteRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.directorLists.all })
    },
  })
}
