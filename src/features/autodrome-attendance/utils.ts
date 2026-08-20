import { parseWeekDays } from '@/features/groups'

const DAY_LABELS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'] as const

export function formatAutodromeWeekDays(
  value: string | number[] | null | undefined,
): string {
  const days = parseWeekDays(value)
  if (!days.length) return '—'
  return days.map((day) => DAY_LABELS[day - 1] ?? String(day)).join(', ')
}

/** admin-attendance hostida `/media/` prefiksi bo‘lmasa qo‘shish. */
export function ensureAttendanceMediaUrl(url: string | null | undefined): string {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    if (
      parsed.hostname.includes('admin-attendance') &&
      !parsed.pathname.startsWith('/media/')
    ) {
      parsed.pathname = `/media${parsed.pathname}`
      return parsed.toString()
    }
  } catch {
    return url
  }
  return url
}
