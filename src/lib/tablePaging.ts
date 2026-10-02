import { useSyncExternalStore } from 'react'
import { queryClient } from './queryClient'

/**
 * Sahifa / filter o‘zgarganda ro‘yxat so‘rovi yangi kalit bilan ketadi va jadvalda
 * `keepPreviousData` bilan eski qatorlar turadi (`isPlaceholderData`) — shu paytda `Table`
 * Lottie loader ko‘rsatadi. Birinchi yuklash (refresh) — skeleton, fon refetch — loadersiz.
 */
let loading = false
let unsubscribeCache: (() => void) | undefined
const listeners = new Set<() => void>()

function computeLoading() {
  return queryClient
    .getQueryCache()
    .getAll()
    .some(
      (query) =>
        query.state.fetchStatus === 'fetching' &&
        query.observers.some((observer) => observer.getCurrentResult().isPlaceholderData),
    )
}

function sync() {
  const next = computeLoading()
  if (next === loading) return
  loading = next
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!unsubscribeCache) {
    unsubscribeCache = queryClient.getQueryCache().subscribe(sync)
    loading = computeLoading()
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size) return
    unsubscribeCache?.()
    unsubscribeCache = undefined
    loading = false
  }
}

/** Jadval eski ma’lumotni ko‘rsatib, yangisini kutayotganda `true`. */
export function usePagingLoader() {
  return useSyncExternalStore(
    subscribe,
    () => loading,
    () => false,
  )
}

const STORAGE_PREFIX = 'table_page:'

export type StoredPaging = { page: number; size?: number }

export function readStoredPaging(key: string): StoredPaging | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredPaging
    const page = Number(parsed?.page)
    if (!Number.isInteger(page) || page < 1) return null
    const size = Number(parsed?.size)
    return { page, size: Number.isInteger(size) && size > 0 ? size : undefined }
  } catch {
    return null
  }
}

export function writeStoredPaging(key: string, value: StoredPaging) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch {
    // ignore quota
  }
}
