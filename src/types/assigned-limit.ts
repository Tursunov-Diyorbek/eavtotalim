export type AssignedLimitRecord = {
  limit?: number | null
  used_limit?: number | null
  free_limit?: number | null
  created_at?: string | null
  is_active?: boolean | number | null
}

export type AssignedLimitActive = AssignedLimitRecord & {
  records_count?: number | null
  first_given_at?: string | null
  last_given_at?: string | null
}

export type AssignedLimitOverview = {
  active_limit?: AssignedLimitActive | null
  limits?: AssignedLimitRecord[] | null
}
