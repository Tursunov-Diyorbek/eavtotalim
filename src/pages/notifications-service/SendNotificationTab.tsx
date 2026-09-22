import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs } from '@/components/ui'
import { SendStudentsPanel } from './SendStudentsPanel'
import type { SendMode } from '@/api'

export function SendNotificationTab() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<SendMode>('group')

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        value={mode}
        onChange={setMode}
        size="sm"
        aria-label={t('notificationsPage.sendTitle')}
        items={[
          { value: 'group', label: t('notificationsPage.byGroups') },
          { value: 'activeDebtors', label: t('notificationsPage.byActiveDebtors') },
          { value: 'endedDebtors', label: t('notificationsPage.byEndedDebtors') },
          { value: 'birthday', label: t('notificationsPage.byBirthday') },
        ]}
      />
      <SendStudentsPanel key={mode} mode={mode} />
    </div>
  )
}
