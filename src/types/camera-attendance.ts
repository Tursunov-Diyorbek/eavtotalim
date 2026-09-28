/** GET v2 /monitoring-camera/pending-students */

export type CameraPendingStudent = {
  id?: number | string
  student_id?: number | string | null
  status?: number | string | null
  status_name?: string | null
  status_label?: string | null
  image?: string | null
  pending_image?: string | null
  face_control_type_id?: number | null
  face_control_type?: { id?: number | null; name?: string | null } | null
  faceControlType?: { id?: number | null; name?: string | null } | null
  student?: {
    id?: number | string | null
    first_name?: string | null
    last_name?: string | null
    middle_name?: string | null
    image?: string | null
  } | null
}

export type CameraPendingStats = {
  total: number | null
  sent: number | null
  sending: number | null
  error: number | null
  old: number | null
}
