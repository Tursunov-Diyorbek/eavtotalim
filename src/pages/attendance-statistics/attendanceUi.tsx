import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge, EmptyState, type BadgeTone } from '@/components/ui'
import type { AbsenceStudent } from '@/types/attendance-statistics'

export function todayIso() {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

/** Eski tag rangi: ≤50 qizil, ≤71 sariq, ≥80 yashil. */
export function attendanceTone(value: number): BadgeTone {
  if (value <= 50) return 'rose'
  if (value <= 71) return 'amber'
  if (value >= 80) return 'teal'
  return 'neutral'
}

export function AttendanceBadge({
  value,
  empty,
}: {
  value: number | string | null | undefined
  empty: string
}) {
  if (value == null || value === '') {
    return <Badge tone="neutral">{empty}</Badge>
  }
  const num = Number(value)
  if (!Number.isFinite(num)) return <Badge tone="neutral">{empty}</Badge>
  return <Badge tone={attendanceTone(num)}>{num}%</Badge>
}

export function dailyAttendanceText(row: {
  timetable?: number | string | null
  class_date_special_date?: { average_attendance?: number | string | null } | null
}): { kind: 'text'; text: string } | { kind: 'percent'; value: number | string | null | undefined } {
  if (Number(row.timetable) !== 1) return { kind: 'text', text: 'noTimetable' }
  if (row.class_date_special_date == null) return { kind: 'text', text: 'noLesson' }
  if (row.class_date_special_date.average_attendance == null) {
    return { kind: 'text', text: 'notMarked' }
  }
  return { kind: 'percent', value: row.class_date_special_date.average_attendance }
}

export function absenceAverage(row: {
  class_date?: { average_attendance?: number | string | null } | null
  class_date_special_date?: unknown
}): { kind: 'percent'; value: number | string } | { kind: 'empty' } {
  const value = row.class_date?.average_attendance
  if (row.class_date_special_date != null && value != null && value !== '') {
    return { kind: 'percent', value }
  }
  return { kind: 'empty' }
}

export function studentName(student?: AbsenceStudent | null) {
  return [student?.last_name, student?.first_name, student?.middle_name]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(' ')
}

export function studentPassport(student?: AbsenceStudent | null) {
  const serial = student?.passport?.serial ?? student?.passport?.seria ?? student?.passport_seria
  const number = student?.passport?.number ?? student?.passport_number
  return [serial, number].filter(Boolean).join(' ')
}

export function studentJshir(student?: AbsenceStudent | null) {
  return student?.passport?.jshir ?? student?.passport_jshir ?? ''
}

export function ChartBars({
  points,
}: {
  points: Array<{ key: string; name: string; value: number }>
}) {
  const { t } = useTranslation()
  if (points.length === 0) {
    return (
      <div className="flex min-h-72 flex-1 items-center justify-center rounded-xl border border-mist/70 bg-white">
        <EmptyState className="border-0" description={t('common.empty')} />
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-x-auto rounded-xl border border-mist/70 bg-white px-4 pt-4 pb-3">
      <div className="flex h-[28rem] min-w-full items-end gap-3">
        {points.map((point) => {
          const height = Math.max(0, Math.min(100, point.value))
          const tone = attendanceTone(point.value)
          const bar =
            tone === 'rose'
              ? 'bg-rose'
              : tone === 'amber'
                ? 'bg-amber'
                : tone === 'teal'
                  ? 'bg-teal'
                  : 'bg-signal'
          return (
            <div
              key={point.key}
              className="flex h-full min-w-16 flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="text-[13px] font-semibold text-deep">{point.value}%</span>
              <div className="relative w-full max-w-16 flex-1">
                <div
                  className={`absolute inset-x-0 bottom-0 rounded-t-lg ${bar}`}
                  style={{ height: `${Math.max(height, height > 0 ? 4 : 0)}%` }}
                  title={`${point.name}: ${point.value}%`}
                />
              </div>
              <span className="max-w-full truncate text-center text-[12px] text-muted" title={point.name}>
                {point.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function PageToolbar({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
      <h2 className="font-display text-sm font-semibold tracking-wide text-deep uppercase">
        {title}
      </h2>
      <div className="flex shrink-0 flex-nowrap items-end gap-2">{children}</div>
    </div>
  )
}
