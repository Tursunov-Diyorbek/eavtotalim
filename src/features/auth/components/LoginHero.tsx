import { useTranslation } from 'react-i18next'
import { Camera, ClipboardCheck, GraduationCap } from 'lucide-react'
import { lottieAnimations } from '@/assets/lottie'
import { LottiePlayer } from '@/components/ui'

const FEATURES = [
  { key: 'attendance', icon: Camera },
  { key: 'tests', icon: ClipboardCheck },
  { key: 'exam', icon: GraduationCap },
] as const

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

export function LoginHero() {
  const { t } = useTranslation()

  return (
    <aside className="login-hero relative isolate flex shrink-0 flex-col overflow-hidden text-white lg:min-h-0 lg:shrink">
      <div className="login-hero-grid absolute inset-0 -z-10" aria-hidden />

      <div className="login-rise login-hero-inner relative z-10 flex min-h-0 flex-1 flex-col px-5 pt-6 pb-10 sm:px-10 sm:pt-8 lg:px-14 lg:pt-14 lg:pb-12 xl:px-20">
        <div className="shrink-0">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#9ed4e8]/70" aria-hidden />
            <p className="font-display text-[10px] font-semibold tracking-[0.28em] text-[#9ed4e8] uppercase sm:text-[11px]">
              {t('common.appName')}
            </p>
          </div>
          <h1 className="login-hero-title font-display mt-3 max-w-2xl text-[1.05rem] leading-[1.3] font-semibold tracking-[-0.015em] text-balance sm:mt-5 sm:text-[1.45rem] lg:text-[1.75rem] xl:text-[2.1rem]">
            {t('login.officialTitle')}
          </h1>
          <p className="login-hero-subtitle mt-3 hidden max-w-xl text-[14px] leading-relaxed text-white/65 sm:block lg:mt-4 lg:text-[15px]">
            {t('login.officialSubtitle')}
          </p>
        </div>

        <div className="login-hero-art mx-auto mt-4 h-[200px] w-full max-w-[560px] sm:h-[260px] lg:mt-2 lg:h-auto lg:min-h-0 lg:max-w-[620px] lg:flex-1">
          <LottiePlayer
            animationData={lottieAnimations.roadEmblem}
            size="100%"
            autoplay={!prefersReducedMotion()}
          />
        </div>

        <div className="login-hero-footer hidden shrink-0 lg:block">
          <ul className="grid grid-cols-3 border-y border-white/10">
            {FEATURES.map(({ key, icon: Icon }, index) => (
              <li
                key={key}
                className={
                  index === 0
                    ? 'flex items-center gap-3 py-4 pr-4'
                    : 'flex items-center gap-3 border-l border-white/10 py-4 pr-4 pl-5'
                }
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5">
                  <Icon className="size-[18px] text-[#9ed4e8]" aria-hidden />
                </span>
                <span className="text-[13px] leading-snug font-medium text-white/85 xl:text-sm">
                  {t(`login.features.${key}`)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] text-white/45">{t('login.footer')}</p>
        </div>
      </div>
    </aside>
  )
}
