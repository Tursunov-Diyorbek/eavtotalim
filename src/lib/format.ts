const LOCALE_MAP: Record<string, string> = {
  uz: 'uz-UZ',
  kiril: 'uz-UZ',
  ru: 'ru-RU',
}

/** ISO sanani joriy tilda o‘qiladigan ko‘rinishga o‘tkazadi. */
export function formatDateTime(
  value: string | null | undefined,
  lang = 'uz',
): string | null {
  if (!value) return null
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(LOCALE_MAP[lang] ?? 'uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** Faqat sana (kun.oy.yil). */
export function formatDate(
  value: string | null | undefined,
  lang = 'uz',
): string | null {
  if (!value) return null
  const date = new Date(value.includes('T') || value.includes(' ')
    ? value.replace(' ', 'T')
    : `${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(LOCALE_MAP[lang] ?? 'uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

/** Username / ismdan 2 harfli avatar matni. */
export function initialsOf(value: string | null | undefined): string {
  if (!value) return '—'
  const clean = value.replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  if (!clean) return '—'
  const parts = clean.split(/\s+/)
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase()
}

/** F.I.O. yig‘indi. */
export function fullNameOf(parts: {
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
} | null | undefined): string | null {
  if (!parts) return null
  const name = [parts.last_name, parts.first_name, parts.middle_name]
    .filter(Boolean)
    .join(' ')
    .trim()
  return name || null
}

/** Raqamni minglik ajratgich bilan. */
export function formatNumber(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : Number(value ?? 0)
  if (!Number.isFinite(n)) return '0'
  return new Intl.NumberFormat('uz-UZ').format(n)
}

/** Backend `null` / `"null"` / bo‘sh qiymat. */
export function isFilled(value: unknown): value is string | number {
  if (value == null) return false
  if (typeof value === 'string') {
    const v = value.trim()
    return v.length > 0 && v !== 'null'
  }
  return true
}
