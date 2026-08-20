import { useEffect, useState, type HTMLAttributes } from 'react'
import { UserRound } from 'lucide-react'
import { cn } from '@/lib/cn'

const iconBox: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'size-6',
  md: 'size-9',
  lg: 'size-16',
}

const iconSize: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'size-3.5',
  md: 'size-5',
  lg: 'size-8',
}

type SafeImageProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  src?: string | null
  alt?: string
  /** Fallback ikonka o‘lchami */
  size?: 'sm' | 'md' | 'lg'
  /** Placeholder ostidagi matn (katta rasm uchun) */
  label?: string
}

/** Rasm yo‘q yoki URL ochilmasa — UserRound placeholder. */
export function SafeImage({
  src,
  alt = '',
  size = 'md',
  label,
  className,
  ...props
}: SafeImageProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const showImg = Boolean(src) && !failed

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-fog text-muted',
        className,
      )}
      {...props}
    >
      {showImg ? (
        <img
          src={src!}
          alt={alt}
          className="absolute inset-0 block size-full object-cover object-center"
          style={{ imageOrientation: 'from-image' }}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex size-full flex-col items-center justify-center gap-1.5 bg-linear-to-b from-fog to-mist/40"
          role="img"
          aria-label={label || alt || undefined}
        >
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-full bg-white text-muted shadow-[0_1px_4px_rgba(15,36,48,0.08)] ring-1 ring-mist/70',
              iconBox[size],
            )}
          >
            <UserRound className={iconSize[size]} aria-hidden />
          </span>
          {label ? (
            <span className="px-2 text-center text-[11px] font-medium tracking-wide text-muted">
              {label}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}
