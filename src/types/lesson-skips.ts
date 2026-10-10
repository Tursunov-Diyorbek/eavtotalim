export type LessonSkipGroup = {
  id?: number | string
  name?: string | null
  name_uz?: string | null
  name_kiril?: string | null
  name_ru?: string | null
  name_en?: string | null
  name_qq?: string | null
}

export type LessonSkipRow = {
  id?: number | string
  first_name?: string | null
  last_name?: string | null
  middle_name?: string | null
  group?: LessonSkipGroup | null
  monitoring_relation_count?: number | string | null
}

export type LessonSkipTopic = {
  name?: string | { body?: string | null } | null
  name_uz?: string | null
  name_kiril?: string | null
  name_ru?: string | null
  name_en?: string | null
  name_qq?: string | null
}

export type LessonSkipDetail = {
  value?: string | null
  class_date?: {
    start_time?: string | null
    handouts?: Array<{ topic?: LessonSkipTopic | null }> | null
  } | null
}
