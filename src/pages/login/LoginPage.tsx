import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'
import { HttpError, loginRequest } from '@/api'
import appLogoFull from '@/assets/images/logo_old2.png'
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
  const [captchaNonce, setCaptchaNonce] = useState(0)

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
      setCaptchaNonce((n) => n + 1)
    }
  }

  return (
    <div className="login-page fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white lg:grid lg:grid-cols-[1.08fr_1fr] lg:overflow-hidden xl:grid-cols-[1.15fr_1fr]">
      <LoginHero />

      <section className="login-form-side relative -mt-6 flex flex-1 flex-col rounded-t-[28px] bg-white px-5 pt-6 pb-6 sm:px-10 sm:pt-8 lg:mt-0 lg:min-h-0 lg:overflow-y-auto lg:rounded-none lg:px-14 lg:py-10 xl:px-20">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <img src={appLogoFull} alt={t('common.appName')} className="h-6 w-auto sm:h-7" />
          <LanguageSwitcher />
        </div>

        <div className="login-form-center flex flex-1 items-center justify-center py-8 sm:py-12 lg:py-10">
          <div className="login-rise-delay w-full max-w-[480px]">
            <header className="mb-7 sm:mb-9">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-signal" aria-hidden />
                <p className="font-display text-[11px] font-semibold tracking-[0.24em] text-signal uppercase">
                  {t('login.welcome')}
                </p>
              </div>
              <h2 className="font-display mt-3 text-[1.9rem] leading-[1.1] font-semibold tracking-[-0.035em] text-deep sm:text-[2.35rem] xl:text-[2.6rem]">
                {t('login.title')}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('login.subtitle')}</p>
            </header>

            <LoginForm
              onSubmit={handleLogin}
              formError={formError}
              captchaNonce={captchaNonce}
            />
          </div>
        </div>

        <footer className="flex shrink-0 flex-col gap-2 border-t border-mist/70 pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-teal" aria-hidden />
            {t('login.secure')}
          </p>
          <p>
            © {new Date().getFullYear()} {t('common.appName')}
          </p>
        </footer>
      </section>
    </div>
  )
}
