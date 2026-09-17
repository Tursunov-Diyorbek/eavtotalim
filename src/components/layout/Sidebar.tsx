import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import {
  APP_NAME,
  DIRECTOR_NAV_ITEMS,
  isDirectorProfileUnconfirmed,
  isDirectorRole,
  routes,
} from '@/config'
import { PAGE_ACCESS } from '@/config/access'
import {
  MAIN_NAV,
  NAV_TONE,
  readRememberedNav,
  rememberActiveNav,
  resolveActiveNavTo,
  type NavItem,
} from '@/config/nav'
import { Badge, LanguageSwitcher, SearchInput } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { cn } from '@/lib/cn'
import appLogo from '@/assets/images/app-logo.png'
import appLogoFull from '@/assets/images/logo_old2.png'
import { SettingsMenu } from './SettingsMenu'
import {
  CopyrightNotice,
  FontSizeControl,
  FullscreenButton,
  MagnifierZoom,
  NotificationsMenu,
  PrepDriveButton,
  StudentAppLinks,
} from './topbar'

type SidebarProps = {
  collapsed: boolean
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

function normalizeNavQuery(value: string) {
  return value.toLocaleLowerCase('uz').trim()
}

function SidebarNavLink({
  item,
  collapsed,
  active,
  onClose,
  profileUnconfirmed,
}: {
  item: NavItem
  collapsed: boolean
  active: boolean
  onClose?: () => void
  profileUnconfirmed: boolean
}) {
  const { t } = useTranslation()
  const Icon = item.icon
  const tone = NAV_TONE[item.tone]

  return (
    <Link
      to={item.to}
      onClick={onClose}
      title={t(item.labelKey)}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition',
        collapsed && 'lg:justify-center lg:px-1.5',
        active
          ? 'bg-white text-deep shadow-[0_2px_10px_rgba(15,36,48,0.07)]'
          : 'text-muted hover:bg-white/70 hover:text-deep',
      )}
    >
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg transition',
          active ? tone.active : cn('bg-white/60', tone.idle),
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <span className={cn('min-w-0 flex-1 truncate', collapsed && 'lg:hidden')}>
        {t(item.labelKey)}
      </span>
      {item.to === routes.directorEditData && profileUnconfirmed ? (
        <Badge tone="rose" className={cn('shrink-0', collapsed && 'lg:hidden')}>
          {t('directorProfile.unconfirmed')}
        </Badge>
      ) : null}
    </Link>
  )
}

export function Sidebar({
  collapsed,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { hasPermission, user, me } = useAuth()
  const [menuQuery, setMenuQuery] = useState('')
  const director = isDirectorRole(user)
  const profileUnconfirmed = isDirectorProfileUnconfirmed(
    me?.profession?.mspd_status,
  )

  const visibleNav = useMemo(() => {
    const source = director ? DIRECTOR_NAV_ITEMS : MAIN_NAV
    return source.filter((item) => {
      if (item.directorOnly && !director) return false
      return hasPermission(PAGE_ACCESS[item.page])
    })
  }, [director, hasPermission])

  const resolvedTo = useMemo(
    () => resolveActiveNavTo(pathname, visibleNav),
    [pathname, visibleNav],
  )

  useEffect(() => {
    if (resolvedTo) rememberActiveNav(resolvedTo)
  }, [resolvedTo])

  const activeTo = useMemo(() => {
    if (resolvedTo) return resolvedTo
    const remembered = readRememberedNav()
    if (remembered && visibleNav.some((item) => item.to === remembered)) {
      return remembered
    }
    return null
  }, [resolvedTo, visibleNav])

  const filteredNav = useMemo(() => {
    const q = normalizeNavQuery(menuQuery)
    if (!q) return visibleNav
    return visibleNav.filter((item) =>
      normalizeNavQuery(t(item.labelKey)).includes(q),
    )
  }, [visibleNav, menuQuery, t])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, onCloseMobile])

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className={cn(
          'fixed inset-0 z-40 bg-deep/20 backdrop-blur-[1px] transition lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onCloseMobile}
      />

      <aside
        className={cn(
          'shell-sidebar fixed inset-y-0 left-0 z-50 flex h-svh flex-col overflow-hidden border-r border-mist/90 text-ink transition-[width,transform] duration-300 ease-out lg:static lg:z-0 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'w-[248px] shrink-0',
          collapsed && 'lg:w-[72px]',
        )}
      >
        <div
          className={cn(
            'sidebar-header flex h-14 shrink-0 items-center gap-2.5 border-b border-mist/70 px-3',
            collapsed && 'lg:justify-center lg:px-2',
          )}
        >
          {/* Menu yopiq (desktop): kichik belgi */}
          <img
            src={appLogo}
            alt=""
            draggable={false}
            className={cn(
              'hidden size-8 shrink-0 rounded-lg object-contain',
              collapsed && 'lg:block',
            )}
          />
          {/* Menu ochiq: to‘liq Eavtota'lim logo */}
          <div
            className={cn(
              'flex min-w-0 flex-1 items-center',
              collapsed && 'lg:hidden',
            )}
          >
            <img
              src={appLogoFull}
              alt={APP_NAME}
              draggable={false}
              className="h-8 w-auto max-w-full rounded object-contain object-left"
            />
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted transition hover:bg-brand-50 hover:text-deep lg:hidden"
            onClick={onCloseMobile}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          className={cn(
            'shrink-0 border-b border-mist/60 px-2 py-2',
            collapsed && 'lg:hidden',
          )}
        >
          <SearchInput
            id="sidebar-menu-search"
            size="sm"
            debounceMs={0}
            label={t('nav.searchMenu')}
            placeholder={t('nav.searchMenu')}
            value={menuQuery}
            onChange={(e) => setMenuQuery(e.target.value)}
            className="max-w-none"
            autoComplete="off"
          />
        </div>

        <nav className="sidebar-scroll flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-2 py-2.5">
          {filteredNav.length === 0 ? (
            <p
              className={cn(
                'px-2 py-4 text-center text-[12px] text-muted',
                collapsed && 'lg:hidden',
              )}
            >
              {t('nav.searchEmpty')}
            </p>
          ) : (
            filteredNav.map((item) => (
              <SidebarNavLink
                key={item.to}
                item={item}
                collapsed={collapsed}
                active={item.to === activeTo}
                onClose={onCloseMobile}
                profileUnconfirmed={profileUnconfirmed}
              />
            ))
          )}
        </nav>

        <div
          className={cn(
            'sidebar-footer shrink-0 border-t border-mist/70 p-2.5',
            collapsed && 'lg:flex lg:justify-center',
          )}
        >
          <SettingsMenu
            variant="sidebar"
            collapsed={collapsed}
            onNavigate={onCloseMobile}
          />
        </div>
      </aside>
    </>
  )
}

type AppTopBarProps = {
  onOpenMenu: () => void
  onToggleCollapse: () => void
  collapsed: boolean
}

/** Yuqori panel — eski VerticalLayout/Header (student util + til + bildirishnoma). */
export function AppTopBar({
  onOpenMenu,
  onToggleCollapse,
  collapsed,
}: AppTopBarProps) {
  return (
    <div className="app-topbar sticky top-0 z-30 flex h-11 shrink-0 items-center gap-1.5 border-b border-mist/80 px-2 backdrop-blur-md sm:gap-2 sm:px-4">
      <button
        type="button"
        onClick={onOpenMenu}
        className="inline-flex size-8 items-center justify-center rounded-lg border border-mist/90 bg-white text-deep shadow-sm lg:hidden"
        aria-label="Open menu"
      >
        <PanelLeftOpen className="size-4" />
      </button>
      <button
        type="button"
        onClick={onToggleCollapse}
        className="hidden size-8 items-center justify-center rounded-lg border border-mist/90 bg-white text-deep shadow-sm transition hover:bg-brand-50 lg:inline-flex"
        aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4" />
        ) : (
          <PanelLeftClose className="size-4" />
        )}
      </button>
      <p className="font-display truncate text-sm font-semibold tracking-tight text-deep lg:hidden">
        {APP_NAME}
      </p>

      <div className="ml-auto flex min-w-0 items-center gap-0.5 sm:gap-1">
        <CopyrightNotice />
        <FontSizeControl />
        <MagnifierZoom />
        <PrepDriveButton />
        <LanguageSwitcher variant="light" />
        <StudentAppLinks />
        <FullscreenButton />
        <NotificationsMenu />
      </div>
    </div>
  )
}
