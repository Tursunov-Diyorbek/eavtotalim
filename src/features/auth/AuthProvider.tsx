import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { logoutRequest } from '@/api'
import { fetchMe } from '@/api/me'
import {
  canAccess,
  clearAuthSession,
  getAccessToken,
  getStoredUserMe,
  saveUserMe,
} from '@/lib/authStorage'
import {
  FORCE_LOGOUT_EVENT,
  TOKEN_REFRESHED_EVENT,
} from '@/lib/tokenRefresh'
import type { MeData, MeUser } from '@/types'

type AuthContextValue = {
  token: string | null
  me: MeData | null
  user: MeUser | null
  loading: boolean
  loggingOut: boolean
  isAuthenticated: boolean
  setSessionFromLogin: (accessToken: string) => Promise<MeData>
  refreshMe: () => Promise<MeData | null>
  logout: () => Promise<void>
  hasPermission: (required: string | readonly string[] | null | undefined) => boolean
  hasRole: (roleName: string) => boolean
  isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => getAccessToken())
  const [me, setMe] = useState<MeData | null>(() => getStoredUserMe())
  const [loading, setLoading] = useState(() => Boolean(getAccessToken()))
  const [loggingOut, setLoggingOut] = useState(false)

  const applyMe = useCallback((data: MeData) => {
    saveUserMe(data)
    setMe(data)
  }, [])

  const clearLocalSession = useCallback(() => {
    clearAuthSession()
    setToken(null)
    setMe(null)
  }, [])

  const refreshMe = useCallback(async () => {
    const access = getAccessToken()
    if (!access) {
      setMe(null)
      setLoading(false)
      return null
    }
    setLoading(true)
    try {
      const data = await fetchMe(access)
      applyMe(data)
      setToken(getAccessToken())
      return data
    } catch {
      // 401 + refresh fail → forceLogout tokenni o‘chiradi
      if (!getAccessToken()) {
        clearLocalSession()
        return null
      }
      // Boshqa xato: cached profilni saqlab qolamiz
      setToken(getAccessToken())
      return getStoredUserMe()
    } finally {
      setLoading(false)
    }
  }, [applyMe, clearLocalSession])

  // Faqat bir marta: token bo‘lsa /me, yo‘q bo‘lsa loading yakun
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    void refreshMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onForceLogout = () => {
      clearLocalSession()
      setLoading(false)
    }
    const onTokenRefreshed = (e: Event) => {
      const detail = (e as CustomEvent<{ accessToken?: string }>).detail
      if (detail?.accessToken) setToken(detail.accessToken)
      else setToken(getAccessToken())
    }
    window.addEventListener(FORCE_LOGOUT_EVENT, onForceLogout)
    window.addEventListener(TOKEN_REFRESHED_EVENT, onTokenRefreshed)
    return () => {
      window.removeEventListener(FORCE_LOGOUT_EVENT, onForceLogout)
      window.removeEventListener(TOKEN_REFRESHED_EVENT, onTokenRefreshed)
    }
  }, [clearLocalSession])

  const setSessionFromLogin = useCallback(
    async (accessToken: string) => {
      setToken(accessToken)
      setLoading(true)
      try {
        const data = await fetchMe(accessToken)
        applyMe(data)
        return data
      } finally {
        setLoading(false)
      }
    },
    [applyMe],
  )

  const logout = useCallback(async () => {
    setLoggingOut(true)
    try {
      await logoutRequest()
    } catch (err) {
      console.error('Logout API error:', err)
    } finally {
      clearLocalSession()
      setLoggingOut(false)
    }
  }, [clearLocalSession])

  const user = me?.user ?? null

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      me,
      user,
      loading,
      loggingOut,
      isAuthenticated: Boolean(token && user),
      setSessionFromLogin,
      refreshMe,
      logout,
      hasPermission: (required) => canAccess(required, user),
      hasRole: (roleName) => Boolean(user?.roles?.includes(roleName)),
      isSuperAdmin: Boolean(
        user?.roles?.includes('superadmin') || user?.role === 777,
      ),
    }),
    [
      token,
      me,
      user,
      loading,
      loggingOut,
      setSessionFromLogin,
      refreshMe,
      logout,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
