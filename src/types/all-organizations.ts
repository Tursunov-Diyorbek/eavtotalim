import type { MeOrganization, MeOrgReport } from './auth'

export type InspectionOrgRow = {
  id: number
  name: string
  inn: string
  groups: number
  students: number
  region: string
  area: string
  status: number | null
}

export type InspectionOrgReport = MeOrgReport & {
  ended_students_count?: number | null
  ended_groups_count?: number | null
}

export type InspectionDirector = {
  first_name?: string | null
  last_name?: string | null
  middle_name?: string | null
  image?: string | null
  gender?: number | null
  passport_seria?: string | null
  passport_number?: string | null
  passport_jshir?: string | null
  address?: string | null
  phone?: string | null
}

export type InspectionOrganization = Omit<MeOrganization, 'report'> & {
  report?: InspectionOrgReport | null
  director?: InspectionDirector | null
}
