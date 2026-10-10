export type TeacherLangName = {
  name?: string | null
  name_uz?: string | null
  name_ru?: string | null
  name_kiril?: string | null
}

export type TeacherHandout = {
  id?: number
  topic?: TeacherLangName | null
}

export type TeacherLesson = {
  start_time?: string | null
  end_time?: string | null
  group?: TeacherLangName | null
  handouts?: TeacherHandout[] | null
}

export type TeacherScheduleDay = {
  date?: string | null
  lessons?: TeacherLesson[] | null
}

export type TeacherGroupCard = {
  id?: number
  name_uz?: string | null
  name_ru?: string | null
  name_kiril?: string | null
  status?: number | null
  edu_starting_date?: string | null
  edu_ending_date?: string | null
  education_price?: number | string | null
  edu_type?: {
    short_name_uz?: string | null
    short_name_ru?: string | null
    short_name_kiril?: string | null
    practical_hours?: number | string | null
    theoretical_hours?: number | string | null
  } | null
}
