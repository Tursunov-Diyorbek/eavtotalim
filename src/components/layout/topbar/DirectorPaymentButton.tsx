import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Wallet } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { isDirectorRole } from '@/config/roles'
import { AddPaymentHistoryModal } from '@/pages/payment-history/AddPaymentHistoryModal'

/** Direktor topbar: To‘lov — eski Header `AddPaymentHistory header`. */
export function DirectorPaymentButton() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  if (!isDirectorRole(user)) return null

  return (
    <>
      <button
        type="button"
        title={t('topbar.payment')}
        onClick={() => setOpen(true)}
        className="hidden h-8 items-center gap-1.5 rounded-lg px-2 text-[12px] font-semibold text-deep transition hover:bg-fog/70 sm:inline-flex"
      >
        <Wallet className="size-4 text-signal" aria-hidden />
        <span>{t('topbar.payment')}</span>
      </button>
      <AddPaymentHistoryModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
