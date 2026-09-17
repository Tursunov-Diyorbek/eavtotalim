import { useTranslation } from 'react-i18next'
import { notify } from '@/components/ui'
import { TopbarIconButton, useFontSizeControl } from './topbarUtils'

export function FontSizeControl() {
  const { t } = useTranslation()
  const { increase, decrease } = useFontSizeControl()

  return (
    <div className="hidden items-center gap-0.5 sm:flex">
      <TopbarIconButton
        label={t('topbar.fontIncrease')}
        className="w-auto min-w-8 px-1.5 text-[11px] font-bold"
        onClick={() => {
          const next = increase()
          notify.info(t('topbar.fontSizeToast', { size: next }))
        }}
      >
        A+
      </TopbarIconButton>
      <TopbarIconButton
        label={t('topbar.fontDecrease')}
        className="w-auto min-w-8 px-1.5 text-[11px] font-bold"
        onClick={() => {
          const next = decrease()
          notify.info(t('topbar.fontSizeToast', { size: next }))
        }}
      >
        A−
      </TopbarIconButton>
    </div>
  )
}
