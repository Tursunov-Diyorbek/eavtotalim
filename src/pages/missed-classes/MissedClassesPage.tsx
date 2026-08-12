import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ClipboardList, FileText } from 'lucide-react'
import { Header } from '@/components/layout'
import { Tabs } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { MissedAbsencesPanel } from './MissedAbsencesPanel'
import { AbsenceReasonsPanel } from './AbsenceReasonsPanel'

type TabKey = 'absences' | 'reasons'

export function MissedClassesPage() {
  const { t } = useTranslation()
  const { me } = useAuth()
  const professionId = me?.profession?.id

  const tabItems = useMemo(
    () =>
      [
        {
          value: 'absences' as const,
          label: t('missedClasses.tabAbsences'),
          icon: <ClipboardList className="size-3.5" aria-hidden />,
        },
        {
          value: 'reasons' as const,
          label: t('missedClasses.tabReasons'),
          icon: <FileText className="size-3.5" aria-hidden />,
        },
      ] satisfies Array<{ value: TabKey; label: string; icon: ReactNode }>,
    [t],
  )

  const [tab, setTab] = useState<TabKey>('absences')

  return (
    <>
      <Header
        title={t('missedClasses.title')}
        description={t('missedClasses.description')}
      />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        <Tabs
          aria-label={t('missedClasses.title')}
          items={tabItems}
          value={tab}
          onChange={setTab}
        />

        <MissedAbsencesPanel active={tab === 'absences'} />
        <AbsenceReasonsPanel
          active={tab === 'reasons'}
          professionId={professionId}
        />
      </main>
    </>
  )
}
