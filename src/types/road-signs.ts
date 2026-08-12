import type { LessonNameLang } from './lessons'

/** Yo‘l belgilari */

export type RoadSignType = {
  id: number
  name?: LessonNameLang | null
}

export type RoadSignContentBlock = {
  type?: string | number | null
  value?: string | null
}

export type RoadSignContentLang = {
  uz?: RoadSignContentBlock[] | null
  ru?: RoadSignContentBlock[] | null
  kiril?: RoadSignContentBlock[] | null
  kr?: RoadSignContentBlock[] | null
}

export type RoadSignItem = {
  id: number
  name?: LessonNameLang | null
  image?: string | null
  content?: RoadSignContentLang | RoadSignContentBlock[] | string | null
  description?: LessonNameLang | string | null
  info?: LessonNameLang | string | null
}

export type RoadSignsPage = {
  data: RoadSignItem[]
  total_items?: number
  current_page?: number
  last_page?: number
}
