const PREFIX = '998'
const LOCAL_LEN = 9

/** Faqat 9 ta mahalliy raqam (998 dan keyin). */
export function parsePhoneDigits(raw: string | null | undefined): string {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.startsWith(PREFIX)) return digits.slice(PREFIX.length, PREFIX.length + LOCAL_LEN)
  if (digits.startsWith('8') && digits.length > LOCAL_LEN) {
    return digits.slice(1, 1 + LOCAL_LEN)
  }
  return digits.slice(0, LOCAL_LEN)
}

/** Ko‘rinish: (93) 465-88-44 */
export function formatPhoneLocal(digits: string): string {
  const d = parsePhoneDigits(digits)
  if (!d) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 5) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2, 5)}-${d.slice(5)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7, 9)}`
}

/** API qiymati: +998XXXXXXXXX */
export function toPhoneValue(raw: string | null | undefined): string {
  const d = parsePhoneDigits(raw)
  return d ? `+${PREFIX}${d}` : ''
}

export function isPhoneComplete(raw: string | null | undefined): boolean {
  return parsePhoneDigits(raw).length === LOCAL_LEN
}
