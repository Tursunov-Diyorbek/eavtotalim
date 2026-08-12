import type { LessonNameLang } from './lessons'

/** GET /v2/api/my-time-table */

export type ScheduleHandout = {
  id?: number
  topic?: {
    id?: number
    name?: LessonNameLang | null
  } | null
}

export type ScheduleDayItem = {
  id: number
  start_time?: string | null
  end_time?: string | null
  handouts?: ScheduleHandout[] | null
}
