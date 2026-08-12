import type { Id } from './common'

export type AttendanceStatus = 'present' | 'absent' | 'late'

export type AttendanceRecord = {
  id: Id
  studentId: Id
  sessionId: Id
  status: AttendanceStatus
  markedAt: string
}

export type CheckInOut = {
  id: Id
  studentId: Id
  checkInAt: string
  checkOutAt?: string
}
