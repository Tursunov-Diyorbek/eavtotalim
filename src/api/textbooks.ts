import { assertOk, unwrapPage, type ApiPage } from '@/lib/apiPage'
import type {
  TextbookContentBlock,
  TextbookEduTypeItem,
  TextbookTopicItem,
} from '@/types/textbooks'
import { apiClient, withAccessToken } from './client'

export class TextbookAgreementError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TextbookAgreementError'
  }
}

function assertTextbookOk(res: {
  status?: number | boolean | string
  message?: string
}) {
  if (String(res.status) === '4') {
    throw new TextbookAgreementError(res.message || '')
  }
  assertOk(res)
}

export type FetchTextbookTopicsArgs = {
  eduTypeLessonId: string
  page: number
  showCount: number
  status: string
  word?: string
}

/** GET /textbook-show?lesson_id= — fan ostidagi ta'lim toifalari. */
export async function fetchTextbookEduTypes(
  lessonId: string,
): Promise<TextbookEduTypeItem[]> {
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken(
      `/textbook-show?lesson_id=${encodeURIComponent(lessonId)}`,
    ),
  )
  assertTextbookOk(res)
  return unwrapPage<TextbookEduTypeItem>(res).data
}

/** GET /chapters-by-edutype-lesson — mavzular ro‘yxati. */
export async function fetchTextbookTopics(
  args: FetchTextbookTopicsArgs,
): Promise<ApiPage<TextbookTopicItem>> {
  const extra = new URLSearchParams({
    edu_type_lesson_id: args.eduTypeLessonId,
    show_count: String(args.showCount),
    page: String(args.page),
    status: args.status,
  })
  if (args.word) extra.set('word', args.word)

  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken(`/chapters-by-edutype-lesson?${extra.toString()}`),
  )
  assertTextbookOk(res)
  return unwrapPage<TextbookTopicItem>(res, args.page, args.showCount)
}

/** POST /content-show — mavzu kontenti. */
export async function fetchTextbookContent(
  topicId: string,
): Promise<TextbookContentBlock[]> {
  const form = new FormData()
  form.append('topic_id', topicId)
  const res = await apiClient.postForm<Record<string, unknown>>(
    withAccessToken('/content-show'),
    form,
  )
  assertTextbookOk(res)
  if (Array.isArray(res.data)) return res.data as TextbookContentBlock[]
  const page = unwrapPage<TextbookContentBlock>(res)
  return page.data
}
