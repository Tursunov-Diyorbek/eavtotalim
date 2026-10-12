export type AutodromeOrgGroupRow = {
  id: number
  status?: number | string | null
  organization?: {
    id?: number | null
    inn?: string | null
    name?: string | null
    name_uz?: string | null
  } | null
  group?: {
    name?: string | null
    edu_starting_date?: string | null
    edu_ending_date?: string | null
    mygov_confirmation_status?: string | null
  } | null
  edu_type?: {
    id?: number | null
    short_name?: string | null
    character_name?: string | null
    name?: string | null
  } | null
}

export type AutodromeOrgSchoolRow = {
  organization?: {
    id?: number | null
    name?: string | null
    inn?: string | null
  } | null
  total_counts?: number | string | null
  active_counts?: number | string | null
  ended_counts?: number | string | null
}

export type AutodromeGroupCounts = {
  active: number
  ended: number
}

export type GeneralEduType = {
  id: number
  short_name?: string | null
  character_name?: string | null
  name?: string | null
}
