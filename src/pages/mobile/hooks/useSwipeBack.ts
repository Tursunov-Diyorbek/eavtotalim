import { useEffect, useRef } from 'react'

const SWIPE_MIN_DX = 80
const SWIPE_MAX_DY = 40
const EDGE_ZONE = 28

/** Mobil: yon chekadan swipe — orqaga (callback). */
export function useSwipeBack(
  onBack: (() => void) | undefined,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const onBackRef = useRef(onBack)
  const startRef = useRef<{
    x: number
    y: number
    fromLeft: boolean
    fromRight: boolean
  } | null>(null)
  const lockedRef = useRef(false)

  useEffect(() => {
    onBackRef.current = onBack
  }, [onBack])

  useEffect(() => {
    if (!enabled || typeof onBack !== 'function') return undefined

    const isIgnoredTarget = (el: EventTarget | null) => {
      if (!(el instanceof Element)) return false
      return Boolean(
        el.closest(
          'input, textarea, select, .sm-tabbar, [data-no-swipe-back]',
        ),
      )
    }

    const onStart = (e: TouchEvent) => {
      if (lockedRef.current) return
      const t = e.touches?.[0]
      if (!t) return
      if (isIgnoredTarget(e.target)) {
        startRef.current = null
        return
      }

      const fromLeft = t.clientX <= EDGE_ZONE
      const fromRight = t.clientX >= window.innerWidth - EDGE_ZONE
      if (!fromLeft && !fromRight) {
        startRef.current = null
        return
      }

      startRef.current = {
        x: t.clientX,
        y: t.clientY,
        fromLeft,
        fromRight,
      }
    }

    const onEnd = (e: TouchEvent) => {
      const start = startRef.current
      startRef.current = null
      if (!start || lockedRef.current) return
      const t = e.changedTouches?.[0]
      if (!t) return

      const dx = t.clientX - start.x
      const dy = t.clientY - start.y

      if (Math.abs(dy) > SWIPE_MAX_DY) return
      if (Math.abs(dx) < SWIPE_MIN_DX) return
      if (Math.abs(dx) < Math.abs(dy) * 2) return

      if (start.fromLeft && dx < SWIPE_MIN_DX) return
      if (start.fromRight && dx > -SWIPE_MIN_DX) return

      lockedRef.current = true
      try {
        onBackRef.current?.()
      } finally {
        window.setTimeout(() => {
          lockedRef.current = false
        }, 500)
      }
    }

    const onCancel = () => {
      startRef.current = null
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })
    document.addEventListener('touchcancel', onCancel, { passive: true })

    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', onCancel)
    }
  }, [enabled, onBack])
}
