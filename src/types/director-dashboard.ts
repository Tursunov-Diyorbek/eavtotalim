export type DailyPaymentByType = {
  name?: string | null
  payments?: Array<{ amount?: number | string | null }> | null
}

export type StudentImageStatsSummary = {
  total_students?: number | null
  with_image?: number | null
  without_image?: number | null
  percent_uploaded?: number | null
}

export type FaceControlWarning = {
  id: number
  text?: string | null
  created_at?: string | null
  is_seen?: boolean | number | null
  images?: string[] | null
}

export type FaceControlDashboard = {
  unseen_warnings_count?: number | null
  unseen_warnings?: FaceControlWarning[] | null
}

export type AutodromeCameraItem = {
  id?: number
  ip_address?: string | null
  model_name?: string | null
  status?: string | null
  used_slots?: number | null
  max_users_count?: number | null
  free_slots?: number | null
  usage_percent?: number | null
  last_online_at?: string | null
  offline_seconds?: number | null
  reason?: string | null
}

export type AutodromeWithCameras = {
  id: number
  name?: string | null
  inn?: string | null
  cameras: AutodromeCameraItem[]
}
