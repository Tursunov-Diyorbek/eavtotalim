import type { ExamAnswer, ExamContentBlock } from './exam-templates'

/** GET /get-all-questions-by-language/:langId */

export type AllTestQuestion = {
  id: number
  body?: ExamContentBlock[] | null
  answers?: ExamAnswer[] | null
  answer_description?: string | null
  answer_video?: string | null
}

export type AllTestsPage = {
  data: AllTestQuestion[]
  total_items: number
  current_page?: number
  last_page?: number
}

export type AllTestsQueryParams = {
  langId: number
  page?: number
  showCount?: number
  search?: string
}
