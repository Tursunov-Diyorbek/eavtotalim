import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  Panel,
  Select,
  Skeleton,
  SkeletonCard,
} from '@/components/ui'
import { useAuth } from '@/features/auth'
import { pickLocalized } from '@/features/lessons'
import { useMyTimeTableQuery } from '@/features/schedule'
import { cn } from '@/lib'
import type { ScheduleDayItem } from '@/types'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function parseDateKey(iso: string | null | undefined) {
  if (!iso) return null
  return iso.slice(0, 10)
}

function formatTime(iso: string | null | undefined) {
  if (!iso || iso.length < 16) return '—'
  return iso.slice(11, 16)
}

function monthKeys() {
  return [
    'lessonSchedule.jan',
    'lessonSchedule.feb',
    'lessonSchedule.mar',
    'lessonSchedule.apr',
    'lessonSchedule.may',
    'lessonSchedule.jun',
    'lessonSchedule.jul',
    'lessonSchedule.aug',
    'lessonSchedule.sep',
    'lessonSchedule.oct',
    'lessonSchedule.nov',
    'lessonSchedule.dec',
  ] as const
}

function buildMonthCells(year: number, month: number) {
  const first = new Date(year, month, 1)
  // Monday-first: Sun=0 → 6, Mon=1 → 0, …
  const startOffset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<Date | null> = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function ScheduleSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" rounded="lg" />
        <Skeleton className="h-8 w-24" rounded="lg" />
      </div>
      <SkeletonCard className="h-72 p-3" />
    </div>
  )
}

export function LessonSchedulePage() {
  const { t, i18n } = useTranslation()
  const { me } = useAuth()
  const now = new Date()
  const [viewYear, setViewYear] = useState(() => now.getFullYear())
  const [viewMonth, setViewMonth] = useState(() => now.getMonth())
  const [selectedKey, setSelectedKey] = useState<string | null>(() =>
    toDateKey(now),
  )

  const agreementTypeId =
    me?.profession?.organization?.agreement_type?.id ??
    me?.profession?.organization?.last_agreement?.agreement_type?.id ??
    null
  const isBaseTariff = agreementTypeId === 1
  const hasComfort = Boolean(me?.organization_has_comfort_plan)

  const canFetch = !isBaseTariff && hasComfort
  const { data = [], isLoading, isError } = useMyTimeTableQuery(canFetch)

  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleDayItem>()
    for (const item of data) {
      const key = parseDateKey(item.start_time)
      if (key) map.set(key, item)
    }
    return map
  }, [data])

  /** Jadvaldagi yillar + hozirgi atrof (±1) */
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years = new Set<number>([currentYear, viewYear])
    for (const key of byDate.keys()) {
      const y = Number(key.slice(0, 4))
      if (!Number.isNaN(y)) years.add(y)
    }
    const min = Math.min(...years) - 1
    const max = Math.max(...years) + 1
    const list: number[] = []
    for (let y = min; y <= max; y++) list.push(y)
    return list.map((y) => ({ value: y, label: String(y) }))
  }, [byDate, viewYear])

  const monthOptions = useMemo(
    () =>
      monthKeys().map((key, index) => ({
        value: index,
        label: t(key),
      })),
    [t],
  )

  const cells = useMemo(
    () => buildMonthCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  )

  const selected = selectedKey ? byDate.get(selectedKey) : undefined
  const todayKey = toDateKey(new Date())

  const weekdays = [
    t('lessonSchedule.mon'),
    t('lessonSchedule.tue'),
    t('lessonSchedule.wed'),
    t('lessonSchedule.thu'),
    t('lessonSchedule.fri'),
    t('lessonSchedule.sat'),
    t('lessonSchedule.sun'),
  ]

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  return (
    <>
      <Header
        title={t('lessonSchedule.title')}
        description={t('lessonSchedule.description')}
      />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {isBaseTariff ? (
          <EmptyState
            title={t('lessonSchedule.baseTariffTitle')}
            description={t('lessonSchedule.baseTariffText')}
          />
        ) : !hasComfort ? (
          <EmptyState
            title={t('lessonSchedule.noContractTitle')}
            description={t('lessonSchedule.noContractText')}
          />
        ) : isLoading ? (
          <ScheduleSkeleton />
        ) : isError ? (
          <ErrorMessage />
        ) : data.length === 0 ? (
          <EmptyState description={t('lessonSchedule.empty')} />
        ) : (
          <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
            <Panel className="p-3 sm:p-4">
              <div className="mb-3 flex flex-nowrap items-end gap-2">
                <Select
                  size="sm"
                  label={t('lessonSchedule.filterMonth')}
                  value={viewMonth}
                  options={monthOptions}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                  className="w-[9rem] shrink-0"
                  searchable={false}
                />
                <Select
                  size="sm"
                  label={t('lessonSchedule.filterYear')}
                  value={viewYear}
                  options={yearOptions}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                  className="w-[5.5rem] shrink-0"
                  searchable={false}
                />
                <div className="ml-auto flex shrink-0 items-center gap-1 self-end">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => shiftMonth(-1)}
                    aria-label={t('lessonSchedule.prevMonth')}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const d = new Date()
                      setViewYear(d.getFullYear())
                      setViewMonth(d.getMonth())
                      setSelectedKey(toDateKey(d))
                    }}
                  >
                    {t('lessonSchedule.today')}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => shiftMonth(1)}
                    aria-label={t('lessonSchedule.nextMonth')}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {weekdays.map((d) => (
                  <div
                    key={d}
                    className="pb-1 text-center text-[11px] font-semibold tracking-wide text-muted uppercase"
                  >
                    {d}
                  </div>
                ))}
                {cells.map((day, idx) => {
                  if (!day) {
                    return <div key={`e-${idx}`} className="min-h-16" />
                  }
                  const key = toDateKey(day)
                  const event = byDate.get(key)
                  const isToday = key === todayKey
                  const isSelected = key === selectedKey
                  const topics =
                    event?.handouts
                      ?.map((h) => pickLocalized(h.topic?.name, i18n.language))
                      .filter(Boolean) ?? []

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedKey(key)}
                      className={cn(
                        'flex min-h-16 flex-col rounded-lg border p-1.5 text-left transition',
                        isSelected
                          ? 'border-signal bg-signal-soft/50'
                          : event
                            ? 'border-teal/30 bg-teal-soft/40 hover:border-signal/40'
                            : 'border-transparent bg-fog/40 hover:bg-fog',
                        isToday && !isSelected && 'ring-1 ring-signal/40',
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex size-6 items-center justify-center rounded-md text-[12px] font-semibold',
                          isToday ? 'bg-signal text-white' : 'text-deep',
                        )}
                      >
                        {day.getDate()}
                      </span>
                      {topics.length > 0 ? (
                        <span className="mt-1 line-clamp-2 text-[10px] leading-tight text-teal">
                          {topics[0]}
                          {topics.length > 1 ? ` +${topics.length - 1}` : ''}
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </Panel>

            <Panel className="flex flex-col p-3 sm:p-4">
              <h3 className="font-display text-sm font-semibold text-deep">
                {selectedKey
                  ? t('lessonSchedule.dayTitle', { date: selectedKey })
                  : t('lessonSchedule.pickDay')}
              </h3>

              {!selectedKey ? (
                <p className="mt-3 text-sm text-muted">
                  {t('lessonSchedule.pickDay')}
                </p>
              ) : !selected ? (
                <EmptyState
                  className="mt-3 border-0 px-0 py-8"
                  description={t('lessonSchedule.noLessonsDay')}
                />
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-2 rounded-lg bg-fog px-2.5 py-2 text-[13px]">
                    <Clock className="size-3.5 text-signal" aria-hidden />
                    <span className="font-semibold text-signal">
                      {formatTime(selected.start_time)}
                    </span>
                    <span className="text-muted">|</span>
                    <span className="font-medium text-muted">
                      {formatTime(selected.end_time)}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {(selected.handouts ?? []).map((item, index) => {
                      const name = pickLocalized(
                        item.topic?.name,
                        i18n.language,
                      )
                      if (!name) return null
                      return (
                        <li
                          key={item.id ?? index}
                          className="flex items-start gap-2 rounded-lg border border-mist/70 px-2.5 py-2"
                        >
                          <Badge tone="signal">{index + 1}</Badge>
                          <p className="text-[13px] leading-snug font-medium text-deep">
                            {name}
                          </p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </Panel>
          </div>
        )}
      </main>
    </>
  )
}
