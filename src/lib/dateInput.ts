/** ISO YYYY-MM-DD → DD.MM.YYYY */
export function isoToDisplayDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const m = String(iso).trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[3]}.${m[2]}.${m[1]}`
  const dmy = String(iso).trim().match(/^(\d{2})[./-](\d{2})[./-](\d{4})/)
  if (dmy) return `${dmy[1]}.${dmy[2]}.${dmy[3]}`
  return ''
}

function digitsOfDate(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 8)
}

function isValidYmd(yyyy: string, mm: string, dd: string): boolean {
  const y = Number(yyyy)
  const m = Number(mm)
  const d = Number(dd)
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return false
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
}

/** DD.MM.YYYY / ISO dan YYYY-MM-DD. Bo‘sh → ''; noto‘g‘ri → null. */
export function displayToIsoDate(raw: string | null | undefined): string | null {
  if (raw == null || raw === '') return ''
  const trimmed = String(raw).trim()
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return isValidYmd(iso[1], iso[2], iso[3]) ? `${iso[1]}-${iso[2]}-${iso[3]}` : null
  const d = digitsOfDate(trimmed)
  if (d.length !== 8) return null
  const dd = d.slice(0, 2)
  const mm = d.slice(2, 4)
  const yyyy = d.slice(4, 8)
  return isValidYmd(yyyy, mm, dd) ? `${yyyy}-${mm}-${dd}` : null
}

export function formatDateDigits(digits: string): string {
  const d = digitsOfDate(digits)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}.${d.slice(2)}`
  return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4)}`
}
