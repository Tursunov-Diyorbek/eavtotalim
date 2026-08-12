import type { LessonNameLang } from './lessons'

/** GET /my-profile/absences — bitta qoldirilgan dars bloki */

export type MissedClassHandoutTopic = {
  id?: number
  name?: LessonNameLang | null
  lesson?: {
    id?: number
    short_name?: string | null
    name?: LessonNameLang | null
  } | null
  topic_action_limit?: {
    time_limit?: number | null
  } | null
}

export type MissedClassHandout = {
  id?: number
  hours?: number | string | null
  topic?: MissedClassHandoutTopic | null
}

export type MissedClassAbsenceItem = {
  id?: number
  date_time?: string | null
  handouts?: MissedClassHandout[] | null
}

/** GET /students/:id/absence-reason-applications */

export type AbsenceReasonStatus = 'approved' | 'rolled_back' | string

export type AbsenceReasonApplication = {
  id?: number
  from_date?: string | null
  to_date?: string | null
  reason?: string | null
  description?: string | null
  status?: AbsenceReasonStatus | null
  lesson_count?: number | null
  document_url?: string | null
}
