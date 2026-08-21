import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  Panel,
  SafeImage,
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

type Props = {
  active: boolean
  year: number
  month: number
}

export function TheoreticalAttendancePanel({
  active,
  year,
  month,
}: Props) {
  const { t } = useTranslation()
  const { data = {}, isLoading, isError } = useTheoreticalAttendanceQuery(
    year,
    month + 1,
    active,
  )

  const cells = useMemo(() => buildMonthCells(year, month), [year, month])
  const todayKey = toDateKey(new Date())

  if (!active) return null

  return (
    <div className="space-y-3">
      {isLoading ? (
        <SkeletonCard className="space-y-2 p-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-64 w-full" rounded="lg" />
        </SkeletonCard>
      ) : isError ? (
        <ErrorMessage />
      ) : (
        <Panel className="overflow-x-auto p-2 sm:p-3">
          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAY_KEYS.map((key) => (
              <div
                key={key}
                className="px-1 py-1.5 text-center text-[10px] font-semibold tracking-wide text-muted sm:text-[11px]"
              >
                {t(key)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[72px] rounded-lg bg-fog/30 sm:min-h-[88px]"
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
                    'min-h-[72px] rounded-lg border border-mist/60 bg-white p-1.5 sm:min-h-[88px]',
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
                          className="flex items-center gap-1"
                        >
                          <span className="size-5 shrink-0 overflow-hidden rounded-full border border-mist">
                            <SafeImage
                              src={img}
                              size="sm"
                              className="size-full"
                            />
                          </span>
                          {isEntry && item.attendance_time ? (
                            <Badge tone="signal" className="truncate text-[9px]">
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
        </Panel>
      )}
    </div>
  )
}
