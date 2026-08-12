import type { PropsWithChildren } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { canAccess } from '@/lib/authStorage'
import { routes } from '@/config'
import { getFirstAllowedPath, getHomePathByRole } from '@/config/access'

type RequireAuthProps = PropsWithChildren<{
  permission?: string | readonly string[] | null
}>

export function RequireAuth({
  permission = null,
  children,
}: RequireAuthProps) {
  const { token, user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-surface text-sm text-muted">
        Yuklanmoqda…
      </div>
    )
  }

  if (!token || !isAuthenticated || !user) {
    return <Navigate to={routes.login} replace state={{ from: location }} />
  }

  if (!canAccess(permission, user)) {
    return <Navigate to={getFirstAllowedPath(user)} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export function GuestOnly({ children }: PropsWithChildren) {
  const { token, user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-surface text-sm text-muted">
        Yuklanmoqda…
      </div>
    )
  }

  if (token && isAuthenticated && user) {
    return <Navigate to={getHomePathByRole(user.role, user)} replace />
  }

  return children
}
