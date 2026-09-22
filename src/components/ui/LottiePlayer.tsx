import { Lottie } from 'lottie-react'
import { cn } from '@/lib/cn'

export type LottiePlayerProps = {
  /** Parsed Lottie JSON yoki URL */
  animationData: object | string
  className?: string
  /** Wrapper o‘lchami (default 180) */
  size?: number | string
  loop?: boolean
  autoplay?: boolean
  /** false — modal yopiq bo‘lsa o‘ynamasin */
  play?: boolean
}

/** Yagona Lottie o‘rabchi — `lottie-react` v3 (`{ Lottie }`, `src`). */
export function LottiePlayer({
  animationData,
  className,
  size = 180,
  loop = true,
  autoplay = true,
  play = true,
}: LottiePlayerProps) {
  const dim = typeof size === 'number' ? `${size}px` : size
  const shouldPlay = autoplay && play

  return (
    <div
      className={cn(
        'pointer-events-none flex shrink-0 items-center justify-center select-none',
        className,
      )}
      style={{ width: dim, height: dim }}
      aria-hidden
    >
      <Lottie
        src={animationData}
        loop={loop}
        autoplay={shouldPlay}
        className="size-full"
      />
    </div>
  )
}
