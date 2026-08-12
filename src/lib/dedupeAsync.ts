/**
 * Bir xil so‘rov parallel ketmasligi uchun in-flight promise ulashadi.
 * React StrictMode mount x2 bo‘lsa ham tarmoqda 1 marta ketadi.
 */
export function dedupeAsync<T>(
  key: string,
  store: Map<string, Promise<T>>,
  factory: () => Promise<T>,
): Promise<T> {
  const existing = store.get(key)
  if (existing) return existing

  const promise = factory().finally(() => {
    store.delete(key)
  })
  store.set(key, promise)
  return promise
}
