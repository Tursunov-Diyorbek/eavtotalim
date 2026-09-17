import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarCheck, Eye } from 'lucide-react'
import { Panel } from '@/components/ui'
import { routes } from '@/config'
import { parsePercent } from '@/features/lessons'
import { cn } from '@/lib'
import type { StudentAttendanceStats } from '@/types/student'

type Props = {
  stats: StudentAttendanceStats | null | undefined
}

export function StudentDashboardAttendanceCard({ stats }: Props) {
  const { t } = useTranslation()
  const percent = parsePercent(stats?.average_attendance_percent)
  const total = Number(stats?.all_classes_count ?? 0)
  const missed = Number(stats?.absence_count ?? 0)
  const attended = Number(
    stats?.ended_classes_count ?? Math.max(0, total - missed),
  )
  const bar =
    percent < 70 ? 'bg-rose' : percent < 90 ? 'bg-amber' : 'bg-teal'

  const metrics = [
    { key: 'total', label: t('dashboard.student.totalHours'), value: total },
    {
      key: 'done',
      label: t('dashboard.student.completedHours'),
      value: attended,
    },
    {
      key: 'miss',
      label: t('dashboard.student.missedHours'),
      value: missed,
      link: routes.missedClasses,
    },
  ] as const

  return (
    <Panel padding="sm" className="flex h-full flex-col gap-2">
      <div className="flex h-6 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-indigo-soft text-indigo">
            <CalendarCheck className="size-3.5" aria-hidden />
          </span>
          <p className="truncate text-[12px] font-semibold text-deep">
            {t('dashboard.student.attendanceTitle')}
          </p>
        </div>
        <Link
          to={routes.missedClasses}
          className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-signal hover:bg-fog"
        >
          <Eye className="size-3" aria-hidden />
          {t('dashboard.student.details')}
        </Link>
      </div>

      <div>
        <div className="mb-0.5 flex justify-between text-[10px]">
          <span className="text-muted">
            {t('dashboard.student.attendancePercent')}
          </span>
          <span className="font-semibold text-deep">{percent}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-fog">
          <div
            className={cn('h-full rounded-full transition-all', bar)}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {metrics.map((m) => {
          const inner = (
            <>
              <p className="text-sm font-semibold leading-none text-deep">
                {m.value}
                <span className="ml-0.5 text-[9px] font-normal text-muted">
                  {t('dashboard.student.hourUnit')}
                </span>
              </p>
              <p className="mt-1 min-h-4 text-[9px] leading-tight text-muted">
                {m.label}
              </p>
            </>
          )
          if ('link' in m && m.link) {
            return (
              <Link
                key={m.key}
                to={m.link}
                className="flex h-14 min-w-0 flex-col items-center justify-center rounded-lg border border-mist/60 bg-fog/30 px-1 text-center transition hover:border-rose/40"
              >
                {inner}
              </Link>
            )
          }
          return (
            <div
              key={m.key}
              className="flex h-14 min-w-0 flex-col items-center justify-center rounded-lg border border-mist/60 bg-fog/30 px-1 text-center"
            >
              {inner}
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
