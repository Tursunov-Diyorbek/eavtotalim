const DAY_LABELS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sh', 'Ya'] as const

export function parseWeekDays(value: string | number[] | null | undefined): number[] {
  if (Array.isArray(value)) {
    return value.map(Number).filter((n) => n >= 1 && n <= 7)
  }
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as unknown
    if (Array.isArray(parsed)) {
      return parsed.map(Number).filter((n) => n >= 1 && n <= 7)
    }
  } catch {
    return []
  }
  return []
}

export function formatWeekDays(value: string | number[] | null | undefined): string {
  const days = parseWeekDays(value)
  if (!days.length) return '—'
  return days.map((d) => DAY_LABELS[d - 1] ?? String(d)).join(' ')
}

export type GaiStatus = 'notSent' | 'approved' | 'rejected' | 'waiting'

/** `check_gai`: 0 — yuborilmagan, 1 — tasdiqlangan, 2 — rad etilgan, aks holda kutilmoqda. */
export function gaiStatusOf(value: number | string | null | undefined): GaiStatus {
  const code = Number(value)
  if (!Number.isFinite(code) || code === 0) return 'notSent'
  if (code === 1) return 'approved'
  if (code === 2) return 'rejected'
  return 'waiting'
}

/** Davomat foizi bo‘yicha rang: <70 qizil, <90 sariq, aks holda yashil. */
export function groupAttendanceTone(percent: number): 'rose' | 'amber' | 'teal' {
  if (percent < 70) return 'rose'
  if (percent < 90) return 'amber'
  return 'teal'
}

export function formatLessonTime(
  start?: string | null,
  end?: string | null,
): string | null {
  const a = start?.slice(0, 5)
  const b = end?.slice(0, 5)
  if (!a && !b) return null
  if (a && b) return `${a} – ${b}`
  return a ?? b ?? null
}
