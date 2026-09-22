import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  DateInput,
  EmptyState,
  Input,
  Notification,
  Panel,
  Select,
  notify,
} from '@/components/ui'
import { EDU_TYPES } from '@/config/eduTypes'
import { useSimulateMyGovMutation } from '@/features/my-gov-application'
import type { MyGovSimulateResult } from '@/api/my-gov-application'

const WEEKDAYS = [
  { value: '1', labelKey: 'myGovPage.day1' },
  { value: '2', labelKey: 'myGovPage.day2' },
  { value: '3', labelKey: 'myGovPage.day3' },
  { value: '4', labelKey: 'myGovPage.day4' },
  { value: '5', labelKey: 'myGovPage.day5' },
  { value: '6', labelKey: 'myGovPage.day6' },
  { value: '7', labelKey: 'myGovPage.day7' },
] as const

const TEACHER_TYPES = [
  { value: 1, labelKey: 'myGovPage.teacherTheory' },
  { value: 2, labelKey: 'myGovPage.teacherPractical' },
  { value: 3, labelKey: 'myGovPage.teacherOther' },
] as const

const ERROR_GROUPS = [
  { key: 'organization' as const, titleKey: 'myGovPage.errOrg' },
  { key: 'students' as const, titleKey: 'myGovPage.errStudents' },
  { key: 'cars' as const, titleKey: 'myGovPage.errCars' },
  { key: 'teachers' as const, titleKey: 'myGovPage.errTeachers' },
]

type StudentRow = { pinfl: string; birthday: string }
type TeacherRow = { pinfl: string; type_id: number }
type CarRow = { number: string }

export function MyGovSimulator() {
  const { t } = useTranslation()
  const simulateMutation = useSimulateMyGovMutation()
  const [eduTypeId, setEduTypeId] = useState('')
  const [groupName, setGroupName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [theoryDays, setTheoryDays] = useState<string[]>([])
  const [practicalDays, setPracticalDays] = useState('')
  const [theoryStart, setTheoryStart] = useState('')
  const [theoryEnd, setTheoryEnd] = useState('')
  const [practicalStart, setPracticalStart] = useState('')
  const [practicalEnd, setPracticalEnd] = useState('')
  const [students, setStudents] = useState<StudentRow[]>([])
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [cars, setCars] = useState<CarRow[]>([])
  const [result, setResult] = useState<MyGovSimulateResult | null>(null)

  const toggleDay = (value: string) => {
    setTheoryDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value],
    )
  }

  const submit = () => {
    if (!eduTypeId) {
      notify.error(t('myGovPage.pickEduType'))
      return
    }
    setResult(null)
    simulateMutation.mutate(
      {
        edu_type_id: Number(eduTypeId),
        group_name: groupName.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        theory_days: theoryDays.length ? theoryDays : undefined,
        practical_days: practicalDays === '' ? undefined : Number(practicalDays),
        theory_start_time: theoryStart || undefined,
        theory_end_time: theoryEnd || undefined,
        practical_start_time: practicalStart || undefined,
        practical_end_time: practicalEnd || undefined,
        students: students
          .filter((row) => row.pinfl.trim())
          .map((row) => ({
            pinfl: row.pinfl.trim(),
            birthday: row.birthday || undefined,
          })),
        teachers: teachers
          .filter((row) => row.pinfl.trim())
          .map((row) => ({
            pinfl: row.pinfl.trim(),
            type_id: row.type_id,
          })),
        cars: cars
          .filter((row) => row.number.trim())
          .map((row) => ({ number: row.number.trim() })),
      },
      {
        onSuccess: (data) => setResult(data),
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  const accepted = result?.decision === 'accepted'
  const hasErrors = ERROR_GROUPS.some(
    (g) => (result?.errors?.[g.key] ?? []).length > 0,
  )

  return (
    <Panel padding="md" className="shrink-0">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display m-0 text-base font-semibold text-deep">
            {t('myGovPage.simTitle')}
          </h3>
          <Badge tone="amber">{t('myGovPage.simBadge')}</Badge>
        </div>

        <Notification tone="info" title={t('myGovPage.simInfoTitle')}>
          {t('myGovPage.simInfo')}
        </Notification>

        {/* 1. Asosiy */}
        <FormBlock title={t('myGovPage.blockBasic')}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              required
              label={t('myGovPage.eduType')}
              value={eduTypeId}
              onChange={(e) => setEduTypeId(e.target.value)}
              options={EDU_TYPES.map((item) => ({
                value: String(item.id),
                label: item.shortName,
              }))}
              placeholder={t('myGovPage.pickEduType')}
            />
            <Input
              label={t('myGovPage.groupName')}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <DateInput
              label={t('directorList.startDate')}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <DateInput
              label={t('directorList.endDate')}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </FormBlock>

        {/* 2. Jadval */}
        <FormBlock title={t('myGovPage.blockSchedule')}>
          <div className="flex flex-col gap-3">
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[12px] font-semibold tracking-wide text-ink/65 sm:text-[13px]">
                {t('myGovPage.theoryDays')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((day) => {
                  const on = theoryDays.includes(day.value)
                  return (
                    <Button
                      key={day.value}
                      type="button"
                      variant={on ? 'primary' : 'outline'}
                      size="sm"
                      active={on}
                      className="h-8 px-2.5 text-[12px]"
                      onClick={() => toggleDay(day.value)}
                    >
                      {t(day.labelKey)}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Input
                type="number"
                min={0}
                label={t('myGovPage.practicalDays')}
                value={practicalDays}
                onChange={(e) => setPracticalDays(e.target.value)}
              />
              <Input
                type="time"
                label={t('myGovPage.theoryFrom')}
                value={theoryStart}
                onChange={(e) => setTheoryStart(e.target.value)}
              />
              <Input
                type="time"
                label={t('myGovPage.theoryTo')}
                value={theoryEnd}
                onChange={(e) => setTheoryEnd(e.target.value)}
              />
              <Input
                type="time"
                label={t('myGovPage.practicalFrom')}
                value={practicalStart}
                onChange={(e) => setPracticalStart(e.target.value)}
              />
              <Input
                type="time"
                label={t('myGovPage.practicalTo')}
                value={practicalEnd}
                onChange={(e) => setPracticalEnd(e.target.value)}
                className="col-span-2 sm:col-span-1"
              />
            </div>
          </div>
        </FormBlock>

        {/* 3. Ro‘yxatlar */}
        <FormBlock title={t('myGovPage.studentsPinfl')}>
          <DynamicList
            onAdd={() =>
              setStudents((prev) => [...prev, { pinfl: '', birthday: '' }])
            }
          >
            {students.map((row, index) => (
              <div
                key={`st-${index}`}
                className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Input
                  label={index === 0 ? t('myGovPage.pinfl') : ''}
                  value={row.pinfl}
                  onChange={(e) =>
                    setStudents((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, pinfl: e.target.value } : item,
                      ),
                    )
                  }
                />
                <DateInput
                  label={index === 0 ? t('dashboard.birthday') : ''}
                  value={row.birthday}
                  onChange={(e) =>
                    setStudents((prev) =>
                      prev.map((item, i) =>
                        i === index
                          ? { ...item, birthday: e.target.value }
                          : item,
                      ),
                    )
                  }
                />
                <RemoveRowButton
                  onClick={() =>
                    setStudents((prev) => prev.filter((_, i) => i !== index))
                  }
                />
              </div>
            ))}
          </DynamicList>
        </FormBlock>

        <FormBlock title={t('myGovPage.teachersPinfl')}>
          <DynamicList
            onAdd={() =>
              setTeachers((prev) => [...prev, { pinfl: '', type_id: 2 }])
            }
          >
            {teachers.map((row, index) => (
              <div
                key={`te-${index}`}
                className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Input
                  label={index === 0 ? t('myGovPage.pinfl') : ''}
                  value={row.pinfl}
                  onChange={(e) =>
                    setTeachers((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, pinfl: e.target.value } : item,
                      ),
                    )
                  }
                />
                <Select
                  label={index === 0 ? t('directorList.type') : ''}
                  value={row.type_id}
                  onChange={(e) =>
                    setTeachers((prev) =>
                      prev.map((item, i) =>
                        i === index
                          ? { ...item, type_id: Number(e.target.value) }
                          : item,
                      ),
                    )
                  }
                  options={TEACHER_TYPES.map((item) => ({
                    value: item.value,
                    label: t(item.labelKey),
                  }))}
                />
                <RemoveRowButton
                  onClick={() =>
                    setTeachers((prev) => prev.filter((_, i) => i !== index))
                  }
                />
              </div>
            ))}
          </DynamicList>
        </FormBlock>

        <FormBlock title={t('myGovPage.carsNumber')}>
          <DynamicList
            onAdd={() => setCars((prev) => [...prev, { number: '' }])}
          >
            {cars.map((row, index) => (
              <div key={`car-${index}`} className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  <Input
                    label={index === 0 ? t('directorList.number') : ''}
                    value={row.number}
                    placeholder="01A123AA"
                    onChange={(e) =>
                      setCars((prev) =>
                        prev.map((item, i) =>
                          i === index
                            ? { ...item, number: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </div>
                <RemoveRowButton
                  onClick={() =>
                    setCars((prev) => prev.filter((_, i) => i !== index))
                  }
                />
              </div>
            ))}
          </DynamicList>
        </FormBlock>

        <div>
          <Button
            variant="primary"
            loading={simulateMutation.isPending}
            onClick={submit}
          >
            {t('myGovPage.simulate')}
          </Button>
        </div>

        {result ? (
          <div className="flex flex-col gap-3 border-t border-mist/70 pt-4">
            <Notification
              tone={accepted ? 'success' : 'error'}
              title={result.decision_label}
            >
              {result.note}
            </Notification>
            {accepted && result.autodrome?.required ? (
              <Notification
                tone={result.autodrome.available ? 'success' : 'warning'}
              >
                {result.autodrome.available
                  ? t('myGovPage.autodromeOk', {
                      vip: result.autodrome.is_vip
                        ? t('myGovPage.autodromeVip')
                        : '',
                    })
                  : t('myGovPage.autodromeMissing')}
              </Notification>
            ) : null}
            {hasErrors ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {ERROR_GROUPS.map((group) => {
                  const msgs = result.errors?.[group.key] ?? []
                  if (!msgs.length) return null
                  return (
                    <Panel key={group.key} padding="md">
                      <p className="m-0 font-display text-sm font-semibold text-deep">
                        {t(group.titleKey)} ({msgs.length})
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-rose">
                        {msgs.map((msg) => (
                          <li key={msg}>{msg}</li>
                        ))}
                      </ul>
                    </Panel>
                  )
                })}
              </div>
            ) : accepted ? (
              <EmptyState description={t('myGovPage.noErrors')} />
            ) : null}
          </div>
        ) : null}
      </div>
    </Panel>
  )
}

function FormBlock({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-mist/60 bg-fog/25 p-3 sm:p-4">
      <p className="mb-3 font-display text-sm font-semibold text-deep">{title}</p>
      {children}
    </section>
  )
}

function DynamicList({
  onAdd,
  children,
}: {
  onAdd: () => void
  children: ReactNode
}) {
  const { t } = useTranslation()
  const hasRows = Array.isArray(children)
    ? children.length > 0
    : Boolean(children)

  return (
    <div className="flex flex-col gap-2">
      {hasRows ? <div className="flex flex-col gap-2">{children}</div> : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 w-full shrink-0 border-dashed border-mist/80 text-muted hover:border-signal/40 hover:text-signal"
        onClick={onAdd}
      >
        <Plus className="size-3.5" aria-hidden />
        {t('myGovPage.addRow')}
      </Button>
    </div>
  )
}

function RemoveRowButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <Button
      variant="danger"
      size="icon-sm"
      className="shrink-0"
      aria-label={t('common.delete')}
      onClick={onClick}
    >
      <Trash2 className="size-3.5" />
    </Button>
  )
}
