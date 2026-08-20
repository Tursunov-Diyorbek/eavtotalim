import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Lock, LogOut, Settings, User } from 'lucide-react'
import { routes, isDirectorProfileUnconfirmed, isDirectorRole } from '@/config'
import { Badge, notify } from '@/components/ui'
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

type MenuPos = {
  top?: number
  bottom?: number
  left: number
  width?: number
  minWidth: number
}

const MENU_MIN_WIDTH = 208

/** Sozlama: Profil / Parol / Chiqish (eski ProfileMenu). */
export function SettingsMenu({
  variant = 'icon',
  collapsed = false,
  onNavigate,
}: SettingsMenuProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { logout, loggingOut, me, user } = useAuth()
  const director = isDirectorRole(user)
  const profileTo = director ? routes.directorEditData : routes.profile
  const profileUnconfirmed =
    director && isDirectorProfileUnconfirmed(me?.profession?.mspd_status)
  const [open, setOpen] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [pos, setPos] = useState<MenuPos | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const sidebar = variant === 'sidebar'

  const updatePosition = () => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const gap = 6
    const vw = window.innerWidth
    const vh = window.innerHeight

    const visuallyCollapsed =
      sidebar && collapsed && window.matchMedia('(min-width: 1024px)').matches

    if (visuallyCollapsed) {
      const left = Math.min(rect.right + gap, vw - MENU_MIN_WIDTH - 8)
      setPos({
        left: Math.max(8, left),
        bottom: vh - rect.bottom,
        minWidth: MENU_MIN_WIDTH,
      })
      return
    }

    if (sidebar) {
      setPos({
        left: rect.left,
        width: rect.width,
        bottom: vh - rect.top + gap,
        minWidth: MENU_MIN_WIDTH,
      })
      return
    }

    setPos({
      left: Math.max(8, rect.right - MENU_MIN_WIDTH),
      top: rect.bottom + gap,
      minWidth: MENU_MIN_WIDTH,
    })
  }

  useEffect(() => {
    if (!open) {
      setPos(null)
      return
    }
    updatePosition()
    const onScroll = () => updatePosition()
    const onResize = () => updatePosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open, collapsed, sidebar])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node
      if (rootRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setOpen(false)
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

  const itemClass =
    'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-medium whitespace-nowrap transition hover:bg-fog'

  const menu =
    open && pos && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            style={{
              position: 'fixed',
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              width: pos.width,
              minWidth: pos.minWidth,
              zIndex: 120,
            }}
            className="overflow-hidden rounded-xl border border-mist/80 bg-white py-1 shadow-[0_12px_32px_rgba(15,36,48,0.14)]"
          >
            <Link
              role="menuitem"
              to={profileTo}
              onClick={() => {
                setOpen(false)
                onNavigate?.()
              }}
              className={cn(itemClass, 'text-deep')}
            >
              <User className="size-4 shrink-0 text-muted" aria-hidden />
              <span className="flex-1">{t('settings.profile')}</span>
              {profileUnconfirmed ? (
                <Badge tone="rose">{t('directorProfile.unconfirmed')}</Badge>
              ) : null}
            </Link>

            <button
              type="button"
              role="menuitem"
              className={cn(itemClass, 'text-deep')}
              onClick={() => {
                setOpen(false)
                setPwdOpen(true)
              }}
            >
              <Lock className="size-4 shrink-0 text-muted" aria-hidden />
              {t('settings.changePassword')}
            </button>

            <div className="my-1 border-t border-mist/70" />

            <button
              type="button"
              role="menuitem"
              disabled={loggingOut}
              className={cn(
                itemClass,
                'text-rose hover:bg-rose-soft disabled:opacity-50',
              )}
              onClick={() => void handleLogout()}
            >
              <LogOut className="size-4 shrink-0" aria-hidden />
              {loggingOut ? t('common.loading') : t('nav.logout')}
            </button>
          </div>,
          document.body,
        )
      : null

  return (
    <div ref={rootRef} className={cn('relative', sidebar && 'w-full')}>
      <button
        ref={triggerRef}
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

      {menu}

      <ChangePasswordModal open={pwdOpen} onClose={() => setPwdOpen(false)} />
    </div>
  )
}
