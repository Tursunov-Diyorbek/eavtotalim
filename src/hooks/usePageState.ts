import { useCallback, useState, type SetStateAction } from 'react'
import { useLocation } from 'react-router-dom'

const PREFIX = 'page_state:'

function read<T>(key: string, fallback: () => T): T {
  try {
    const raw = sessionStorage.getItem(key)
    if (raw != null) return JSON.parse(raw) as T
  } catch {
    // ignore
  }
  return fallback()
}

function write(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota
  }
}

/**
 * Filter holati uchun `useState` o‘rnini bosadi: qiymat sessionStorage da (route + tab bo‘yicha)
 * saqlanadi — refresh, sahifa almashishi va show dan «orqaga» qaytganda tiklanadi.
 * `name` — sahifa ichida unikal (masalan `'fio'`, `'groupId'`). Sahifa raqami/o‘lchami — `Pagination` da.
 */
export function usePageState<T>(name: string, initial: T | (() => T)) {
  const { pathname, search } = useLocation()
  const key = `${PREFIX}${pathname}${search}#${name}`
  const fallback = () =>
    typeof initial === 'function' ? (initial as () => T)() : initial

  const [state, setState] = useState(() => ({ key, value: read(key, fallback) }))

  let current = state
  if (state.key !== key) {
    current = { key, value: read(key, fallback) }
    setState(current)
  }

  const set = useCallback((next: SetStateAction<T>) => {
    setState((prev) => {
      const value =
        typeof next === 'function' ? (next as (value: T) => T)(prev.value) : next
      write(prev.key, value)
      return { key: prev.key, value }
    })
  }, [])

  return [current.value, set] as const
}
