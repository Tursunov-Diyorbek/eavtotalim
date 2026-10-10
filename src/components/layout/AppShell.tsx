import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { DirectorProfileGuard } from './DirectorProfileGuard'
import { PublicOfferModal } from './PublicOfferModal'
import { AppTopBar, Sidebar } from './Sidebar'
import { StudentSchoolModal } from './StudentSchoolModal'
import {
  StudentMobileShell,
  useStudentMobileShellActive,
} from '@/pages/mobile'

const SIDEBAR_KEY = 'eav_sidebar_collapsed'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1'
  } catch {
    return false
  }
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const studentMobile = useStudentMobileShellActive()

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  if (studentMobile) {
    return (
      <div className="flex h-svh overflow-hidden bg-fog text-ink">
        <StudentMobileShell>
          <div className="shell-canvas flex min-h-0 flex-1 flex-col overflow-hidden">
            <Outlet />
          </div>
        </StudentMobileShell>
        <DirectorProfileGuard />
        <StudentSchoolModal />
        <PublicOfferModal />
      </div>
    )
  }

  return (
    <div className="flex h-svh overflow-hidden bg-fog text-ink">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopBar
          onOpenMenu={() => setMobileOpen(true)}
          onToggleCollapse={toggleCollapsed}
          collapsed={collapsed}
        />
        <div className="shell-canvas flex min-h-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
      <DirectorProfileGuard />
      <StudentSchoolModal />
      <PublicOfferModal />
    </div>
  )
}
