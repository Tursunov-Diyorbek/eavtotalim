import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarClock } from 'lucide-react'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  ExportButton,
  Input,
  Notification,
  Panel,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import {
  gaiStatusOf,
  parseWeekDays,
  useCreateTimetableMutation,
  useGroupTimetableQuery,
} from '@/features/groups'
import { downloadXls } from '@/lib/downloadXls'
import { asLangName } from '@/lib/apiPage'
import { formatDateTime } from '@/lib/format'
import type { GroupItem, GroupTimetableHandout } from '@/types/groups'
import { MoveTimetableModal } from './MoveTimetableModal'
import { TabToolbar } from './TabToolbar'

type GroupTimetableTabProps = {
  groupId: string
  group: GroupItem
  canMutate: boolean
}

const DAYS = [
  { id: '1', label: 'Du' },
  { id: '2', label: 'Se' },
  { id: '3', label: 'Ch' },
  { id: '4', label: 'Pa' },
  { id: '5', label: 'Ju' },
  { id: '6', label: 'Sh' },
] as const

function hoursBetween(start?: string | null, end?: string | null) {
  if (!start || !end) return 4
  const a = new Date(`1970-01-01T${start.length === 5 ? `${start}:00` : start}Z`)
  const b = new Date(`1970-01-01T${end.length === 5 ? `${end}:00` : end}Z`)
  const hours = (b.getTime() - a.getTime()) / 3_600_000
  return Number.isFinite(hours) && hours > 0 ? Math.floor(hours) : 4
}

function withSeconds(value: string) {
  if (!value) return ''
  return value.length === 5 ? `${value}:00` : value
}

function handoutTitle(handout: GroupTimetableHandout, lang: string) {
  const name = asLangName(handout.topic?.name, lang)
  const short = handout.topic?.lesson?.short_name
  return short ? `(${short}) ${name}` : name
}

function gaiCreateMessage(checkGai: GroupItem['check_gai'], t: (key: string) => string) {
  const status = gaiStatusOf(checkGai)
  if (status === 'notSent') return t('groupsPage.showPage.gaiNeedSend')
  if (status === 'rejected') return t('groupsPage.showPage.gaiReturned')
  if (status === 'waiting') return t('groupsPage.showPage.gaiNotApproved')
  return null
}

/** Eski `LessonSchedule` + `LessonScheduleAdd` — dars jadvali, yaratish, ko‘chirish, EXPORT. */
export function GroupTimetableTab({
  groupId,
  group,
  canMutate,
}: GroupTimetableTabProps) {
  const { t, i18n } = useTranslation()
  const hasTimetable = Number(group.timetable) === 1
  const query = useGroupTimetableQuery(groupId, hasTimetable)
  const createMutation = useCreateTimetableMutation()
  const [moveOpen, setMoveOpen] = useState(false)

  const presetDays = parseWeekDays(group.week_days).map(String)
  const [weekDays, setWeekDays] = useState<string[]>(
    presetDays.length ? presetDays : ['1', '2', '3', '4', '5', '6'],
  )
  const [startingTime, setStartingTime] = useState(
    (group.start_time ?? '09:00').slice(0, 5),
  )
  const [duration, setDuration] = useState(
    String(hoursBetween(group.start_time, group.end_time)),
  )
  const daysLocked = presetDays.length > 0

  const rows = query.data ?? []
  const gaiBlock = gaiCreateMessage(group.check_gai, t)

  const exportRows = useMemo(
    () =>
      rows.map((row, index) => [
        `${index + 1} - ${t('groupsPage.showPage.day')}`,
        formatDateTime(row.start_time, i18n.language) ?? '',
        formatDateTime(row.end_time, i18n.language) ?? '',
        (row.handouts ?? [])
          .map((handout) => handoutTitle(handout, i18n.language))
          .join('; '),
      ]),
    [i18n.language, rows, t],
  )

  const toggleDay = (id: string) => {
    if (daysLocked) return
    setWeekDays((prev) =>
      prev.includes(id) ? prev.filter((day) => day !== id) : [...prev, id],
    )
  }

  const onCreate = () => {
    if (gaiBlock) {
      notify.warning(gaiBlock)
      return
    }
    createMutation.mutate(
      {
        groupId,
        weekDays,
        startingTime: withSeconds(startingTime),
        duration: Number(duration) || 0,
      },
      {
        onSuccess: () => notify.success(t('common.saved')),
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  if (!hasTimetable) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <TabToolbar title={t('groupsPage.showPage.timetableTitle')} />
        {group.uztelecom_aes_event_id ? (
          <Notification tone="warning">
            {t('groupsPage.showPage.autoTimetable')}
          </Notification>
        ) : null}
        {canMutate ? (
          <Panel padding="md" className="space-y-4">
            <h3 className="font-display text-sm font-semibold text-deep">
              {t('groupsPage.showPage.createTimetable')}
            </h3>
            <div>
              <p className="mb-2 text-xs font-medium text-muted">
                {t('groupsPage.showPage.timetableDays')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((day) => (
                  <Button
                    key={day.id}
                    variant="outline"
                    size="sm"
                    active={weekDays.includes(day.id)}
                    disabled={daysLocked}
                    onClick={() => toggleDay(day.id)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label={t('groupsPage.showPage.timetableDuration')}
                name="duration"
                type="number"
                min={1}
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />
              <Input
                label={t('groupsPage.showPage.startingTime')}
                name="starting_time"
                type="time"
                value={startingTime}
                onChange={(event) => setStartingTime(event.target.value)}
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              loading={createMutation.isPending}
              onClick={onCreate}
            >
              {t('groupsPage.showPage.createTimetable')}
            </Button>
          </Panel>
        ) : (
          <EmptyState description={t('groupsPage.showPage.noTimetable')} />
        )}
      </div>
    )
  }

  if (query.isLoading) {
    return (
      <Panel padding="md">
        <SkeletonLines lines={8} />
      </Panel>
    )
  }
  if (query.isError) return <ErrorMessage />

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <TabToolbar
        title={t('groupsPage.showPage.timetableTitle')}
        actions={
          <>
            {canMutate ? (
              <Button variant="ghost" size="sm" onClick={() => setMoveOpen(true)}>
                <CalendarClock className="size-3.5" aria-hidden />
                {t('groupsPage.showPage.moveTimetable')}
              </Button>
            ) : null}
            <ExportButton
              disabled={!exportRows.length}
              onClick={() =>
                downloadXls(
                  'dars-jadvali',
                  [
                    '№',
                    t('groupsPage.showPage.startTime'),
                    t('groupsPage.showPage.endTime'),
                    t('groupsPage.showPage.lessonName'),
                  ],
                  exportRows,
                )
              }
            />
          </>
        }
      />
      <Table storageKey="group-show:timetable" className="min-w-200">
        <THead>
          <TR>
            <TH className="w-20 text-center">№</TH>
            <TH className="w-48">{t('groupsPage.showPage.startTime')}</TH>
            <TH className="w-48">{t('groupsPage.showPage.endTime')}</TH>
            <TH>{t('groupsPage.showPage.lessonName')}</TH>
          </TR>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <TR>
              <TD className="py-6 text-center" colSpan={4}>
                <EmptyState
                  className="border-0 py-4 shadow-none"
                  description={t('groupsPage.showPage.noTimetable')}
                />
              </TD>
            </TR>
          ) : (
            rows.map((row, index) => (
              <TR key={row.id ?? index}>
                <TD className="text-center font-semibold text-muted">
                  {index + 1} - {t('groupsPage.showPage.day')}
                </TD>
                <TD className="text-xs">
                  <Badge tone="teal">
                    {formatDateTime(row.start_time, i18n.language) ?? '—'}
                  </Badge>
                </TD>
                <TD className="text-xs">
                  <Badge tone="rose">
                    {formatDateTime(row.end_time, i18n.language) ?? '—'}
                  </Badge>
                </TD>
                <TD>
                  <div className="space-y-2">
                    {(row.handouts ?? []).map((handout, i) => {
                      const theory = Number(handout.topic?.type) === 1
                      return (
                        <div key={i} className="border-l-4 border-mist pl-2">
                          <Badge tone={theory ? 'amber' : 'teal'}>
                            {handout.hours}{' '}
                            {theory
                              ? t('groupsPage.showPage.theory')
                              : t('groupsPage.showPage.practical')}
                          </Badge>
                          <p className="mt-1 text-xs text-deep">
                            {handoutTitle(handout, i18n.language)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>
      <MoveTimetableModal
        open={moveOpen}
        onClose={() => setMoveOpen(false)}
        groupId={groupId}
      />
    </div>
  )
}
