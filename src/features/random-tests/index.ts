export { useRandomTestLatestQuery } from './hooks/useRandomTestLatestQuery'
export { EXAM_LANGS, parsePercent } from '@/features/exam-templates'

export const RANDOM_LIMITS = [
  { value: 1 as const, count: 20 },
  { value: 2 as const, count: 50 },
  { value: 3 as const, count: 100 },
]
