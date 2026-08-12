import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, LockKeyhole, LogIn, UserRound } from 'lucide-react'
import { Button, Input } from '@/components/ui'
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
}

export function LoginForm({ onSubmit, formError }: LoginFormProps) {
  const { t } = useTranslation()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [captchaKey, setCaptchaKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>(
    {},
  )

  useEffect(() => {
    setLogin('')
    setPassword('')
    const id = window.setTimeout(() => {
      setLogin('')
      setPassword('')
    }, 150)
    return () => window.clearTimeout(id)
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const nextErrors: typeof errors = {}
    if (!login.trim()) nextErrors.login = t('login.errors.loginRequired')
    if (!password) nextErrors.password = t('login.errors.passwordRequired')
    if (!captcha.trim() || !captchaKey) {
      nextErrors.captcha = t('login.errors.captchaRequired')
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      await onSubmit?.({
        login: login.trim(),
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
      className="login-rise flex flex-col gap-2.5 sm:gap-3.5"
      autoComplete="off"
      noValidate
    >
      <Input
        name="eav_login"
        label={t('login.login')}
        placeholder={t('login.login')}
        autoComplete="off"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        error={errors.login}
        leftSlot={<UserRound className="size-4" aria-hidden />}
      />

      <Input
        name="eav_password"
        label={t('login.password')}
        placeholder="••••••••"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        leftSlot={<LockKeyhole className="size-4" aria-hidden />}
        rightSlot={
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted transition hover:bg-brand-50 hover:text-ink"
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
      />

      {formError ? (
        <p className="text-sm text-red-500/90" role="alert">
          {formError}
        </p>
      ) : null}

      <Button type="submit" size="lg" loading={loading} className="mt-0.5 w-full lg:mt-1">
        <LogIn className="size-4" aria-hidden />
        {t('login.submit')}
      </Button>
    </form>
  )
}
