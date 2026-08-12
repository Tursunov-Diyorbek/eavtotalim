/** GET /general/licensed-organizations */

export type ActiveSchoolAddress = {
  region?: string | null
  area?: string | null
  details?: string | null
}

export type ActiveSchoolEduType = {
  id?: number
  code?: string | null
  name?: string | null
}

export type ActiveSchoolItem = {
  id?: number
  name?: string | null
  inn?: string | null
  address?: ActiveSchoolAddress | null
  edu_types?: ActiveSchoolEduType[] | null
}

export type ActiveSchoolsSearchParams = {
  name?: string
  inn?: string
  page?: number
  show_count?: number
}

export type ActiveSchoolsPage = {
  data: ActiveSchoolItem[]
  total_items: number
  current_page?: number
  last_page?: number
  per_page?: number
}
