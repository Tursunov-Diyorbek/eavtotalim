import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react'
import { Button, Input, Notification } from '@/components/ui'
import { getLoginDraft, saveLoginDraft } from '@/lib/loginDraft'
import { primeMessageAudio } from '@/lib/notificationChime'
import { CaptchaField } from './CaptchaField'

export type LoginFormValues = {
  login: string
  password: string
  captcha: string
  captchaKey: string
}

type LoginFormProps = {
  onSubmit?: (values: LoginFormValues) => void | Promise<void>
  formError?: string | null
  /** Xato login dan keyin captchani yangilash (login/parol saqlanadi) */
  captchaNonce?: number
}

export function LoginForm({ onSubmit, formError, captchaNonce = 0 }: LoginFormProps) {
  const { t } = useTranslation()
  const [login, setLogin] = useState(() => getLoginDraft().login)
  const [password, setPassword] = useState(() => getLoginDraft().password)
  const [captcha, setCaptcha] = useState('')
  const [captchaKey, setCaptchaKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>(
    {},
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    primeMessageAudio()

    const nextErrors: typeof errors = {}
    if (!login.trim()) nextErrors.login = t('login.errors.loginRequired')
    if (!password) nextErrors.password = t('login.errors.passwordRequired')
    if (!captcha.trim() || !captchaKey) {
      nextErrors.captcha = t('login.errors.captchaRequired')
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    const nextLogin = login.trim()
    saveLoginDraft(nextLogin, password)
    try {
      await onSubmit?.({
        login: nextLogin,
        password,
        captcha: captcha.trim(),
        captchaKey,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex flex-col gap-4 sm:gap-5"
      autoComplete="off"
      noValidate
    >
      <Input
        size="lg"
        name="eav_login"
        label={t('login.login')}
        placeholder={t('login.loginPlaceholder')}
        autoComplete="off"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        error={errors.login}
        leftSlot={<UserRound className="size-[18px]" aria-hidden />}
      />

      <Input
        size="lg"
        name="eav_password"
        label={t('login.password')}
        placeholder="••••••••"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        leftSlot={<LockKeyhole className="size-[18px]" aria-hidden />}
        rightSlot={
          <button
            type="button"
            className="rounded-lg p-2 text-muted transition hover:bg-brand-50 hover:text-ink"
            aria-label={
              showPassword ? t('login.hidePassword') : t('login.showPassword')
            }
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        }
      />

      <CaptchaField
        value={captcha}
        onChange={setCaptcha}
        captchaKey={captchaKey}
        onCaptchaKeyChange={setCaptchaKey}
        error={errors.captcha}
        refreshNonce={captchaNonce}
      />

      {formError ? (
        <Notification tone="error">{formError}</Notification>
      ) : null}

      <Button type="submit" size="xl" loading={loading} className="mt-1 w-full">
        {t('login.submit')}
        {loading ? null : <ArrowRight className="size-[18px]" aria-hidden />}
      </Button>
    </form>
  )
}
