import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMyAnnounces, markAnnounceRead, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useMyAnnouncesQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.announces.mine(),
    queryFn: fetchMyAnnounces,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  })
}

export function useMarkAnnounceReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAnnounceRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.announces.all })
    },
  })
}
