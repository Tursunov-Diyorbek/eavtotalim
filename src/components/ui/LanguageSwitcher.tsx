import { useTranslation } from 'react-i18next'
import { LOCALES, type AppLocale } from '@/i18n'
import { cn } from '@/lib/cn'

type LanguageSwitcherProps = {
  className?: string
  variant?: 'light' | 'dark'
}

export function LanguageSwitcher({
  className,
  variant = 'light',
}: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation()
  const current = (LOCALES.includes(i18n.language as AppLocale)
    ? i18n.language
    : 'uz') as AppLocale

  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      className={cn(
        'inline-flex rounded-xl border p-0.5 text-[11px] font-semibold tracking-wide',
        variant === 'light'
          ? 'border-mist/90 bg-white/90 text-muted'
          : 'border-white/20 bg-white/10 text-white/70 backdrop-blur-md',
        className,
      )}
    >
      {LOCALES.map((locale) => {
        const active = current === locale
        return (
          <button
            key={locale}
            type="button"
            onClick={() => void i18n.changeLanguage(locale)}
            className={cn(
              'min-w-10 flex-1 rounded-[10px] px-2.5 py-1.5 transition',
              active
                ? variant === 'light'
                  ? 'bg-signal text-white shadow-sm'
                  : 'bg-white text-deep'
                : variant === 'light'
                  ? 'hover:text-ink'
                  : 'hover:text-white',
            )}
          >
            {t(`lang.${locale}`)}
          </button>
        )
      })}
    </div>
  )
}
