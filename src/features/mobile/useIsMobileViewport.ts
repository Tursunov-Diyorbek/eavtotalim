import { useEffect, useState } from 'react'

const DEFAULT_MAX = 700

/** Eski Mobile: window.innerWidth <= 700 */
export function useIsMobileViewport(maxWidth = DEFAULT_MAX): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= maxWidth : false,
  )

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= maxWidth)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [maxWidth])

  return isMobile
}
