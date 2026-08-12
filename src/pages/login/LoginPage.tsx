import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HttpError, loginRequest } from '@/api'
import { LoginForm, LoginHero, useAuth, type LoginFormValues } from '@/features/auth'
import { LanguageSwitcher, notify } from '@/components/ui'
import { getHomePathByRole } from '@/config/access'
import { useDocumentTitle } from '@/hooks'
import { saveAuthSession } from '@/lib/authStorage'
import { fullNameOf } from '@/lib/format'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setSessionFromLogin } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [formKey, setFormKey] = useState(0)

  useDocumentTitle(t('login.docTitle'))

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtml = html.style.overflow
    const prevBody = body.style.overflow
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prevHtml
      body.style.overflow = prevBody
    }
  }, [])

  async function handleLogin(values: LoginFormValues) {
    setFormError(null)
    try {
      const data = await loginRequest(
        values.login,
        values.password,
        values.captchaKey,
        values.captcha,
      )
      saveAuthSession(data)
      const me = await setSessionFromLogin(data.access_token)
      const name =
        fullNameOf({
          last_name: me.profession?.last_name,
          first_name: me.profession?.first_name,
        }) || me.user.username || values.login
      notify.success(t('auth.welcomeBack', { name }), { duration: 4500 })
      navigate(getHomePathByRole(me.user.role, me.user), { replace: true })
    } catch (err) {
      const message =
        err instanceof HttpError
          ? err.message
          : err instanceof Error
            ? err.message
            : t('login.errors.failed')
      setFormError(message)
      notify.error(message)
      setFormKey((k) => k + 1)
    }
  }

  return (
    <div className="login-page fixed inset-0 z-50 grid h-dvh max-h-dvh grid-rows-[minmax(0,32%)_minmax(0,68%)] overflow-hidden bg-surface lg:grid-cols-[1.15fr_0.85fr] lg:grid-rows-none">
      <LoginHero />

      <section className="relative flex min-h-0 items-center justify-center overflow-hidden bg-surface px-4 py-3 sm:px-8 lg:px-12 xl:px-16">
        <div
          className="pointer-events-none absolute -top-24 right-0 size-64 rounded-full bg-brand-100/60 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-10 size-48 rounded-full bg-[#dceef5]/70 blur-3xl"
          aria-hidden
        />

        <div className="absolute top-3 right-3 z-20 sm:top-5 sm:right-5 lg:top-6 lg:right-8">
          <LanguageSwitcher />
        </div>

        <div className="login-rise-delay relative w-full max-w-[400px]">
          <header className="mb-4 sm:mb-6 lg:mb-8">
            <p className="font-display text-[11px] font-semibold tracking-[0.16em] text-signal uppercase">
              {t('login.welcome')}
            </p>
            <h2 className="font-display mt-1.5 text-[1.65rem] leading-[1.15] font-semibold tracking-[-0.03em] text-deep sm:text-[1.9rem] lg:text-[2.15rem]">
              {t('login.title')}
            </h2>
            <p className="mt-1.5 hidden text-sm text-muted sm:block">
              {t('login.subtitle')}
            </p>
          </header>

          <LoginForm
            key={formKey}
            onSubmit={handleLogin}
            formError={formError}
          />
        </div>
      </section>
    </div>
  )
}
