import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'
import { Button, Modal, Select, Tabs } from '@/components/ui'
import { asLangName, formatDate } from '@/lib'
import type { TeacherScheduleDay } from '@/types/teacher-dashboard'

export const WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

export const MONTHS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const

export type CalendarMode = 'month' | 'year'

export function isoOf(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function monthCells(cursor: Date) {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const first = new Date(year, month, 1)
  const lead = first.getDay()
  const count = new Date(year, month + 1, 0).getDate()
  const cells: { date: Date; inMonth: boolean }[] = []
  for (let i = 0; i < lead; i += 1) {
    cells.push({ date: new Date(year, month, 1 - (lead - i)), inMonth: false })
  }
  for (let day = 1; day <= count; day += 1) {
    cells.push({ date: new Date(year, month, day), inMonth: true })
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date
    cells.push({
      date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
      inMonth: false,
    })
  }
  return cells
}

export function clock(value: string | null | undefined): string {
  if (!value) return '—'
  const match = value.match(/(\d{2}:\d{2})/)
  return match?.[1] ?? value
}

export function indexSchedule(rows: TeacherScheduleDay[] | undefined) {
  const map = new Map<string, TeacherScheduleDay[]>()
  for (const row of rows ?? []) {
    const key = String(row.date ?? '').slice(0, 10)
    if (!key) continue
    const list = map.get(key) ?? []
    list.push(row)
    map.set(key, list)
  }
  return map
}

export function markedCount(rows: TeacherScheduleDay[] | undefined) {
  if (!rows?.length) return 0
  const marked = rows.some((row) =>
    (row.lessons ?? []).some((lesson) => (lesson.handouts?.length ?? 0) > 0),
  )
  return marked ? rows.length : 0
}

export function CalendarToolbar({
  cursor,
  mode,
  onCursor,
  onMode,
}: {
  cursor: Date
  mode: CalendarMode
  onCursor: (date: Date) => void
  onMode: (mode: CalendarMode) => void
}) {
  const { t } = useTranslation()
  const thisYear = new Date().getFullYear()
  const start = Math.min(thisYear - 10, cursor.getFullYear())
  const end = Math.max(thisYear + 10, cursor.getFullYear())
  const years = useMemo(() => {
    const list: { value: string; label: string }[] = []
    for (let year = start; year <= end; year += 1) {
      list.push({ value: String(year), label: String(year) })
    }
    return list
  }, [start, end])
  const months = MONTHS.map((key, index) => ({
    value: String(index),
    label: t(`lessonSchedule.${key}`),
  }))

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 px-3 py-2">
      <Select
        size="sm"
        searchable={false}
        className="!w-[5.75rem] !min-w-0"
        value={String(cursor.getFullYear())}
        options={years}
        onChange={(event) =>
          onCursor(new Date(Number(event.target.value), cursor.getMonth(), 1))
        }
      />
      <Select
        size="sm"
        searchable={false}
        className="!w-[8.5rem] !min-w-0"
        value={String(cursor.getMonth())}
        options={months}
        onChange={(event) =>
          onCursor(new Date(cursor.getFullYear(), Number(event.target.value), 1))
        }
      />
      <Tabs
        size="sm"
        value={mode}
        onChange={onMode}
        aria-label={t('teacherDash.schedule')}
        items={[
          { value: 'month', label: t('lessonSchedule.filterMonth') },
          { value: 'year', label: t('lessonSchedule.filterYear') },
        ]}
      />
    </div>
  )
}

export function YearPanel({
  cursor,
  today,
  onPick,
}: {
  cursor: Date
  today: Date
  onPick: (month: number) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-3 gap-2 p-3">
      {MONTHS.map((key, index) => {
        const selected = index === cursor.getMonth()
        const isNow =
          index === today.getMonth() && cursor.getFullYear() === today.getFullYear()
        return (
          <Button
            key={key}
            type="button"
            variant={selected ? 'primary' : isNow ? 'soft' : 'ghost'}
            className="!h-12 !shadow-none"
            onClick={() => onPick(index)}
          >
            {t(`lessonSchedule.${key}`)}
          </Button>
        )
      })}
    </div>
  )
}

export function LessonDayModal({
  picked,
  rows,
  onClose,
}: {
  picked: string | null
  rows: TeacherScheduleDay[]
  onClose: () => void
}) {
  const { t, i18n } = useTranslation()
  return (
    <Modal
      open={picked != null}
      onClose={onClose}
      title={picked ? formatDate(picked) : t('teacherDash.lessons')}
      sizeClassName="max-w-lg"
    >
      <div className="flex flex-col gap-2">
        {rows.flatMap((row, rowIndex) =>
          (row.lessons ?? []).map((lesson, lessonIndex) => (
            <div
              key={`${rowIndex}-${lessonIndex}`}
              className="rounded-xl border border-mist/80 bg-fog/40 p-3"
            >
              <p className="text-[13px] font-semibold text-deep">
                {asLangName(lesson.group, i18n.language)} — {t('teacherDash.group')} (
                {clock(lesson.start_time)} / {clock(lesson.end_time)})
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {(lesson.handouts ?? []).length ? (
                  lesson.handouts?.map((handout) => (
                    <div
                      key={
                        handout.id ??
                        `${rowIndex}-${lessonIndex}-${asLangName(handout.topic, i18n.language)}`
                      }
                      className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-[13px] text-ink"
                    >
                      <BookOpen className="size-4 shrink-0 text-signal" aria-hidden />
                      <span>{asLangName(handout.topic, i18n.language)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] text-muted">{t('teacherDash.noLessons')}</p>
                )}
              </div>
            </div>
          )),
        )}
      </div>
    </Modal>
  )
}
