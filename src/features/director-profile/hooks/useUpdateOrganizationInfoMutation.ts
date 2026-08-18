import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { HttpError, queryKeys, updateOrganizationInfo } from '@/api'
import { notify } from '@/components/ui'
import { useAuth } from '@/features/auth'

function errorText(err: unknown, fallback: string): string {
  if (err instanceof HttpError) {
    const p = err.payload as { message?: string; errors?: unknown } | undefined
    if (typeof p?.errors === 'string' && p.errors) return p.errors
    if (p?.message) return p.message
    return err.message || fallback
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export function useUpdateOrganizationInfoMutation() {
  const { t } = useTranslation()
  const { refreshMe } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => updateOrganizationInfo(formData),
    onSuccess: async (res) => {
      if (Number(res.status) === 1) {
        notify.success(res.message || t('common.saved'))
        await refreshMe()
        await queryClient.invalidateQueries({
          queryKey: queryKeys.directorProfile.organizationInfo(),
        })
        return
      }
      notify.error(res.message || t('directorProfile.orgSaveFail'))
    },
    onError: (err) => {
      notify.error(errorText(err, t('directorProfile.orgSaveFail')))
    },
  })
}
