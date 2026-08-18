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
  [ROLE_CODE.STUDENT]: { labelKey: 'roles.student', tone: 'teal' },
  [ROLE_CODE.ACCOUNTANT]: { labelKey: 'roles.accountant', tone: 'amber' },
  [ROLE_CODE.EXPERT]: { labelKey: 'roles.expert', tone: 'indigo' },
  [ROLE_CODE.REGIONAL_INSPECTOR]: { labelKey: 'roles.inspector', tone: 'rose' },
}

export function getRoleMeta(role: number | undefined | null): RoleMeta {
  if (role == null) return { labelKey: 'roles.unknown', tone: 'signal' }
  return ROLE_META[role] ?? { labelKey: 'roles.unknown', tone: 'signal' }
}

export function isDirectorRole(
  user?: Pick<MeUser, 'role' | 'roles'> | null,
): boolean {
  if (!user) return false
  return user.role === ROLE_CODE.DIRECTOR || user.roles.includes('director')
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
