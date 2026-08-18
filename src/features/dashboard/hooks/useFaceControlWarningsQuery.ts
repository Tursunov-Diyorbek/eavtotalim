import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchFaceControlDashboard,
  markFaceControlWarningSeen,
  queryKeys,
} from '@/api'
import { useAuth } from '@/features/auth'
import { isDirectorRole } from '@/config'
import { notify } from '@/components/ui'
import { useTranslation } from 'react-i18next'

export function useFaceControlWarningsQuery() {
  const { isAuthenticated, user } = useAuth()

  return useQuery({
    queryKey: queryKeys.directorDashboard.faceWarnings(),
    queryFn: fetchFaceControlDashboard,
    enabled: isAuthenticated && isDirectorRole(user),
  })
}

export function useMarkFaceWarningSeenMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: markFaceControlWarningSeen,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.directorDashboard.faceWarnings(),
      })
      notify.success(t('dashboard.warningMarked'))
    },
    onError: (err) => {
      notify.error(
        err instanceof Error ? err.message : t('dashboard.warningMarkError'),
      )
    },
  })
}
