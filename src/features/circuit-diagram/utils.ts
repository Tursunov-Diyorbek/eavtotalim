import type { AutodromeGuideListItem } from '@/types'

export function pickAutodromeGuideTitle(
  item: AutodromeGuideListItem | null | undefined,
): string {
  if (!item) return ''
  return (
    item.name?.trim() ||
    item.edu_type?.short_name?.trim() ||
    item.edu_type?.name?.trim() ||
    ''
  )
}

export function sanitizeGuideHtml(raw: string | null | undefined): string {
  if (!raw) return ''
  return String(raw)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+=(["']).*?\1/gi, '')
    .replace(/javascript:/gi, '')
}
