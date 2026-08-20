export type TextbookLessonItem = {
  id: number
  name_uz?: string | null
  name_kiril?: string | null
  name_qq?: string | null
  name_ru?: string | null
  name_en?: string | null
  edu_types_count?: number | string | null
  status?: number | string | null
  updated_at?: string | null
}

export type TextbookNamed = {
  id?: number
  name_uz?: string | null
  name_kiril?: string | null
  name_qq?: string | null
  name_ru?: string | null
  name_en?: string | null
}

export type TextbookEduTypeItem = {
  id: number
  chapters_count?: number | string | null
  topics_count?: number | string | null
  edu_type?: TextbookNamed | null
  lesson?: TextbookNamed | null
}

export type TextbookTopicItem = {
  id: number
  name_uz?: string | null
  name_kiril?: string | null
  name_qq?: string | null
  name_ru?: string | null
  name_en?: string | null
  status?: number | string | null
}

export type TextbookContentLang = 'uz' | 'kiril' | 'qq' | 'ru' | 'en'

export type TextbookContentBlock = {
  id?: number
  type_id?: number | string | null
  content_uz?: string | null
  content_kiril?: string | null
  content_qq?: string | null
  content_ru?: string | null
  content_en?: string | null
  name_uz?: string | null
  name_kiril?: string | null
  name_qq?: string | null
  name_ru?: string | null
  name_en?: string | null
}

export type TextbookEduTypesState = {
  name?: string
}

export type TextbookTopicsState = {
  subject_name?: string
  subject_id?: number | string
  lesson_name?: string
  edutype_name?: string
}

export type TextbookViewState = TextbookTopicsState & {
  lesson_id?: number | string
  chapter_name?: string
  name_topic?: string
}
