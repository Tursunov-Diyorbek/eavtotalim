import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Ro‘yxat tabini `?tab=` da saqlaydi (`replace`).
 * Link orqali chiqib orqaga qaytganda oxirgi tab ochiq qoladi.
 */
export function useUrlTab<T extends string>(
  allowed: readonly T[],
  fallback: T,
  param = 'tab',
): [T, (next: T) => void] {
  const [params, setParams] = useSearchParams()
  const raw = params.get(param)
  const tab = (allowed.includes(raw as T) ? raw : fallback) as T

  const setTab = useCallback(
    (next: T) => {
      const nextParams = new URLSearchParams(params)
      if (next === fallback) nextParams.delete(param)
      else nextParams.set(param, next)
      setParams(nextParams, { replace: true })
    },
    [fallback, param, params, setParams],
  )

  return [tab, setTab]
}
