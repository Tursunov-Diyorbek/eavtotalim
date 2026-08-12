/** GET /random-test/latest-result */

export type RandomTestLatestResult = {
  correct_answers_count?: number | null
  incorrect_answers_count?: number | null
  question_count?: number | null
  percent?: number | string | null
  created_at?: string | null
  updated_at?: string | null
}

/** location.state / sessionStorage — aralash test start */
export type RandomTestStartParams = {
  lang_id: number
  /** 1 → 20, 2 → 50, 3 → 100 */
  limit: 1 | 2 | 3
  random: boolean
  /** Eski front: isType 11 */
  isType: 11
}

export function randomLimitToCount(limit: 1 | 2 | 3): number {
  if (limit === 2) return 50
  if (limit === 3) return 100
  return 20
}
