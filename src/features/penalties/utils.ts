import type { PenaltyCategory } from '@/types'

/** Til bo‘yicha kategoriya nomi (name_uz / name_kiril / name_ru). */
export function pickPenaltyCategoryName(
  item: PenaltyCategory | null | undefined,
  lang: string,
): string {
  if (!item) return ''
  if (lang === 'ru' && item.name_ru) return item.name_ru
  if ((lang === 'kiril' || lang === 'kr') && (item.name_kiril || item.name_kr)) {
    return item.name_kiril || item.name_kr || ''
  }
  if (item.name_uz) return item.name_uz
  return (
    item.name_kiril ||
    item.name_kr ||
    item.name_ru ||
    item.name_en ||
    item.name_qq ||
    ''
  )
}

/** API til parametri (eski front: uz / ru / kr). */
export function penaltyLangId(lang: string): string {
  if (lang === 'ru') return 'ru'
  if (lang === 'kiril' || lang === 'kr') return 'kr'
  return 'uz'
}

/** HTML body — xavfli teglarni olib tashlash, oddiy format. */
export function sanitizePenaltyHtml(raw: string | null | undefined): string {
  if (!raw) return ''
  let html = String(raw)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+=(["']).*?\1/gi, '')
    .replace(/javascript:/gi, '')

  // MathJax / oddiy matn: agar HTML teg yo‘q bo‘lsa, qatorlarni <br> ga
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(\r\n|\n|\r)/g, '<br />')
  }

  return html
}

export function stripHtmlPreview(raw: string | null | undefined, max = 160): string {
  if (!raw) return ''
  const text = String(raw)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}…`
}
