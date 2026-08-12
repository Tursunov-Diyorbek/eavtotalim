import type { Id } from './common'

export type StudentStatus =
  | 'registered'
  | 'active'
  | 'exam_ready'
  | 'graduated'
  | 'dropped'

export type Student = {
  id: Id
  fullName: string
  phone?: string
  groupId?: Id
  status: StudentStatus
  createdAt: string
}
