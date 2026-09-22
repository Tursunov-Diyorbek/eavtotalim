import type { LessonNameLang, SavedTopicItem, StudentTopicItem } from '@/types'

/** API ba’zan array, ba’zan `{ data: [] }` qaytaradi (eski mobile LessonView). */
export function getExamTopics(
  topic: StudentTopicItem | null | undefined,
): unknown[] | null {
  if (!topic) return null
  const raw = topic.exam_topics ?? topic.examTopics
  if (raw == null) return null
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'object' && Array.isArray(raw.data)) return raw.data
  return null
}

/**
 * Mavzuda test bormi.
 * - count kelgan bo‘lsa — shunga qarab
 * - array/paginated data — length > 0
 * - field yo‘q (relation yuklanmagan) — eski desktop kabi: true (test tugmasi ochiq)
 */
export function topicHasTest(
  topic: StudentTopicItem | null | undefined,
): boolean {
  if (!topic) return false
  const count = topic.exam_topics_count ?? topic.examTopicsCount
  if (typeof count === 'number') return count > 0
  const exams = getExamTopics(topic)
  if (Array.isArray(exams)) return exams.length > 0
  // undefined/null — eski StudentSubjectView: length === 0 emas → tugma faol
  return true
}

/** Til bo‘yicha lokalizatsiya (uz / kiril / ru). */
export function pickLocalized(
  name: LessonNameLang | string | null | undefined,
  lang: string,
): string {
  if (name == null) return ''
  if (typeof name === 'string') return name

  if (lang === 'ru' && name.ru) return name.ru
  if ((lang === 'kiril' || lang === 'kr') && (name.kiril || name.kr)) {
    return name.kiril || name.kr || ''
  }
  if (name.uz) return name.uz
  return name.kiril || name.kr || name.ru || ''
}

/** Media yo‘lini to‘liq URL ga aylantirish. */
export function resolveFileUrl(path: string | null | undefined, base: string) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:')) return path
  const root = base.endsWith('/') ? base : `${base}/`
  const rel = path.startsWith('/') ? path.slice(1) : path
  return `${root}${rel}`
}

export function secondsToHms(totalSeconds: number | null | undefined) {
  const sec = Math.max(0, Math.floor(Number(totalSeconds) || 0))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function parsePercent(value: number | string | null | undefined) {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value)
  if (Number.isNaN(n)) return 0
  return Math.round(n * 10) / 10
}

/** Saqlangan yozuvdagi haqiqiy topic id */
export function resolveSavedTopicId(item: SavedTopicItem): number | null {
  const id = item.topic_id ?? item.topic?.id ?? null
  return id != null ? Number(id) : null
}

/** Saqlangan mavzu nomi (turli API shakllari). */
export function pickSavedTopicTitle(item: SavedTopicItem, lang: string): string {
  if (item.topic?.name) {
    const n = pickLocalized(item.topic.name, lang)
    if (n) return n
  }

  const flatTopic = item.topic
  if (flatTopic) {
    const fromFlat: LessonNameLang = {
      uz: flatTopic.name_uz,
      ru: flatTopic.name_ru,
      kiril: flatTopic.name_kiril,
      en: flatTopic.name_en,
      qq: flatTopic.name_qq,
    }
    const n = pickLocalized(fromFlat, lang)
    if (n) return n
  }

  if (typeof item.name === 'string' && item.name) return item.name
  if (item.name && typeof item.name === 'object') {
    const n = pickLocalized(item.name, lang)
    if (n) return n
  }

  const fromItem: LessonNameLang = {
    uz: item.name_uz,
    ru: item.name_ru,
    kiril: item.name_kiril,
  }
  return pickLocalized(fromItem, lang) || '—'
}
