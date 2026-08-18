import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Button,
  ErrorMessage,
  Input,
  Panel,
  SkeletonLines,
  notify,
} from '@/components/ui'
import { routes } from '@/config'
import {
  useGroupShowQuery,
  useUpdateGroupMutation,
} from '@/features/groups'
import { parseWeekDays } from '@/features/groups/utils'
import { asText } from '@/lib/apiPage'

const DAYS = [
  { id: '1', label: 'Du' },
  { id: '2', label: 'Se' },
  { id: '3', label: 'Ch' },
  { id: '4', label: 'Pa' },
  { id: '5', label: 'Ju' },
  { id: '6', label: 'Sh' },
  { id: '7', label: 'Ya' },
]

function withSeconds(value: string) {
  if (!value) return ''
  return value.length === 5 ? `${value}:00` : value
}

function sliceTime(value?: string | null) {
  return value?.slice(0, 5) ?? ''
}

function groupName(data: { name?: unknown; name_uz?: string | null }) {
  if (typeof data.name === 'string') return data.name
  if (data.name && typeof data.name === 'object' && 'uz' in data.name) {
    return String((data.name as { uz?: unknown }).uz ?? '')
  }
  return data.name_uz ?? ''
}

export function GroupEditPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const { data, isLoading, isError } = useGroupShowQuery(id)
  const updateMutation = useUpdateGroupMutation(id)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('12:00')
  const [practicalStart, setPracticalStart] = useState('14:00')
  const [practicalEnd, setPracticalEnd] = useState('17:00')
  const [weekDays, setWeekDays] = useState<string[]>(['1', '2', '3', '4', '5', '6'])
  const [practicalDays, setPracticalDays] = useState<string[]>([
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
  ])

  useEffect(() => {
    if (!data) return
    setName(groupName(data))
    setPrice(String(data.education_price ?? ''))
    setStartTime(sliceTime(data.start_time) || '08:00')
    setEndTime(sliceTime(data.end_time) || '12:00')
    setWeekDays(parseWeekDays(data.week_days).map(String))
  }, [data])

  const toggleDay = (dayId: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(dayId) ? list.filter((d) => d !== dayId) : [...list, dayId])
  }

  const submit = () => {
    if (!name || !price) {
      notify.error(t('groupsPage.fillRequired'))
      return
    }
    updateMutation.mutate(
      {
        name_uz: name,
        education_price: price,
        start_time: withSeconds(startTime),
        end_time: withSeconds(endTime),
        week_days: weekDays,
        practical_start_time: withSeconds(practicalStart),
        practical_end_time: withSeconds(practicalEnd),
        practical_week_days: practicalDays,
      },
      {
        onSuccess: () => {
          notify.success(t('common.saved'))
          navigate(routes.groups)
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  return (
    <>
      <Header
        title={t('groupsPage.edit')}
        description={name || asText(data?.name_uz)}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(routes.groups)}>
            {t('common.back')}
          </Button>
        }
      />
      <main className="flex-1 p-3 sm:p-4">
        {isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={8} />
          </Panel>
        ) : isError || !data ? (
          <ErrorMessage />
        ) : (
          <Panel padding="md">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                required
                label={t('groupsPage.colName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                required
                label={t('groupsPage.colPrice')}
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))}
              />
              <Input
                label={t('groupsPage.startTime')}
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <Input
                label={t('groupsPage.endTime')}
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
              <Input
                label={t('groupsPage.practicalStart')}
                type="time"
                value={practicalStart}
                onChange={(e) => setPracticalStart(e.target.value)}
              />
              <Input
                label={t('groupsPage.practicalEnd')}
                type="time"
                value={practicalEnd}
                onChange={(e) => setPracticalEnd(e.target.value)}
              />
            </div>
            <div className="mt-3">
              <p className="mb-1 text-[12px] font-semibold text-ink/65">
                {t('groupsPage.colDays')}
              </p>
              <div className="flex flex-wrap gap-1">
                {DAYS.map((day) => (
                  <Button
                    key={day.id}
                    variant="soft"
                    size="sm"
                    active={weekDays.includes(day.id)}
                    onClick={() => toggleDay(day.id, weekDays, setWeekDays)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-2">
              <p className="mb-1 text-[12px] font-semibold text-ink/65">
                {t('groupsPage.practicalDays')}
              </p>
              <div className="flex flex-wrap gap-1">
                {DAYS.map((day) => (
                  <Button
                    key={day.id}
                    variant="soft"
                    size="sm"
                    active={practicalDays.includes(day.id)}
                    onClick={() => toggleDay(day.id, practicalDays, setPracticalDays)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(routes.groups)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={updateMutation.isPending}
                onClick={submit}
              >
                {t('common.save')}
              </Button>
            </div>
          </Panel>
        )}
      </main>
    </>
  )
}
