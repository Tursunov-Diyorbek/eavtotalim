import type { MeData, MeUser } from '@/types'

const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const ROLES_KEY = 'roles'
const PERMISSIONS_KEY = 'permissions'
const USER_ME_KEY = 'userMe'
const ROLE_CODE_KEY = 'role'

export type LoginTokens = {
  access_token: string
  refresh_token?: string
  roles?: unknown
  permissions?: unknown
}

export function saveAuthSession(data: LoginTokens) {
  localStorage.setItem(TOKEN_KEY, data.access_token)
  if (data.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token)
  }
  if (data.roles) {
    localStorage.setItem(ROLES_KEY, JSON.stringify(data.roles))
  }
  if (data.permissions) {
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(data.permissions))
  }
}

export function saveUserMe(me: MeData) {
  localStorage.setItem(USER_ME_KEY, JSON.stringify(me))
  localStorage.setItem(ROLE_CODE_KEY, String(me.user.role))
  if (me.user.roles) {
    localStorage.setItem(ROLES_KEY, JSON.stringify(me.user.roles))
  }
  if (me.user.permissions) {
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(me.user.permissions))
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function getStoredUserMe(): MeData | null {
  const raw = localStorage.getItem(USER_ME_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as MeData
  } catch {
    return null
  }
}

export function getStoredPermissions(): string[] {
  const raw = localStorage.getItem(PERMISSIONS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

export function getStoredRoles(): string[] {
  const raw = localStorage.getItem(ROLES_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(ROLES_KEY)
  localStorage.removeItem(PERMISSIONS_KEY)
  localStorage.removeItem(USER_ME_KEY)
  localStorage.removeItem(ROLE_CODE_KEY)
}

export function canAccess(
  required: string | readonly string[] | null | undefined,
  user?: Pick<MeUser, 'roles' | 'permissions'> | null,
): boolean {
  if (required == null) return true

  const roles = user?.roles ?? getStoredRoles()
  const permissions = user?.permissions ?? getStoredPermissions()

  if (roles.includes('superadmin')) return true

  const needed = typeof required === 'string' ? [required] : [...required]
  return needed.some((p) => permissions.includes(p))
}
