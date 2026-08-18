import type { BadgeTone } from '@/components/ui'
import type { StudentItem } from '@/types/student'

export function studentAge(birthday?: string | null): number | null {
  if (!birthday) return null
  const birth = new Date(birthday)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1
  return age
}

export type StudentMspdKind =
  | 'incomplete'
  | 'bad'
  | 'pending'
  | 'okNoPhoto'
  | 'ok'

export function studentMspdKind(row: StudentItem): StudentMspdKind {
  if (!row.passport_jshir || !row.passport_given_date) return 'incomplete'
  const getting = Number(row.mspd_getting)
  const photo = Number(row.mspd_photo_getting)
  if (getting === 2 && photo === 2) return 'bad'
  if (getting === 0 && photo === 0) return 'pending'
  if (getting === 1 && photo === 3) return 'okNoPhoto'
  return 'ok'
}

export function studentMspdTone(kind: StudentMspdKind): BadgeTone {
  if (kind === 'ok' || kind === 'okNoPhoto') return 'teal'
  if (kind === 'pending') return 'neutral'
  return 'rose'
}

export function studentEduStatusTone(status: number | string | null | undefined): BadgeTone {
  const n = Number(status)
  if (n === 1) return 'teal'
  if (n === 2) return 'neutral'
  return 'rose'
}

export function canDeleteStudent(row: StudentItem) {
  return Number(row.grouped) === 0
}
