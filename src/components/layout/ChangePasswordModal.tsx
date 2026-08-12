import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { changePassword } from '@/api'
import { Button, Input, Modal, notify } from '@/components/ui'

const STRONG_PASSWORD = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/

type ChangePasswordModalProps = {
  open: boolean
  onClose: () => void
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const { t } = useTranslation()
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirmation('')
      setLoading(false)
    }
  }, [open])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!currentPassword.trim() || !password.trim() || !passwordConfirmation.trim()) {
      notify.warning(t('settings.passwordRequired'))
      return
    }
    if (password !== passwordConfirmation) {
      notify.warning(t('settings.passwordMismatch'))
      return
    }
    if (!STRONG_PASSWORD.test(password)) {
      notify.warning(t('settings.passwordWeak'))
      return
    }

    setLoading(true)
    try {
      const res = await changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      })
      if (res?.response_code === 200 || res?.status === 1 || res?.status === '1') {
        notify.success(t('settings.passwordOk'))
        onClose()
        window.location.reload()
        return
      }
      notify.success(res?.message || t('settings.passwordOk'))
      onClose()
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : t('settings.passwordFail'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!loading) onClose()
      }}
      title={t('settings.changePassword')}
      sizeClassName="max-w-md"
    >
      <form className="space-y-3" onSubmit={(e) => void onSubmit(e)}>
        <Input
          label={t('settings.currentPassword')}
          type="password"
          name="current_password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder={t('settings.currentPasswordPh')}
        />
        <Input
          label={t('settings.newPassword')}
          type="password"
          name="password"
          autoComplete="new-password"
          maxLength={12}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('settings.newPasswordPh')}
        />
        <Input
          label={t('settings.confirmPassword')}
          type="password"
          name="password_confirmation"
          autoComplete="new-password"
          maxLength={12}
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder={t('settings.confirmPasswordPh')}
        />
        <p className="m-0 text-[12px] leading-snug text-muted">
          {t('settings.passwordHint')}
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={onClose}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
