import { PATH_PREFIX_FILE_HOST } from '@/config'
import { resolveFileUrl } from '@/features/lessons'
import type {
  TextbookContentBlock,
  TextbookContentLang,
} from '@/types/textbooks'

const CARD_TONES = [
  'bg-rose',
  'bg-violet',
  'bg-signal',
  'bg-teal',
  'bg-amber',
  'bg-indigo',
] as const

const NAME_KEYS = [
  'name_uz',
  'name_kiril',
  'name_qq',
  'name_ru',
  'name_en',
] as const

function nameOrder(lang: string): readonly string[] {
  if (lang === 'ru') {
    return ['name_ru', 'name_uz', 'name_kiril', 'name_qq', 'name_en']
  }
  if (lang === 'kiril') {
    return ['name_kiril', 'name_uz', 'name_qq', 'name_ru', 'name_en']
  }
  return NAME_KEYS
}

export function pickTextbookName(value: unknown, lang: string): string {
  if (value == null) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value !== 'object') return ''
  const rec = value as Record<string, unknown>
  for (const key of nameOrder(lang)) {
    const hit = rec[key]
    if (typeof hit === 'string' && hit.trim()) return hit.trim()
  }
  return ''
}

export function capitalizeName(name: string) {
  if (!name) return ''
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function capitalLetter(name: string) {
  const ch = name.replace(/[«»"“”']/g, '').trim().charAt(0)
  return ch ? ch.toUpperCase() : '?'
}

export function textbookCardTone(id: number | string) {
  const n =
    typeof id === 'number'
      ? id
      : Array.from(String(id)).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return CARD_TONES[Math.abs(n) % CARD_TONES.length]
}

export function isActiveStatus(status: number | string | null | undefined) {
  return String(status) === '1'
}

export function pickContentField(
  block: TextbookContentBlock,
  lang: TextbookContentLang,
  kind: 'content' | 'name',
) {
  const key = `${kind}_${lang}` as keyof TextbookContentBlock
  const raw = block[key]
  if (typeof raw !== 'string') return ''
  const v = raw.trim()
  return v && v !== 'null' ? v : ''
}

export function hasLangContent(
  blocks: TextbookContentBlock[],
  lang: TextbookContentLang,
) {
  return blocks.some(
    (block) =>
      Boolean(pickContentField(block, lang, 'content')) ||
      Boolean(pickContentField(block, lang, 'name')),
  )
}

export function textbookMediaUrl(path: string) {
  return resolveFileUrl(path, PATH_PREFIX_FILE_HOST)
}
