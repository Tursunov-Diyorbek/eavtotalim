import { useTranslation } from 'react-i18next'
import { ArrowUpRight, Phone, Send } from 'lucide-react'
import { lottieAnimations } from '@/assets/lottie'
import { Badge, LottiePlayer } from '@/components/ui'
import {
  TARIFF_PHONE,
  TARIFF_PHONE_HREF,
  TARIFF_TELEGRAM,
  TARIFF_TELEGRAM_LABEL,
} from '@/config/tariffPlans'
import { parsePhoneDigits } from '@/lib'

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

function tariffPhoneLabel() {
  const digits = parsePhoneDigits(TARIFF_PHONE)
  if (digits.length !== 9) return TARIFF_PHONE
  return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
}

/**
 * Shartnoma tasdiqlanmaganda qarzdorlar ro‘yxati o‘rniga — to‘liq sahifa, hujjat Lottie va aloqa.
 */
export function NoAgreementGate() {
  const { t } = useTranslation()
  const play = !prefersReducedMotion()

  return (
    <section className="relative flex min-h-0 flex-1 overflow-hidden rounded-3xl border border-mist bg-white shadow-[0_18px_50px_rgba(15,36,48,0.06)]">
      <div className="grid min-h-0 w-full flex-1 lg:grid-cols-[minmax(320px,0.92fr)_minmax(0,1.08fr)]">
        <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-linear-to-br from-signal-soft via-white to-amber-soft/90 lg:min-h-0">
          <div
            className="pointer-events-none absolute -top-16 -left-10 size-56 rounded-full bg-white/70 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-8 -bottom-16 size-64 rounded-full bg-signal/10 blur-3xl"
            aria-hidden
          />
          <div className="relative size-[280px] sm:size-[360px] lg:size-[420px]">
            <LottiePlayer
              animationData={lottieAnimations.fillingDocument}
              size="100%"
              autoplay={play}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-col justify-center px-6 py-8 sm:px-10 sm:py-12 lg:px-14 xl:px-16">
          <Badge tone="amber" className="w-fit px-2.5 py-1 text-[12px]">
            {t('debtorsPage.noAgreementBadge')}
          </Badge>
          <h2 className="font-display m-0 mt-4 max-w-xl text-[28px] leading-[1.15] font-semibold tracking-tight text-balance text-deep sm:text-[34px] xl:text-[40px]">
            {t('debtorsPage.noAgreementTitle')}
          </h2>
          <p className="m-0 mt-4 max-w-lg text-[15px] leading-relaxed text-muted sm:text-[16px]">
            {t('debtorsPage.noAgreement')}
          </p>

          <div className="mt-8 grid max-w-xl gap-3">
            <a
              href={TARIFF_PHONE_HREF}
              className="group flex items-center gap-4 rounded-2xl border border-mist bg-fog/40 px-4 py-4 transition hover:border-teal/35 hover:bg-teal-soft/40 sm:px-5 sm:py-5"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-soft text-teal sm:size-14">
                <Phone className="size-5 sm:size-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-muted">
                  {t('debtorsPage.callLabel')}
                </span>
                <span className="mt-0.5 block truncate text-[18px] font-semibold tracking-tight text-deep sm:text-[20px]">
                  {tariffPhoneLabel()}
                </span>
              </span>
              <ArrowUpRight
                className="size-5 shrink-0 text-muted transition group-hover:text-teal"
                aria-hidden
              />
            </a>

            <a
              href={TARIFF_TELEGRAM}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-mist bg-fog/40 px-4 py-4 transition hover:border-signal/35 hover:bg-signal-soft/50 sm:px-5 sm:py-5"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-signal-soft text-signal sm:size-14">
                <Send className="size-5 sm:size-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-muted">
                  {t('debtorsPage.telegramLabel')}
                </span>
                <span className="mt-0.5 block truncate text-[18px] font-semibold tracking-tight text-deep sm:text-[20px]">
                  {TARIFF_TELEGRAM_LABEL}
                </span>
              </span>
              <ArrowUpRight
                className="size-5 shrink-0 text-muted transition group-hover:text-signal"
                aria-hidden
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
