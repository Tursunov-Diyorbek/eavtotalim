import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Lock, LogOut, Settings, User } from 'lucide-react'
import { routes } from '@/config'
import { notify } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { fullNameOf } from '@/lib/format'
import { cn } from '@/lib/cn'
import { ChangePasswordModal } from './ChangePasswordModal'

type SettingsMenuProps = {
  /** Sidebar footer — keng tugma + menyu tepaga ochiladi */
  variant?: 'icon' | 'sidebar'
  collapsed?: boolean
  onNavigate?: () => void
}

/** Sozlama: Profil / Parol / Chiqish (eski ProfileMenu). */
export function SettingsMenu({
  variant = 'icon',
  collapsed = false,
  onNavigate,
}: SettingsMenuProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { logout, loggingOut, me, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const sidebar = variant === 'sidebar'

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function handleLogout() {
    setOpen(false)
    const name =
      fullNameOf({
        last_name: me?.profession?.last_name,
        first_name: me?.profession?.first_name,
      }) || user?.username || ''
    await logout()
    notify.info(
      name
        ? t('auth.goodbyeNamed', { name })
        : t('auth.goodbye'),
      { duration: 4500 },
    )
    navigate(routes.login, { replace: true })
  }

  return (
    <div ref={rootRef} className={cn('relative', sidebar && 'w-full')}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t('settings.menu')}
        title={t('settings.menu')}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          sidebar
            ? cn(
                'flex w-full items-center gap-2.5 rounded-xl border border-transparent px-2.5 py-2 text-[13px] font-medium text-muted transition hover:bg-white/70 hover:text-deep',
                open && 'bg-white text-deep shadow-[0_2px_10px_rgba(15,36,48,0.07)]',
                collapsed && 'lg:w-auto lg:justify-center lg:px-1.5',
              )
            : cn(
                'inline-flex size-8 items-center justify-center rounded-lg border border-mist/90 bg-white text-deep shadow-sm transition hover:bg-brand-50',
                open && 'border-signal/40 bg-signal-soft text-signal',
              ),
        )}
      >
        {sidebar ? (
          <>
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg transition',
                open ? 'bg-signal-soft text-signal' : 'bg-white/60 text-muted',
              )}
            >
              <Settings className="size-4" aria-hidden />
            </span>
            <span className={cn(collapsed && 'lg:hidden')}>
              {t('settings.menu')}
            </span>
          </>
        ) : (
          <Settings className="size-4" aria-hidden />
        )}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className={cn(
            'absolute z-50 min-w-52 overflow-hidden rounded-xl border border-mist/80 bg-white py-1 shadow-[0_12px_32px_rgba(15,36,48,0.14)]',
            sidebar
              ? 'right-0 bottom-[calc(100%+6px)] left-0 w-full min-w-0'
              : 'top-[calc(100%+6px)] right-0',
          )}
        >
          <Link
            role="menuitem"
            to={routes.profile}
            onClick={() => {
              setOpen(false)
              onNavigate?.()
            }}
            className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-deep transition hover:bg-fog"
          >
            <User className="size-4 text-muted" aria-hidden />
            {t('settings.profile')}
          </Link>

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-medium text-deep transition hover:bg-fog"
            onClick={() => {
              setOpen(false)
              setPwdOpen(true)
            }}
          >
            <Lock className="size-4 text-muted" aria-hidden />
            {t('settings.changePassword')}
          </button>

          <div className="my-1 border-t border-mist/70" />

          <button
            type="button"
            role="menuitem"
            disabled={loggingOut}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-medium text-rose transition hover:bg-rose-soft disabled:opacity-50"
            onClick={() => void handleLogout()}
          >
            <LogOut className="size-4" aria-hidden />
            {loggingOut ? t('common.loading') : t('nav.logout')}
          </button>
        </div>
      ) : null}

      <ChangePasswordModal open={pwdOpen} onClose={() => setPwdOpen(false)} />
    </div>
  )
}
