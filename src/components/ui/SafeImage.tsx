import { useEffect, useState, type HTMLAttributes } from 'react'
import { UserRound, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

const iconBox: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'size-6',
  md: 'size-9',
  lg: 'size-16',
  xl: 'size-20',
}

const iconSize: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'size-3.5',
  md: 'size-5',
  lg: 'size-8',
  xl: 'size-10',
}

type SafeImageProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  src?: string | null
  alt?: string
  /** Fallback ikonka o‘lchami */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Placeholder ostidagi matn (katta rasm uchun) */
  label?: string
  /** Default `UserRound`. Mashina/hujjat uchun boshqa ikonka. */
  icon?: LucideIcon
  fit?: 'cover' | 'contain'
}

function usableSrc(src?: string | null) {
  const value = src?.trim() ?? ''
  if (!value || value === 'null' || value === 'undefined') return ''
  return value
}

/** Rasm yo‘q yoki URL ochilmasa — ikonka placeholder. */
export function SafeImage({
  src,
  alt = '',
  size = 'md',
  label,
  icon: Icon = UserRound,
  fit = 'cover',
  className,
  ...props
}: SafeImageProps) {
  const href = usableSrc(src)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [href])

  const showImg = Boolean(href) && !failed

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
          src={href}
          alt={alt}
          className={cn(
            'absolute inset-0 block size-full object-center',
            fit === 'contain' ? 'object-contain' : 'object-cover',
          )}
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
            <Icon className={iconSize[size]} aria-hidden />
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

/** Native `<img>` (imtihon CSS) — ochilmasa `fallbackSrc`. */
export function onBrokenImg(
  e: { currentTarget: HTMLImageElement },
  fallbackSrc: string,
) {
  const el = e.currentTarget
  if (el.dataset.safeFb === '1') return
  el.dataset.safeFb = '1'
  el.src = fallbackSrc
}
