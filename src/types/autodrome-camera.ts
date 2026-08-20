/** GET /v2/api/my-profile/autodrome-camera-status */

export type AutodromeCameraItem = {
  id?: number
  camera_id?: number | string | null
  ip_address?: string | null
  description?: string | null
  model_name?: string | null
  status?: string | null
  status_uz?: string | null
  is_sent?: boolean | null
  is_face_sent?: boolean | null
  error?: string | null
  advice?: string | null
  last_tried_at?: string | null
  used_slots?: number | null
  max_users_count?: number | null
  free_slots?: number | null
  usage_percent?: number | null
  last_online_at?: string | null
  last_synced_at?: string | null
  offline_seconds?: number | null
  reason?: string | null
  latency_ms?: number | null
  fail_streak?: number | null
  is_auto_send?: boolean | null
}

export type AutodromeCameraStatusPayload = {
  has_photo?: boolean | null
  cameras_ok?: number | null
  cameras_total?: number | null
  overall_status?: string | null
  overall_status_uz?: string | null
  grace_days_left?: number | null
  advice?: string[] | null
  cameras?: AutodromeCameraItem[] | null
}

export type AutodromeCameraStatusResult = {
  status?: string | null
  message?: string | null
  data?: AutodromeCameraStatusPayload | null
}
