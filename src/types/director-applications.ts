export type DirectorApplicationState =
  | 'received'
  | 'processing'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'cancelled'
  | string

export type DirectorApplicationRow = {
  id: number
  applicant_name?: string | null
  applicant_phone?: string | null
  source?: string | null
  created_at?: string | null
  state?: DirectorApplicationState | null
  state_label?: string | null
}

export type DirectorApplicationStatusCounts = {
  all?: number | null
  received?: number | null
  accepted?: number | null
  rejected?: number | null
  processing?: number | null
  completed?: number | null
  cancelled?: number | null
}

export type DirectorApplicationsPayload = {
  data: DirectorApplicationRow[]
  total_items: number
  current_page: number
  last_page: number
  status_counts: DirectorApplicationStatusCounts
}

export type DirectorApplicationsParams = {
  page: number
  showCount: number
  state?: string
  search?: string
  phone?: string
}
