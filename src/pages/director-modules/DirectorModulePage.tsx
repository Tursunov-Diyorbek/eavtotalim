import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import { EmptyState, Panel } from '@/components/ui'
import { pagePermissionLabel } from '@/config/access'
import { DIRECTOR_NAV_ITEMS } from '@/config/directorNav'

/** Direktor moduli — UI keyingi bosqichda. Permission kaliti ko‘rinadi. */
export function DirectorModulePage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const item = useMemo(
    () => DIRECTOR_NAV_ITEMS.find((row) => row.to === pathname),
    [pathname],
  )

  const title = item ? t(item.labelKey) : t('common.notFoundTitle')
  const permission = item ? pagePermissionLabel(item.page) : null

  return (
    <>
      <Header title={title} description={t('common.modulePlaceholder')} />
      <main className="p-3 sm:p-4">
        <Panel padding="md">
          <EmptyState
            title={title}
            description={t('common.modulePlaceholder')}
          >
            <p className="mt-3 font-mono text-[12px] text-muted">
              {permission
                ? `${t('common.permissionKey')}: ${permission}`
                : t('common.permissionNone')}
            </p>
          </EmptyState>
        </Panel>
      </main>
    </>
  )
}
