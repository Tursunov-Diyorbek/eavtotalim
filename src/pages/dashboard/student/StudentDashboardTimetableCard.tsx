import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Calendar, Clock } from 'lucide-react'
import {
  EmptyState,
  Modal,
  Panel,
  SkeletonLines,
} from '@/components/ui'
import { pickLocalized } from '@/features/lessons'
import { cn, formatDate } from '@/lib'
import type { ScheduleDayItem } from '@/types'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatTime(iso: string | null | undefined) {
  if (!iso || iso.length < 16) return '—'
  return iso.slice(11, 16)
}

const WEEKDAY_KEYS = [
  'lessonSchedule.mon',
  'lessonSchedule.tue',
  'lessonSchedule.wed',
  'lessonSchedule.thu',
  'lessonSchedule.fri',
  'lessonSchedule.sat',
  'lessonSchedule.sun',
] as const

function weekdayLabel(iso: string | null | undefined, t: (k: string) => string) {
  if (!iso) return '—'
  const d = new Date(iso.slice(0, 10))
  const idx = (d.getDay() + 6) % 7
  return t(WEEKDAY_KEYS[idx] ?? WEEKDAY_KEYS[0])
}

type Props = {
  items: ScheduleDayItem[] | undefined
  isLoading: boolean
}

export function StudentDashboardTimetableCard({ items, isLoading }: Props) {
  const { t, i18n } = useTranslation()
  const [modalEntry, setModalEntry] = useState<ScheduleDayItem | null>(null)
  const todayKey = toDateKey(new Date())
  const todayLabel = formatDate(todayKey, i18n.language)

  const weekStart = useMemo(() => {
    const d = new Date()
    const day = (d.getDay() + 6) % 7
    d.setDate(d.getDate() - day)
    return formatDate(toDateKey(d), i18n.language)
  }, [i18n.language])

  const weekEnd = useMemo(() => {
    const d = new Date()
    const day = (d.getDay() + 6) % 7
    d.setDate(d.getDate() + (6 - day))
    return formatDate(toDateKey(d), i18n.language)
  }, [i18n.language])

  const todayEntries = useMemo(
    () =>
      (items ?? []).filter((e) => e.start_time?.slice(0, 10) === todayKey),
    [items, todayKey],
  )

  if (isLoading) {
    return (
      <>
        <Panel padding="sm" className="h-full">
          <SkeletonLines lines={3} />
        </Panel>
        <Panel padding="sm" className="h-full">
          <SkeletonLines lines={3} />
        </Panel>
      </>
    )
  }

  return (
    <>
      <Panel padding="sm" className="flex h-full flex-col gap-1.5">
          <div className="flex h-6 items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-deep">
              <BookOpen className="size-3.5 text-signal" aria-hidden />
              {t('dashboard.student.todayLessons')}
            </div>
            <span className="rounded bg-fog px-1.5 py-0.5 text-[9px] font-medium text-muted">
              {todayLabel}
            </span>
          </div>
          {todayEntries.length === 0 ? (
            <EmptyState
              className="border-0 py-2 shadow-none"
              description={t('dashboard.student.noLessonsToday')}
            />
          ) : (
            <div className="space-y-1">
              {todayEntries[0]?.handouts?.map((h, i) => {
                const title = pickLocalized(h.topic?.name, i18n.language)
                if (!title) return null
                return (
                  <div key={i} className="flex gap-1.5 text-[11px] leading-snug">
                    <span className="font-semibold text-signal">{i + 1}.</span>
                    <span className="text-deep">{title}</span>
                  </div>
                )
              })}
              {todayEntries.map((entry, i) => (
                <div
                  key={entry.id ?? i}
                  className="flex items-center gap-1 text-[11px] text-muted"
                >
                  <Clock className="size-3 shrink-0" aria-hidden />
                  {formatTime(entry.start_time)} – {formatTime(entry.end_time)}
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel padding="sm" className="flex h-full flex-col gap-1.5">
          <div className="flex h-6 items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-deep">
              <Calendar className="size-3.5 text-teal" aria-hidden />
              {t('dashboard.student.weekLessons')}
            </div>
            <span className="rounded bg-fog px-1.5 py-0.5 text-[9px] font-medium text-muted">
              {weekStart}–{weekEnd}
            </span>
          </div>
          {(items ?? []).length === 0 ? (
            <EmptyState
              className="border-0 py-2 shadow-none"
              description={t('dashboard.student.noLessonsToday')}
            />
          ) : (
            <ul className="space-y-1">
              {(items ?? []).map((entry, i) => {
                const key = entry.start_time?.slice(0, 10) ?? ''
                const isToday = key === todayKey
                return (
                  <li key={entry.id ?? i}>
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-center justify-between gap-1.5 rounded-lg border px-1.5 py-1 text-left text-[10px] transition hover:border-signal/30',
                        isToday
                          ? 'border-signal/40 bg-signal/5'
                          : 'border-mist/60',
                      )}
                      onClick={() => setModalEntry(entry)}
                    >
                      <span className="font-medium text-deep">
                        {weekdayLabel(entry.start_time, t)}
                      </span>
                      <span className="text-muted">
                        {formatDate(key, i18n.language)}
                      </span>
                      <span className="shrink-0 text-deep">
                        {formatTime(entry.start_time)} –{' '}
                        {formatTime(entry.end_time)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>

      <Modal
        open={modalEntry != null}
        onClose={() => setModalEntry(null)}
        title={
          modalEntry
            ? `${t('dashboard.student.lessonTopics')} ${formatDate(modalEntry.start_time?.slice(0, 10), i18n.language) ?? ''}`
            : ''
        }
        sizeClassName="max-w-lg"
      >
        {modalEntry ? (
          <div className="space-y-3">
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <Clock className="size-4" aria-hidden />
              {formatTime(modalEntry.start_time)} –{' '}
              {formatTime(modalEntry.end_time)}
            </p>
            <ul className="space-y-2">
              {modalEntry.handouts?.map((h, i) => {
                const title = pickLocalized(h.topic?.name, i18n.language)
                if (!title) return null
                return (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="font-semibold text-signal">{i + 1}.</span>
                    <span>{title}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </Modal>
    </>
  )
}
