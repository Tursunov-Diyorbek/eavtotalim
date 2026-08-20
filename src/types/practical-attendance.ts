export type PracticalLessonDays = {
  theoretical?: Array<string | number> | null
  practical?: Array<string | number> | null
}

export type PracticalAttendanceGroup = {
  id: number
  name?: string | null
  edu_starting_date?: string | null
  edu_ending_date?: string | null
  edu_status?: number | string | null
  lesson_days?: PracticalLessonDays | null
  students?: {
    practical_started?: number | string | null
    total?: number | string | null
  } | null
  organization?: {
    id?: number | null
    inn?: string | null
    name?: string | null
  } | null
}

export type PracticalDayItem = {
  date?: string | null
  time?: string | null
}

export type PracticalAttendanceStudent = {
  id: number
  full_name?: string | null
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  practical_attendance?: {
    has_started?: boolean | number | null
    count?: number | string | null
    items?: PracticalDayItem[] | null
  } | null
}
