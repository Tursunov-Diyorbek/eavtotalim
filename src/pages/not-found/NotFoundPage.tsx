import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { routes } from '@/config'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm font-semibold text-signal">404</p>
      <h1 className="font-display text-2xl font-semibold text-ink">
        {t('common.notFoundTitle')}
      </h1>
      <Link
        to={routes.login}
        className="inline-flex rounded-xl bg-signal px-3.5 py-2 text-sm font-semibold text-white hover:bg-signal-hot"
      >
        {t('common.backToLogin')}
      </Link>
    </main>
  )
}
