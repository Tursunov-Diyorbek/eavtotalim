import { useTranslation } from 'react-i18next'
import { Maximize, Minimize, ScanSearch } from 'lucide-react'
import { notify } from '@/components/ui'
import { TopbarIconButton, useFullscreen } from './topbarUtils'
import { useState } from 'react'

export function MagnifierZoom() {
  const { t } = useTranslation()
  const [active, setActive] = useState(false)

  return (
    <TopbarIconButton
      label={t('topbar.magnifier')}
      active={active}
      className="hidden md:inline-flex"
      onClick={() => {
        setActive((prev) => {
          const next = !prev
          const root = document.documentElement
          if (next) {
            ;(root.style as CSSStyleDeclaration & { zoom?: string }).zoom = '1.2'
            notify.info(t('topbar.magnifierOn'))
          } else {
            ;(root.style as CSSStyleDeclaration & { zoom?: string }).zoom = ''
            notify.info(t('topbar.magnifierOff'))
          }
          return next
        })
      }}
    >
      <ScanSearch className="size-4" aria-hidden />
    </TopbarIconButton>
  )
}

export function FullscreenButton() {
  const { t } = useTranslation()
  const { active, toggle } = useFullscreen()

  return (
    <TopbarIconButton
      label={active ? t('topbar.exitFullscreen') : t('topbar.fullscreen')}
      active={active}
      className="hidden lg:inline-flex"
      onClick={() => void toggle()}
    >
      {active ? (
        <Minimize className="size-4" aria-hidden />
      ) : (
        <Maximize className="size-4" aria-hidden />
      )}
    </TopbarIconButton>
  )
}
