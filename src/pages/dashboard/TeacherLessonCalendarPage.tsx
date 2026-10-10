import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import { Button, ErrorMessage, Panel, Skeleton } from '@/components/ui'
import { routes } from '@/config'
import { useTeacherScheduleQuery } from '@/features/dashboard'
import { asLangName, cn } from '@/lib'
import type { TeacherScheduleDay } from '@/types/teacher-dashboard'
import {
  CalendarToolbar,
  LessonDayModal,
  WEEK,
  YearPanel,
  indexSchedule,
  isoOf,
  monthCells,
  type CalendarMode,
} from './teacherCalendar'

function topicsOf(rows: TeacherScheduleDay[], lang: string) {
  const names: string[] = []
  for (const row of rows) {
    for (const lesson of row.lessons ?? []) {
      for (const handout of lesson.handouts ?? []) {
        const name = asLangName(handout.topic, lang)
        if (name && name !== '—') names.push(name)
      }
    }
  }
  return names
}

export function TeacherLessonCalendarPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const query = useTeacherScheduleQuery()
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const [mode, setMode] = useState<CalendarMode>('month')
  const [picked, setPicked] = useState<string | null>(null)

  const byDate = useMemo(() => indexSchedule(query.data), [query.data])
  const cells = monthCells(cursor)
  const todayKey = isoOf(today)
  const selected = picked ? (byDate.get(picked) ?? []) : []

  return (
    <>
      <Header
        title={t('teacherDash.schedule')}
        onBack={() => navigate(routes.home)}
      />
      <PageMain fill>
        <Panel className="flex min-h-0 flex-1 flex-col">
          <CalendarToolbar cursor={cursor} mode={mode} onCursor={setCursor} onMode={setMode} />
          {query.isLoading ? (
            <div className="p-4">
              <Skeleton className="h-80 w-full" />
            </div>
          ) : query.isError ? (
            <div className="p-4">
              <ErrorMessage className="py-8" />
            </div>
          ) : mode === 'year' ? (
            <YearPanel
              cursor={cursor}
              today={today}
              onPick={(month) => {
                setCursor(new Date(cursor.getFullYear(), month, 1))
                setMode('month')
              }}
            />
          ) : (
            <div className="grid min-h-0 flex-1 grid-cols-7 content-start gap-1 overflow-auto px-3 pb-3">
              {WEEK.map((key) => (
                <div
                  key={key}
                  className="pb-1 text-center text-[11px] font-medium text-muted"
                >
                  {t(`lessonSchedule.${key}`)}
                </div>
              ))}
              {cells.map((cell) => {
                const key = isoOf(cell.date)
                const rows = cell.inMonth ? (byDate.get(key) ?? []) : []
                const topics = topicsOf(rows, i18n.language)
                const isToday = key === todayKey
                return (
                  <Button
                    key={key}
                    type="button"
                    variant="ghost"
                    className={cn(
                      '!h-auto min-h-24 !w-full !items-stretch !justify-start !rounded-xl !px-1.5 !py-1.5 !shadow-none',
                      !cell.inMonth && 'opacity-35',
                      rows.length > 0 && 'bg-fog/70',
                    )}
                    onClick={() => {
                      if (rows.length > 0) setPicked(key)
                    }}
                  >
                    <span className="flex w-full flex-col items-start gap-1">
                      <span
                        className={cn(
                          'inline-flex size-7 items-center justify-center rounded-lg text-[13px] font-semibold',
                          isToday ? 'bg-signal text-white' : 'text-deep',
                        )}
                      >
                        {cell.date.getDate()}
                      </span>
                      {topics.slice(0, 2).map((topic, index) => (
                        <span
                          key={`${topic}-${index}`}
                          className="w-full truncate rounded-md bg-teal/10 px-1 py-0.5 text-left text-[10px] font-medium text-teal"
                          title={topic}
                        >
                          {topic}
                        </span>
                      ))}
                      {topics.length > 2 ? (
                        <span className="text-[10px] font-medium text-muted">+{topics.length - 2}</span>
                      ) : null}
                    </span>
                  </Button>
                )
              })}
            </div>
          )}
          <LessonDayModal picked={picked} rows={selected} onClose={() => setPicked(null)} />
        </Panel>
      </PageMain>
    </>
  )
}
