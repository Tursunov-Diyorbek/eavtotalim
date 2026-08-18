import { useEffect, useState } from 'react'

/** Qidiruv API: yozish to‘xtagach shu muddat (ms) o‘tib so‘rov. */
export const SEARCH_DEBOUNCE_MS = 1000

/** Qiymat `delayMs` davomida o‘zgarmasa yangilanadi. */
export function useDebouncedValue<T>(
  value: T,
  delayMs: number = SEARCH_DEBOUNCE_MS,
): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(id)
  }, [value, delayMs])

  return debounced
}
