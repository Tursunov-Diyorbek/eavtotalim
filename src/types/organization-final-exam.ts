export type OrganizationFinalExamStatus = {
  id?: number | string | null
  name?: string | null
}

export type OrganizationFinalExamGroup = {
  id?: number | null
  name?: string | null
  edu_starting_date?: string | null
  edu_ending_date?: string | null
  edu_status?: number | string | null
  category?: {
    id?: number | null
    name?: string | null
    short_name?: string | null
  } | null
}

export type OrganizationFinalExamRow = {
  id: number
  name?: string | null
  group?: OrganizationFinalExamGroup | null
  time?: {
    start?: string | null
    end?: string | null
  } | null
  status?: OrganizationFinalExamStatus | null
}

export type OrganizationFinalExamPayload = {
  name?: string
  group_id?: number
  time: {
    start: string
    end: string
  }
}
