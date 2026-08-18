import type {
  LessonNameLang,
  RoadSignContentBlock,
  RoadSignContentLang,
  RoadSignItem,
} from '@/types'
import { pickLocalized } from '@/features/lessons'

function coerceToList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    // PHP array → JSON object { "0": {...}, "1": {...} }
    const keys = Object.keys(obj)
    if (
      keys.length > 0 &&
      keys.every((k) => /^\d+$/.test(k)) &&
      keys.some((k) => {
        const v = obj[k]
        return v && typeof v === 'object'
      })
    ) {
      return keys
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => obj[k])
    }
  }
  return [raw]
}

function normalizeBlocks(raw: unknown): RoadSignContentBlock[] {
  if (raw == null || raw === '') return []

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return []
    try {
      return normalizeBlocks(JSON.parse(trimmed) as unknown)
    } catch {
      return [{ type: '1', value: trimmed }]
    }
  }

  const list = coerceToList(raw)

  // Single lang-object mistaken as list of one — handled by pickRoadSignContent
  return list
    .map((item) => {
      if (item == null) return null
      if (typeof item === 'string') {
        return item.trim() ? { type: '1', value: item } : null
      }
      if (typeof item !== 'object') return null
      const obj = item as Record<string, unknown>
      // Skip if this looks like lang map { uz, ru } not a block
      if (
        ('uz' in obj || 'ru' in obj || 'kiril' in obj) &&
        !('value' in obj) &&
        !('type' in obj)
      ) {
        return null
      }
      const value =
        (typeof obj.value === 'string' && obj.value) ||
        (typeof obj.text === 'string' && obj.text) ||
        (typeof obj.message === 'string' && obj.message) ||
        (typeof obj.description === 'string' && obj.description) ||
        ''
      const type = obj.type ?? obj.content_type ?? '1'
      if (!value && ['1', 'text', ''].includes(String(type))) return null
      return {
        type: type as string | number,
        value,
      }
    })
    .filter((b) => b != null) as RoadSignContentBlock[]
}

/**
 * API `content` turli shakllarda keladi:
 * - { uz: Block[], ru, kiril }
 * - Block[] (Accept-Language bo‘yicha)
 * - JSON string
 * - oddiy matn
 */
export function pickRoadSignContent(
  content: RoadSignItem['content'] | unknown,
  lang: string,
): RoadSignContentBlock[] {
  if (content == null || content === '') return []

  if (typeof content === 'string') {
    const trimmed = content.trim()
    if (!trimmed) return []
    try {
      return pickRoadSignContent(JSON.parse(trimmed) as unknown, lang)
    } catch {
      return [{ type: '1', value: trimmed }]
    }
  }

  if (Array.isArray(content)) {
    return normalizeBlocks(content)
  }

  if (typeof content === 'object') {
    const obj = content as RoadSignContentLang & Record<string, unknown>
    const order =
      lang === 'ru'
        ? (['ru', 'uz', 'kiril', 'kr'] as const)
        : lang === 'kiril' || lang === 'kr'
          ? (['kiril', 'kr', 'uz', 'ru'] as const)
          : (['uz', 'kiril', 'kr', 'ru'] as const)

    for (const key of order) {
      const blocks = normalizeBlocks(obj[key])
      if (blocks.length > 0) return blocks
    }

    // Bitta blok obyekt sifatida
    if ('value' in obj || 'type' in obj || 'text' in obj) {
      return normalizeBlocks([obj])
    }
  }

  return []
}

/** content bo‘sh bo‘lsa description/info dan matn */
export function pickRoadSignFallbackText(
  item: RoadSignItem | null | undefined,
  lang: string,
): string {
  if (!item) return ''
  for (const field of [item.description, item.info]) {
    if (!field) continue
    if (typeof field === 'string' && field.trim()) return field.trim()
    const localized = pickLocalized(field as LessonNameLang, lang)
    if (localized.trim()) return localized.trim()
  }
  return ''
}

export function pickRoadSignName(
  name: LessonNameLang | null | undefined,
  lang: string,
) {
  return pickLocalized(name, lang) || '—'
}

/**
 * Tur kartasi namuna rasmlari.
 * Fayllar `back.intalim.uz` da 404; eski front `back.eavtotalim.uz` ishlatadi.
 */
export const ROAD_SIGN_FILE_HOST = 'https://back.eavtotalim.uz/'

export const ROAD_SIGN_TYPE_THUMBS = [
  'files/road_sign/1.1.gif',
  'files/road_sign/2.1.gif',
  'files/road_sign/3.1.gif',
  'files/road_sign/4.1.1.gif',
  'files/road_sign/5.1.gif',
  'files/road_sign/6.1.gif',
  'files/road_sign/7.1.1.gif',
] as const

export function roadSignTypeThumbUrl(index: number): string | null {
  const rel = ROAD_SIGN_TYPE_THUMBS[index]
  if (!rel) return null
  return `${ROAD_SIGN_FILE_HOST}${rel}`
}

/** API rasm URL — relative bo‘lsa file hostga ulash */
export function roadSignImageUrl(
  image: string | null | undefined,
  fallbackBase: string,
): string {
  if (!image) return ''
  if (/^https?:\/\//i.test(image) || image.startsWith('blob:')) {
    if (image.includes('back.intalim.uz') && image.includes('road_sign')) {
      return image
        .replace('http://back.intalim.uz/', ROAD_SIGN_FILE_HOST)
        .replace('https://back.intalim.uz/', ROAD_SIGN_FILE_HOST)
    }
    return image
  }
  const base = fallbackBase.endsWith('/') ? fallbackBase : `${fallbackBase}/`
  const rel = image.startsWith('/') ? image.slice(1) : image
  if (rel.includes('road_sign') || rel.includes('road-sign')) {
    return `${ROAD_SIGN_FILE_HOST}${rel}`
  }
  return `${base}${rel}`
}
