/** GET v2 /groups/with-student-class-dates */

export type ExtraLessonGroup = {
  id: number
  name?: string | null
  name_uz?: string | null
  edu_status?: number | string | null
  edu_starting_date?: string | null
  edu_ending_date?: string | null
  start_time?: string | null
  end_time?: string | null
  students_with_class_dates_count?: number | string | null
  edu_type?: {
    short_name?: string | null
    character_name?: string | null
    name?: string | null
    name_uz?: string | null
  } | null
  organization?: {
    name?: string | null
    inn?: string | null
  } | null
}
