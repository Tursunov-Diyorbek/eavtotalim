import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { storeExtraLessons } from '@/api'
import { Button, Checkbox, DateInput, Input, Modal, Textarea, notify } from '@/components/ui'

const WEEKDAYS = [
  { value: 1, key: 'du' },
  { value: 2, key: 'se' },
  { value: 3, key: 'cho' },
  { value: 4, key: 'pa' },
  { value: 5, key: 'ju' },
  { value: 6, key: 'sha' },
  { value: 0, key: 'yak' },
] as const

function datesInRange(start: string, end: string, weekdays: number[]) {
  if (!start || !end || !weekdays.length) return []
  const set = new Set(weekdays)
  const dates: string[] = []
  const cur = new Date(`${start}T00:00:00`)
  const last = new Date(`${end}T00:00:00`)
  while (cur.getTime() <= last.getTime()) {
    if (set.has(cur.getDay())) {
      dates.push(cur.toISOString().slice(0, 10))
    }
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

export function ExtraLessonCreateModal({
  open,
  onClose,
  studentId,
  groupId,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  studentId: string
  groupId: number | null | undefined
  onSaved: () => void
}) {
  const { t } = useTranslation()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5, 6])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:30')
  const [note, setNote] = useState('')

  const lessonDates = useMemo(
    () => datesInRange(fromDate, toDate, weekdays),
    [fromDate, toDate, weekdays],
  )

  const save = useMutation({
    mutationFn: () => {
      if (!groupId) throw new Error(t('students.showPage.groupMissing'))
      if (!lessonDates.length) throw new Error(t('students.showPage.extraDatesRequired'))
      return storeExtraLessons({
        student_ids: [Number(studentId)],
        group_id: groupId,
        lesson_dates: lessonDates,
        start_time: startTime || '09:00',
        end_time: endTime || '10:30',
        note: note.trim() || undefined,
      })
    },
    onSuccess: (res) => {
      notify.success(res.message || t('students.showPage.extraAdded'))
      onSaved()
      onClose()
    },
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('students.showPage.extraAddTitle')}
      sizeClassName="max-w-lg"
      dismissible={!save.isPending}
    >
      <div className="space-y-3">
        <p className="text-sm text-muted">{t('students.showPage.extraAddHint')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <DateInput
            label={t('students.showPage.fromDate')}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <DateInput
            label={t('students.showPage.toDate')}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <Input
            label={t('students.showPage.startTime')}
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label={t('students.showPage.endTime')}
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-ink/65">
            {t('students.showPage.weekdays')}
          </p>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <label key={day.value} className="inline-flex items-center gap-1.5 text-sm">
                <Checkbox
                  checked={weekdays.includes(day.value)}
                  onChange={(checked) => {
                    setWeekdays((prev) =>
                      checked
                        ? [...prev, day.value]
                        : prev.filter((v) => v !== day.value),
                    )
                  }}
                />
                {t(`students.showPage.wd_${day.key}`)}
              </label>
            ))}
          </div>
        </div>
        <Textarea
          label={t('students.showPage.note')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <p className="text-[12px] text-muted">
          {t('students.showPage.extraLessonCount')}: {lessonDates.length}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={save.isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={save.isPending}
            onClick={() => save.mutate()}
          >
            {t('common.add')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
