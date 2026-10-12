import { ROLE_CODE } from './access'
import type { MeUser } from '@/types'

export type RoleTone = 'signal' | 'violet' | 'teal' | 'amber' | 'indigo' | 'rose'

type RoleMeta = {
  labelKey: string
  tone: RoleTone
}

/** `user.role` raqamidan ko‘rinadigan nom va rang */
export const ROLE_META: Record<number, RoleMeta> = {
  [ROLE_CODE.SUPERADMIN]: { labelKey: 'roles.superadmin', tone: 'violet' },
  [ROLE_CODE.DIRECTOR]: { labelKey: 'roles.director', tone: 'signal' },
  [ROLE_CODE.TEACHER]: { labelKey: 'roles.teacher', tone: 'teal' },
  [ROLE_CODE.STUDENT]: { labelKey: 'roles.student', tone: 'teal' },
  [ROLE_CODE.ACCOUNTANT]: { labelKey: 'roles.accountant', tone: 'amber' },
  [ROLE_CODE.EXPERT]: { labelKey: 'roles.expert', tone: 'indigo' },
  [ROLE_CODE.REGIONAL_INSPECTOR]: { labelKey: 'roles.inspector', tone: 'rose' },
  [ROLE_CODE.AUTODROME]: { labelKey: 'roles.autodrome', tone: 'teal' },
  [ROLE_CODE.REPUBLIC_GAI]: { labelKey: 'roles.republicGai', tone: 'indigo' },
  [ROLE_CODE.ROAD_SAFETY]: { labelKey: 'roles.roadSafety', tone: 'rose' },
}

export function getRoleMeta(role: number | undefined | null): RoleMeta {
  if (role == null) return { labelKey: 'roles.unknown', tone: 'signal' }
  return ROLE_META[role] ?? { labelKey: 'roles.unknown', tone: 'signal' }
}

/** Guruh va o‘quvchiga mentor biriktirish: superadmin, direktor, moderator. */
export function canAssignMentor(
  user?: Pick<MeUser, 'role' | 'roles'> | null,
): boolean {
  if (!user) return false
  if (
    user.role === ROLE_CODE.SUPERADMIN ||
    user.role === ROLE_CODE.DIRECTOR ||
    user.role === ROLE_CODE.MODERATOR
  ) {
    return true
  }
  return (user.roles ?? []).some(
    (role) => role === 'superadmin' || role === 'director' || role === 'moderator',
  )
}

export function isDirectorRole(
  user?: Pick<MeUser, 'role' | 'roles'> | null,
): boolean {
  if (!user) return false
  return user.role === ROLE_CODE.DIRECTOR || user.roles.includes('director')
}

export function isTeacherRole(
  user?: Pick<MeUser, 'role' | 'roles'> | null,
): boolean {
  if (!user) return false
  return user.role === ROLE_CODE.TEACHER || user.roles.includes('teacher')
}

export function isAutodromeRole(
  user?: Pick<MeUser, 'role' | 'roles'> | null,
): boolean {
  if (!user) return false
  return (
    user.role === ROLE_CODE.AUTODROME ||
    (user.roles ?? []).includes('autodrome')
  )
}

/** Respublika GAI (8) va YHXX (9) — bir xil xarita bosh sahifasi. */
export function isRepublicGaiRole(
  user?: Pick<MeUser, 'role' | 'roles'> | null,
): boolean {
  if (!user) return false
  return user.role === ROLE_CODE.REPUBLIC_GAI || user.role === ROLE_CODE.ROAD_SAFETY
}

export function isStudentRole(
  user?: Pick<MeUser, 'role' | 'roles'> | null,
): boolean {
  if (!user) return false
  return user.role === ROLE_CODE.STUDENT || user.roles.includes('student')
}

/** Direktor profili MSPD da tasdiqlanmagan (eski Unconfirmed). */
export function isDirectorProfileUnconfirmed(
  mspdStatus: number | string | null | undefined,
): boolean {
  if (mspdStatus == null || mspdStatus === '') return false
  return Number(mspdStatus) !== 1
}

/** Eski RequiredModals: 0 yoki 2 bo‘lsa to‘ldirish majburiy. */
export function shouldForceDirectorProfileFill(
  mspdStatus: number | string | null | undefined,
): boolean {
  const n = Number(mspdStatus)
  return n === 0 || n === 2
}

export const TONE_CLASS: Record<RoleTone, string> = {
  signal: 'bg-signal-soft text-brand-700',
  violet: 'bg-violet-soft text-violet',
  teal: 'bg-teal-soft text-teal',
  amber: 'bg-amber-soft text-amber',
  indigo: 'bg-indigo-soft text-indigo',
  rose: 'bg-rose-soft text-rose',
}
