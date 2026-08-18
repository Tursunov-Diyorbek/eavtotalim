import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchMspdPersonInfo, HttpError } from '@/api'
import { notify } from '@/components/ui'
import type { MspdPersonInfo, MspdSearchPayload } from '@/types'

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

export function useMspdPersonSearchMutation() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: MspdSearchPayload) => fetchMspdPersonInfo(payload),
    onSuccess: (res) => {
      if (res.status === 200) {
        notify.success(t('directorProfile.mspdFound'))
        return
      }
      if (res.status === 404) {
        notify.warning(t('directorProfile.mspdNotFound'))
      }
    },
    onError: (err) => {
      notify.error(errorText(err, t('directorProfile.mspdNotFound')))
    },
  })
}

export type { MspdPersonInfo }
