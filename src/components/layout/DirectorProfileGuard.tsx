import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Modal, Notification } from '@/components/ui'
import {
  isDirectorRole,
  routes,
  shouldForceDirectorProfileFill,
} from '@/config'
import { useAuth } from '@/features/auth'

const FORCE_DELAY_MS = 5000

/** Eski DirectorInfoFill — MSPD 0/2 bo‘lsa to‘ldirish majburiy. */
export function DirectorProfileGuard() {
  const { t } = useTranslation()
  const { me, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const canForce =
    isDirectorRole(user) &&
    shouldForceDirectorProfileFill(me?.profession?.mspd_status) &&
    location.pathname !== routes.directorEditData

  if (!canForce && open) {
    setOpen(false)
  }

  useEffect(() => {
    if (!canForce) return
    const id = window.setTimeout(() => setOpen(true), FORCE_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [canForce])

  return (
    <Modal
      open={open}
      onClose={() => undefined}
      dismissible={false}
      title={t('directorProfile.guardTitle')}
      sizeClassName="max-w-lg"
    >
      <Notification tone="error">{t('directorProfile.guardText')}</Notification>
      <div className="mt-4">
        <Button
          className="w-full"
          onClick={() => {
            setOpen(false)
            navigate(routes.directorEditData)
          }}
        >
          {t('directorProfile.guardCta')}
        </Button>
      </div>
    </Modal>
  )
}
