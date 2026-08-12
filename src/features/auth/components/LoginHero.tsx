import { useTranslation } from 'react-i18next'

const LOGIN_BG = '/images/back1.jpg'

export function LoginHero() {
  const { t } = useTranslation()

  return (
    <aside className="relative isolate flex h-full min-h-0 flex-col justify-end overflow-hidden text-white lg:justify-between lg:p-0">
      <img
        src={LOGIN_BG}
        alt=""
        className="login-hero-photo absolute inset-0 -z-20 h-full w-full object-cover object-[center_40%]"
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,36,48,0.35)_0%,rgba(15,36,48,0.55)_40%,rgba(15,36,48,0.88)_100%)] lg:bg-[linear-gradient(115deg,rgba(15,36,48,0.55)_0%,rgba(15,36,48,0.72)_48%,rgba(15,36,48,0.9)_100%)]"
        aria-hidden
      />

      <div className="login-rise relative z-10 flex h-full flex-col justify-end p-4 sm:p-5 lg:justify-between lg:p-12 xl:p-14">
        <div>
          <p className="font-display text-[10px] font-semibold tracking-[0.2em] text-[#9ed4e8] uppercase sm:text-[11px]">
            {t('common.appName')}
          </p>

          <h1 className="font-display mt-2 max-w-xl text-[0.92rem] leading-snug font-semibold tracking-[-0.02em] text-balance sm:mt-4 sm:text-[1.25rem] lg:mt-7 lg:text-[1.65rem] xl:text-[1.85rem]">
            {t('login.officialTitle')}
          </h1>
          <p className="mt-2 line-clamp-2 max-w-lg text-[11px] leading-relaxed text-white/72 sm:mt-3 sm:line-clamp-3 sm:text-[13px] lg:mt-4 lg:line-clamp-none lg:text-[15px]">
            {t('login.officialSubtitle')}
          </p>
        </div>

        <p className="mt-3 hidden text-sm text-white/55 lg:mt-10 lg:block">
          {t('login.footer')}
        </p>
      </div>
    </aside>
  )
}
