/** GET /v2/api/student-content/lessons | topics | contents */

export type LessonNameLang = {
  uz?: string | null
  ru?: string | null
  kiril?: string | null
  qq?: string | null
  en?: string | null
  kr?: string | null
}

export type StudentLessonInfo = {
  id?: number
  short_name?: string | null
  name?: LessonNameLang | null
}

export type StudentLessonItem = {
  id: number
  lesson?: StudentLessonInfo | null
}

/** Content type_id: 1 text, 2 video, 3 image, 4 audio, 5 file */
export type LessonContentTypeId = 1 | 2 | 3 | 4 | 5

export type ExamTopicTestStudentResult = {
  percent?: number | string | null
  max_result_corrects?: number | null
}

export type TopicActionLimit = {
  time_limit?: number | null
}

export type StudentTopicItem = {
  id: number
  /** 1 = oddiy mavzu (ro‘yxatda ko‘rsatiladi) */
  type?: number | null
  name?: LessonNameLang | null
  exam_topic_test_student_result?: ExamTopicTestStudentResult | null
  /** Array yoki paginated `{ data: [] }` — API shakli farq qilishi mumkin */
  exam_topics?: unknown[] | { data?: unknown[] } | null
  examTopics?: unknown[] | { data?: unknown[] } | null
  exam_topics_count?: number | null
  examTopicsCount?: number | null
  topic_action_limit?: TopicActionLimit | null
}

export type StudentTopicsPage = {
  data: StudentTopicItem[]
  total_items?: number
  current_page?: number
  last_page?: number
  per_page?: number
}

export type StudentContentItem = {
  id?: number
  type_id?: LessonContentTypeId | number | null
  content?: LessonNameLang | string | null
  /** null bo‘lmasa — mavzu saqlangan */
  saved_topic?: unknown | null
}

/** GET saved-topic — saqlangan mavzu yozuvi */
export type SavedTopicItem = {
  id: number
  topic_id?: number | null
  edu_type_lesson_id?: number | null
  name?: LessonNameLang | string | null
  name_uz?: string | null
  name_ru?: string | null
  name_kiril?: string | null
  topic?: {
    id?: number
    name?: LessonNameLang | null
    name_uz?: string | null
    name_ru?: string | null
    name_kiril?: string | null
    name_en?: string | null
    name_qq?: string | null
  } | null
}

