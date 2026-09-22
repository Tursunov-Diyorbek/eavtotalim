import { useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, Car, Gauge } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import { Tabs } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { TheoreticalAttendancePanel } from './TheoreticalAttendancePanel'
import { PracticalAttendancePanel } from './PracticalAttendancePanel'
import { AutodromeAttendancePanel } from './AutodromeAttendancePanel'

type TabKey = 'theoretical' | 'practical' | 'autodrome'

function isTabKey(value: string | null): value is TabKey {
  return value === 'theoretical' || value === 'practical' || value === 'autodrome'
}

export function MyAttendancePage() {
  const { t } = useTranslation()
  const { me } = useAuth()
  const [searchParams] = useSearchParams()

  const eduTypeId = me?.profession?.edu_type_id
  const showTheoretical = eduTypeId !== 1 && eduTypeId !== 2

  const tabItems = useMemo(() => {
    const list: Array<{
      value: TabKey
      label: string
      icon: ReactNode
    }> = []
    if (showTheoretical) {
      list.push({
        value: 'theoretical',
        label: t('myAttendance.tabTheoretical'),
        icon: <BookOpen className="size-3.5" aria-hidden />,
      })
    }
    list.push(
      {
        value: 'practical',
        label: t('myAttendance.tabPractical'),
        icon: <Car className="size-3.5" aria-hidden />,
      },
      {
        value: 'autodrome',
        label: t('myAttendance.tabAutodrome'),
        icon: <Gauge className="size-3.5" aria-hidden />,
      },
    )
    return list
  }, [showTheoretical, t])

  const [tab, setTab] = useState<TabKey>(() => {
    const fromUrl = searchParams.get('tab')
    if (isTabKey(fromUrl) && (fromUrl !== 'theoretical' || showTheoretical)) {
      return fromUrl
    }
    return showTheoretical ? 'theoretical' : 'practical'
  })

  const activeTab = tabItems.some((item) => item.value === tab)
    ? tab
    : (tabItems[0]?.value ?? 'practical')

  return (
    <>
      <Header
        title={t('myAttendance.title')}
        description={t('myAttendance.description')}
      />

      <PageMain fill>
        <Tabs
          aria-label={t('myAttendance.title')}
          items={tabItems}
          value={activeTab}
          onChange={setTab}
          className="shrink-0"
        />

        <TheoreticalAttendancePanel active={activeTab === 'theoretical'} />
        <PracticalAttendancePanel active={activeTab === 'practical'} />
        <AutodromeAttendancePanel active={activeTab === 'autodrome'} />
      </PageMain>
    </>
  )
}
