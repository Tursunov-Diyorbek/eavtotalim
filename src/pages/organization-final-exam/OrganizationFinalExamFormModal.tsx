import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, DateInput, Input, Modal, Select, notify } from '@/components/ui'
import { useGroupsQuery } from '@/features/groups'
import { asText } from '@/lib/apiPage'
import { formatDate } from '@/lib/format'
import type { OrganizationFinalExamRow } from '@/types/organization-final-exam'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function splitStamp(value?: string | null) {
  if (!value) return { date: '', time: '' }
  const normalized = value.replace('T', ' ').trim()
  const [date = '', timePart = ''] = normalized.split(' ')
  return { date, time: timePart.slice(0, 5) }
}

function joinStamp(date: string, time: string) {
  const clock = time.length === 5 ? `${time}:00` : time || '00:00:00'
  return `${date} ${clock}`
}

function nowRange() {
  const start = new Date()
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  const stamp = (d: Date) => ({
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  })
  return { start: stamp(start), end: stamp(end) }
}

export function OrganizationFinalExamFormModal({
  open,
  mode,
  exam,
  usedGroupIds,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean
  mode: 'create' | 'edit'
  exam?: OrganizationFinalExamRow | null
  usedGroupIds: number[]
  onClose: () => void
  onSubmit: (payload: {
    name?: string
    group_id?: number
    time: { start: string; end: string }
  }) => void
  loading?: boolean
}) {
  const { t, i18n } = useTranslation()
  const isCreate = mode === 'create'
  const [name, setName] = useState('Yakuniy imtihon')
  const [groupId, setGroupId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('00:00')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('00:00')

  const groupsQuery = useGroupsQuery({
    page: 1,
    showCount: 200,
    eduStatus: 'all',
  })
  const used = useMemo(() => new Set(usedGroupIds), [usedGroupIds])
  const groups = (groupsQuery.data?.data ?? []).filter(
    (group) => !used.has(group.id) || String(group.id) === groupId,
  )

  useEffect(() => {
    if (!open) return
    if (isCreate) {
      const range = nowRange()
      setName('Yakuniy imtihon')
      setGroupId('')
      setStartDate(range.start.date)
      setStartTime(range.start.time)
      setEndDate(range.end.date)
      setEndTime(range.end.time)
      return
    }
    const start = splitStamp(exam?.time?.start)
    const end = splitStamp(exam?.time?.end)
    setName(exam?.name?.trim() || 'Yakuniy imtihon')
    setGroupId(exam?.group?.id != null ? String(exam.group.id) : '')
    setStartDate(start.date)
    setStartTime(start.time || '00:00')
    setEndDate(end.date)
    setEndTime(end.time || '00:00')
  }, [open, isCreate, exam])

  const submit = () => {
    if (!startDate || !endDate) {
      notify.error(t('organizationFinalExamPage.selectDates'))
      return
    }
    if (isCreate && !groupId) {
      notify.error(t('organizationFinalExamPage.selectGroup'))
      return
    }
    onSubmit({
      name: name.trim() || 'Yakuniy imtihon',
      group_id: groupId ? Number(groupId) : undefined,
      time: {
        start: joinStamp(startDate, startTime),
        end: joinStamp(endDate, endTime),
      },
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        isCreate
          ? t('organizationFinalExamPage.create')
          : t('organizationFinalExamPage.editTitle')
      }
      sizeClassName="max-w-2xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          {isCreate ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const range = nowRange()
                setName('Yakuniy imtihon')
                setGroupId('')
                setStartDate(range.start.date)
                setStartTime(range.start.time)
                setEndDate(range.end.date)
                setEndTime(range.end.time)
              }}
            >
              {t('common.clear')}
            </Button>
          ) : null}
          <Button
            variant="primary"
            size="sm"
            loading={loading}
            onClick={submit}
          >
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {isCreate ? (
          <>
            <Input
              label={t('directorList.name')}
              value={name}
              readOnly
            />
            <Select
              required
              label={t('directorList.group')}
              value={groupId}
              onChange={(e) => {
                const next = e.target.value
                setGroupId(next)
                const group = groups.find((item) => String(item.id) === next)
                setName(
                  group?.name
                    ? `${group.name} (Yakuniy imtihon)`
                    : 'Yakuniy imtihon',
                )
              }}
              placeholder={t('organizationFinalExamPage.selectGroup')}
              options={groups.map((group) => {
                const start =
                  formatDate(group.edu_starting_date, i18n.language) ??
                  asText(group.edu_starting_date)
                const end =
                  formatDate(group.edu_ending_date, i18n.language) ??
                  asText(group.edu_ending_date)
                const active = Number(group.edu_status) === 1
                return {
                  value: group.id,
                  label: `${group.name || group.id} (${start} - ${end}) (${
                    active
                      ? t('organizationFinalExamPage.active')
                      : t('organizationFinalExamPage.inactive')
                  })`,
                }
              })}
            />
          </>
        ) : null}
        <DateInput
          required
          label={t('organizationFinalExamPage.startDate')}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          required
          type="time"
          label={t('organizationFinalExamPage.startTime')}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <DateInput
          required
          label={t('organizationFinalExamPage.endDate')}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Input
          required
          type="time"
          label={t('organizationFinalExamPage.endTime')}
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
    </Modal>
  )
}
