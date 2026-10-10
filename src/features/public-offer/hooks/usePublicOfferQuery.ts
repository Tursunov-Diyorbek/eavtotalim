import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { acceptPublicOffer, fetchLatestPublicOffer, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useLatestPublicOfferQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.publicOffer.latest(),
    queryFn: fetchLatestPublicOffer,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
}

export function useAcceptPublicOfferMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      organizationId,
    }: {
      id: number
      organizationId: number | null
    }) => acceptPublicOffer(id, organizationId),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.publicOffer.latest(), null)
    },
  })
}
