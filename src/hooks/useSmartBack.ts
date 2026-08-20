import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'

const STORAGE_KEY = 'eavt.nav-stack'
const MAX = 50

function hrefOf(pathname: string, search: string) {
  return `${pathname}${search}`
}

function readStack(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

function writeStack(stack: string[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack.slice(-MAX)))
  } catch {
    /* ignore quota */
  }
}

/**
 * SPA ichidagi sahifa tarixini yozadi (tab `replace` ni bir yozuvda saqlaydi).
 * `idx` yo‘q routerlarda ham «Orqaga» kirgan sahifaga qaytadi.
 */
export function NavigationHistoryTracker() {
  const location = useLocation()
  const navType = useNavigationType()
  const href = hrefOf(location.pathname, location.search)

  useEffect(() => {
    const stack = readStack()
    if (navType === 'POP') {
      const idx = stack.lastIndexOf(href)
      writeStack(idx >= 0 ? stack.slice(0, idx + 1) : [...stack, href])
      return
    }
    if (navType === 'REPLACE') {
      writeStack(stack.length === 0 ? [href] : [...stack.slice(0, -1), href])
      return
    }
    if (stack[stack.length - 1] !== href) writeStack([...stack, href])
  }, [href, navType])

  return null
}

function routerHistoryIndex() {
  const state = window.history.state as { idx?: number } | null
  return typeof state?.idx === 'number' ? state.idx : null
}

/**
 * «Orqaga»: qaysi sahifadan kirilgan bo‘lsa o‘sha yerda qoladi.
 * Ichki tarix bo‘lmasa (to‘g‘ridan-to‘g‘ri URL) — `fallback`.
 */
export function useSmartBack(fallback: string) {
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(() => {
    const current = hrefOf(location.pathname, location.search)
    const stack = readStack()
    const last = stack[stack.length - 1]
    const hasInAppPrev =
      stack.length > 1 && (last === current || stack.includes(current))
    const idx = routerHistoryIndex()
    if (hasInAppPrev || (idx != null && idx > 0)) {
      navigate(-1)
      return
    }
    navigate(fallback)
  }, [fallback, location.pathname, location.search, navigate])
}
