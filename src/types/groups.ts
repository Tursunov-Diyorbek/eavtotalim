/** GET v2 /groups */

export type GroupEduStatusTab = 'all' | '0' | '1' | '2'

export type GroupEduType = {
  id?: number
  short_name?: string | null
  character_name?: string | null
}

export type GroupOrganization = {
  id?: number
  name?: string | null
  inn?: string | null
}

export type GroupItem = {
  id: number
  name?: string | null
  name_uz?: string | null
  edu_type?: GroupEduType | null
  grouped_students_count?: number | null
  education_price?: number | string | null
  edu_starting_date?: string | null
  edu_ending_date?: string | null
  start_time?: string | null
  end_time?: string | null
  week_days?: string | number[] | null
  edu_status?: number | string | null
  organization?: GroupOrganization | null
}

export type GroupCounts = {
  all?: number
  active?: number
  finished?: number
  new?: number
}

export type GroupsFilters = {
  page: number
  showCount: number
  eduStatus: GroupEduStatusTab
  name?: string
  eduTypeId?: number | null
  timetable?: string
  weekDays?: number[]
  startTime?: string
  endTime?: string
  sortKey?: string
  sortOrder?: 'ASC' | 'DESC'
}

export type CreateGroupPayload = {
  name_uz: string
  education_price: number | string
  start_time: string
  end_time: string
  edu_starting_date: string
  lang_id: number
  edu_type_id: number
  week_days: string[]
  practical_start_time: string
  practical_end_time: string
  practical_week_days: string[]
  part_number: string
  part_additional?: string
}

export type UpdateGroupPayload = {
  name_uz?: string
  education_price?: number | string
  start_time?: string
  end_time?: string
  week_days?: string[]
  practical_start_time?: string
  practical_end_time?: string
  practical_week_days?: string[]
}

export type GroupsPageData = {
  data: GroupItem[]
  total_items: number
  last_page: number
}
