import type { HTMLAttributes, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { lottieAnimations } from '@/assets/lottie'
import { cn } from '@/lib/cn'
import { LottiePlayer } from './LottiePlayer'

type ErrorMessageProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** true bo‘lsa common.loadError */
  fallback?: boolean
  /** Forma ichidagi qisqa xato */
  compact?: boolean
  children?: ReactNode
}

/**
 * Yuklash xatosi — yagona «Ma'lumot yuklanmadi» UI.
 * Doim shu komponent (Lottie). Toast uchun `notify.error`.
 */
export function ErrorMessage({
  children,
  fallback = true,
  compact = false,
  className,
  ...props
}: ErrorMessageProps) {
  const { t } = useTranslation()
  const text = children ?? (fallback ? t('common.loadError') : null)
  if (!text) return null
  const tight = compact || !fallback

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose/25 bg-linear-to-b from-rose-soft/40 to-white text-center',
        tight ? 'px-4 py-4' : 'px-6 py-8',
        className,
      )}
      {...props}
    >
      <LottiePlayer
        animationData={lottieAnimations.error}
        size={tight ? 96 : 168}
        className={tight ? 'mb-1' : '-mb-2'}
      />
      <p
        className={cn(
          'font-display m-0 max-w-sm font-semibold tracking-tight text-deep',
          tight ? 'text-[13px]' : 'text-[15px]',
        )}
      >
        {text}
      </p>
      {fallback ? (
        <p className="m-0 mt-1.5 max-w-md text-[13px] leading-relaxed text-muted">
          {t('common.loadErrorHint')}
        </p>
      ) : null}
    </div>
  )
}
