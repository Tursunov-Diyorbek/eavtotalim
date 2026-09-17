import {
  forwardRef,
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/cn'

type TopbarIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  label: string
  children: ReactNode
}

/** Topbar ixcham tugma — eski header-item. */
export const TopbarIconButton = forwardRef<
  HTMLButtonElement,
  TopbarIconButtonProps
>(function TopbarIconButton(
  { active, label, children, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-deep transition hover:border-mist/80 hover:bg-white',
        active && 'border-signal/30 bg-signal/10 text-signal',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
})

const FONT_KEY = 'eavt.font-size'
const DEFAULT_PX = 16
const MIN_PX = 12
const MAX_PX = 22

export function readFontSize(): number {
  try {
    const n = Number(localStorage.getItem(FONT_KEY))
    if (Number.isFinite(n) && n >= MIN_PX && n <= MAX_PX) return n
  } catch {
    /* ignore */
  }
  return DEFAULT_PX
}

export function applyFontSize(px: number) {
  document.documentElement.style.fontSize = `${px}px`
  try {
    localStorage.setItem(FONT_KEY, String(px))
  } catch {
    /* ignore */
  }
}

export function useFontSizeControl() {
  const [size, setSize] = useState(DEFAULT_PX)

  useEffect(() => {
    const initial = readFontSize()
    setSize(initial)
    applyFontSize(initial)
  }, [])

  function bump(delta: number) {
    const next = Math.max(MIN_PX, Math.min(MAX_PX, size + delta))
    applyFontSize(next)
    setSize(next)
    return next
  }

  return {
    size,
    increase: () => bump(1),
    decrease: () => bump(-1),
  }
}

export function useFullscreen() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const sync = () => {
      const on = Boolean(
        document.fullscreenElement ||
          // @ts-expect-error vendor
          document.webkitFullscreenElement,
      )
      setActive(on)
      try {
        localStorage.setItem('fullScreen', on ? 'true' : 'false')
      } catch {
        /* ignore */
      }
    }
    sync()
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
    }
  }, [])

  async function toggle() {
    try {
      if (
        !document.fullscreenElement &&
        // @ts-expect-error vendor
        !document.webkitFullscreenElement
      ) {
        const el = document.documentElement as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void> | void
        }
        if (el.requestFullscreen) await el.requestFullscreen()
        else el.webkitRequestFullscreen?.()
      } else {
        const doc = document as Document & {
          webkitExitFullscreen?: () => Promise<void> | void
        }
        if (doc.exitFullscreen) await doc.exitFullscreen()
        else doc.webkitExitFullscreen?.()
      }
    } catch {
      /* ignore */
    }
  }

  return { active, toggle }
}
