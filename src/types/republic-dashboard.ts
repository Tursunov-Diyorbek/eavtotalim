export type RegionLang = {
  uz?: string | null
  ru?: string | null
  kiril?: string | null
  qq?: string | null
  en?: string | null
}

export type RegionDailyRow = {
  region: {
    id: number
    name?: string | null
    lang?: RegionLang | null
  }
  all_organizations_count: number
  active_organizations_count: number
  active_groups_count: number
  today_has_lesson_groups_count: number
  active_students_count: number
  today_has_lesson_students_count: number
  absent_students_count: number
  absent_percent: number | null
}

export type SuperiorMode = {
  operating_mode_id: number
  count: number
}

export type SuperiorOrgRow = {
  superior_organization_id: number
  name: string
  total_count: number
  active: number
  reformed: number
  suspended: number
}
