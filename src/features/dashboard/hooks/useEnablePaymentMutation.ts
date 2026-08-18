import { useMutation } from '@tanstack/react-query'
import { setOrganizationEnablePayment } from '@/api'
import { notify } from '@/components/ui'
import { useTranslation } from 'react-i18next'

export function useEnablePaymentMutation() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (enable: 0 | 1) => setOrganizationEnablePayment(enable),
    onSuccess: (next) => {
      notify.success(
        next === 1 ? t('dashboard.priceShown') : t('dashboard.priceHidden'),
      )
    },
    onError: (err) => {
      notify.error(
        err instanceof Error ? err.message : t('dashboard.priceToggleError'),
      )
    },
  })
}
