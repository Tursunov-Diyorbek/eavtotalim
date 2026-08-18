import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FilePenLine, Mail, Send } from 'lucide-react'
import { Header } from '@/components/layout'
import { Panel, Tabs } from '@/components/ui'
import { SentNotificationsTab } from './SentNotificationsTab'
import { TemplatesTab } from './TemplatesTab'
import { SendNotificationTab } from './SendNotificationTab'

const TAB_KEY = 'eavt:notifications-service-tab'

type MainTab = 'sent' | 'templates' | 'send'

function readTab(): MainTab {
  const raw = localStorage.getItem(TAB_KEY)
  if (raw === 'sent' || raw === 'templates' || raw === 'send') return raw
  return 'sent'
}

export function NotificationsServicePage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<MainTab>(readTab)

  const changeTab = (value: MainTab) => {
    setTab(value)
    localStorage.setItem(TAB_KEY, value)
  }

  return (
    <>
      <Header title={t('nav.notificationsService')} />
      <main className="flex-1 space-y-3 p-3 sm:p-4">
        <Tabs
          value={tab}
          onChange={changeTab}
          aria-label={t('nav.notificationsService')}
          items={[
            {
              value: 'sent',
              label: t('notificationsPage.tabSent'),
              icon: <Mail className="size-3.5" aria-hidden />,
            },
            {
              value: 'templates',
              label: t('notificationsPage.tabTemplates'),
              icon: <FilePenLine className="size-3.5" aria-hidden />,
            },
            {
              value: 'send',
              label: t('notificationsPage.tabSend'),
              icon: <Send className="size-3.5" aria-hidden />,
            },
          ]}
        />
        <Panel padding="md">
          {tab === 'sent' ? <SentNotificationsTab /> : null}
          {tab === 'templates' ? <TemplatesTab /> : null}
          {tab === 'send' ? <SendNotificationTab /> : null}
        </Panel>
      </main>
    </>
  )
}
