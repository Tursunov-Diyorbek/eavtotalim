import { useCallback, useEffect, useRef, useState } from 'react'

const PULL_THRESHOLD = 72
const MAX_PULL = 110

/** Mobil: tepadan pastga tortib refresh. */
export function usePullToRefresh(
  onRefresh: (() => void | Promise<void>) | undefined,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const pullingRef = useRef(false)
  const pullRef = useRef(0)
  const onRefreshRef = useRef(onRefresh)

  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    pullRef.current = pull
  }, [pull])

  const getScrollTop = () => {
    const content = document.querySelector('.sm-content')
    if (content) return (content as HTMLElement).scrollTop
    return window.scrollY || document.documentElement.scrollTop || 0
  }

  const doRefresh = useCallback(async () => {
    if (refreshing) return
    setRefreshing(true)
    setPull(PULL_THRESHOLD)
    try {
      if (typeof onRefreshRef.current === 'function') {
        await Promise.resolve(onRefreshRef.current())
      } else {
        window.location.reload()
        return
      }
    } finally {
      window.setTimeout(() => {
        setRefreshing(false)
        setPull(0)
      }, 500)
    }
  }, [refreshing])

  useEffect(() => {
    if (!enabled) return undefined

    const onStart = (e: TouchEvent) => {
      if (refreshing) return
      const t = e.touches?.[0]
      if (!t) return
      if (getScrollTop() > 2) {
        startRef.current = null
        return
      }
      startRef.current = { x: t.clientX, y: t.clientY }
      pullingRef.current = false
    }

    const onMove = (e: TouchEvent) => {
      const start = startRef.current
      const t = e.touches?.[0]
      if (!start || !t || refreshing) return

      const dy = t.clientY - start.y
      const dx = t.clientX - start.x

      if (getScrollTop() > 2) {
        startRef.current = null
        pullingRef.current = false
        setPull(0)
        return
      }

      if (dy > 10 && Math.abs(dy) > Math.abs(dx) * 1.2) {
        pullingRef.current = true
        setPull(Math.min(MAX_PULL, dy * 0.55))
      }
    }

    const onEnd = () => {
      const wasPulling = pullingRef.current
      const amount = pullRef.current
      startRef.current = null
      pullingRef.current = false

      if (!wasPulling) {
        setPull(0)
        return
      }

      if (amount >= PULL_THRESHOLD && !refreshing) {
        void doRefresh()
      } else {
        setPull(0)
      }
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })
    document.addEventListener('touchcancel', onEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', onEnd)
    }
  }, [enabled, refreshing, doRefresh])

  return {
    pull,
    refreshing,
    ready: pull >= PULL_THRESHOLD,
  }
}
