import type { ExamContentBlock } from '@/types'
import { resolveFileUrl } from '@/features/lessons'

export { useExamTemplatesQuery } from './hooks/useExamTemplatesQuery'

export const EXAM_LANGS = [
  { id: 1, num: 1, labelKey: 'examTemplates.langUz' },
  { id: 3, num: 2, labelKey: 'examTemplates.langKiril' },
  { id: 2, num: 3, labelKey: 'examTemplates.langRu' },
] as const

export function pickExamBlockText(
  blocks: ExamContentBlock[] | null | undefined,
): string {
  if (!Array.isArray(blocks)) return ''
  for (const b of blocks) {
    const type = Number(b.type)
    if (type === 1 && b.value) return String(b.value)
  }
  return ''
}

export function pickExamBlockImage(
  blocks: ExamContentBlock[] | null | undefined,
  fileBase: string,
): string {
  if (!Array.isArray(blocks)) return ''
  for (const b of blocks) {
    const type = Number(b.type)
    if (type === 2 && b.value) {
      return resolveFileUrl(String(b.value), fileBase)
    }
  }
  return ''
}

export function parsePercent(value: number | string | null | undefined) {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n * 10) / 10))
}
