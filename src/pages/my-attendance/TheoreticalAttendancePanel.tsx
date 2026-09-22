import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  Panel,
  SafeImage,
  Select,
  Skeleton,
  SkeletonCard,
} from '@/components/ui'
import { PATH_PREFIX_FILE } from '@/config'
import { resolveFileUrl } from '@/features/lessons'
import { useTheoreticalAttendanceQuery } from '@/features/my-attendance'
import { cn } from '@/lib/cn'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function buildMonthCells(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<Date | null> = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const WEEKDAY_KEYS = [
  'myAttendance.mon',
  'myAttendance.tue',
  'myAttendance.wed',
  'myAttendance.thu',
  'myAttendance.fri',
  'myAttendance.sat',
  'myAttendance.sun',
] as const

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

type Props = {
  active: boolean
}

export function TheoreticalAttendancePanel({ active }: Props) {
  const { t } = useTranslation()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const { data = {}, isLoading, isError } = useTheoreticalAttendanceQuery(
    year,
    month + 1,
    active,
  )

  const cells = useMemo(() => buildMonthCells(year, month), [year, month])
  const todayKey = toDateKey(new Date())
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

  if (!active) return null

  const filters = (
    <div className="flex min-w-0 flex-nowrap items-end gap-2">
      <Select
        size="sm"
        label={t('myAttendance.month')}
        value={month}
        options={monthOptions}
        onChange={(e) => setMonth(Number(e.target.value))}
        className="w-[9rem] min-w-0 shrink-0"
        triggerClassName="min-w-0"
        searchable={false}
      />
      <Select
        size="sm"
        label={t('myAttendance.year')}
        value={year}
        options={yearOptions}
        onChange={(e) => setYear(Number(e.target.value))}
        className="w-[5.5rem] min-w-0 shrink-0"
        triggerClassName="min-w-0"
        searchable={false}
      />
    </div>
  )

  if (isLoading) {
    return (
      <SkeletonCard className="flex min-h-0 flex-1 flex-col space-y-2 p-3">
        {filters}
        <Skeleton className="h-8 w-full shrink-0" />
        <Skeleton className="min-h-0 w-full flex-1" rounded="lg" />
      </SkeletonCard>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {filters}
        <ErrorMessage />
      </div>
    )
  }

  return (
    <Panel className="flex min-h-0 min-w-0 flex-1 flex-col p-2 sm:p-3">
      <div className="mb-2 shrink-0">{filters}</div>

      <div className="mb-1 grid shrink-0 grid-cols-7 gap-1">
        {WEEKDAY_KEYS.map((key) => (
          <div
            key={key}
            className="min-w-0 px-1 py-1.5 text-center text-[10px] font-semibold tracking-wide text-muted sm:text-[11px]"
          >
            {t(key)}
          </div>
        ))}
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-auto">
        <div className="grid min-w-0 grid-cols-7 gap-1">
          {cells.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[72px] min-w-0 rounded-lg bg-fog/30 sm:min-h-[88px]"
                />
              )
            }

            const key = toDateKey(date)
            const records = data[key] ?? []
            const isToday = key === todayKey
            const isWeekend = date.getDay() === 0 || date.getDay() === 6

            return (
              <div
                key={key}
                className={cn(
                  'min-h-[72px] min-w-0 overflow-hidden rounded-lg border border-mist/60 bg-white p-1.5 sm:min-h-[88px]',
                  isToday && 'border-signal ring-1 ring-signal/30',
                  isWeekend && 'bg-fog/40',
                )}
              >
                <p
                  className={cn(
                    'mb-1 text-[11px] font-bold',
                    isToday ? 'text-signal' : 'text-deep',
                  )}
                >
                  {pad(date.getDate())}
                </p>
                <div className="space-y-1">
                  {records.slice(0, 3).map((item, i) => {
                    const img = resolveFileUrl(
                      item.current_image,
                      PATH_PREFIX_FILE,
                    )
                    const isEntry = String(item.type || '').includes('entry')
                    return (
                      <div
                        key={i}
                        className="flex min-w-0 items-center gap-1"
                      >
                        <span className="size-5 shrink-0 overflow-hidden rounded-full border border-mist">
                          <SafeImage
                            src={img}
                            size="sm"
                            className="size-full"
                          />
                        </span>
                        {isEntry && item.attendance_time ? (
                          <Badge tone="signal" className="min-w-0 truncate text-[9px]">
                            {item.attendance_time}
                          </Badge>
                        ) : null}
                      </div>
                    )
                  })}
                  {records.length > 3 ? (
                    <p className="text-[10px] text-muted">
                      +{records.length - 3}
                    </p>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        {Object.keys(data).length === 0 ? (
          <div className="pt-3">
            <EmptyState description={t('myAttendance.emptyTheoretical')} />
          </div>
        ) : null}
      </div>
    </Panel>
  )
}
