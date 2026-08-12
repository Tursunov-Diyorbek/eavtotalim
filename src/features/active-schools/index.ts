export { useActiveSchoolsQuery } from './hooks/useActiveSchoolsQuery'

/** Qidiruv: faqat raqam bo‘lsa INN, aks holda name */
export function buildActiveSchoolsSearchParams(query: string): {
  name?: string
  inn?: string
} {
  const q = query.trim()
  if (!q) return {}
  if (/^\d+$/.test(q)) return { inn: q }
  return { name: q }
}
