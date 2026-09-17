import { useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, Car, Gauge } from 'lucide-react'
import { Header } from '@/components/layout'
import { Select, Tabs } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { TheoreticalAttendancePanel } from './TheoreticalAttendancePanel'
import { PracticalAttendancePanel } from './PracticalAttendancePanel'
import { AutodromeAttendancePanel } from './AutodromeAttendancePanel'

type TabKey = 'theoretical' | 'practical' | 'autodrome'

function isTabKey(value: string | null): value is TabKey {
  return value === 'theoretical' || value === 'practical' || value === 'autodrome'
}

const MONTH_KEYS = [
  'myAttendance.jan',
  'myAttendance.feb',
  'myAttendance.mar',
  'myAttendance.apr',
  'myAttendance.may',
  'myAttendance.jun',
  'myAttendance.jul',
  'myAttendance.aug',
  'myAttendance.sep',
  'myAttendance.oct',
  'myAttendance.nov',
  'myAttendance.dec',
] as const

export function MyAttendancePage() {
  const { t } = useTranslation()
  const { me } = useAuth()
  const [searchParams] = useSearchParams()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

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

  const currentYear = now.getFullYear()
  const yearOptions = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => currentYear - 2 + i).map((value) => ({
        value,
        label: String(value),
      })),
    [currentYear],
  )

  const monthOptions = MONTH_KEYS.map((key, index) => ({
    value: index,
    label: t(key),
  }))

  return (
    <>
      <Header
        title={t('myAttendance.title')}
        description={t('myAttendance.description')}
      />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <Tabs
            aria-label={t('myAttendance.title')}
            items={tabItems}
            value={activeTab}
            onChange={setTab}
          />

          {activeTab === 'theoretical' ? (
            <div className="ml-auto flex flex-nowrap items-end gap-2">
              <Select
                size="sm"
                label={t('myAttendance.month')}
                value={month}
                options={monthOptions}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-[9rem] shrink-0"
                searchable={false}
              />
              <Select
                size="sm"
                label={t('myAttendance.year')}
                value={year}
                options={yearOptions}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-[5.5rem] shrink-0"
                searchable={false}
              />
            </div>
          ) : null}
        </div>

        <TheoreticalAttendancePanel
          active={activeTab === 'theoretical'}
          year={year}
          month={month}
        />
        <PracticalAttendancePanel active={activeTab === 'practical'} />
        <AutodromeAttendancePanel active={activeTab === 'autodrome'} />
      </main>
    </>
  )
}
