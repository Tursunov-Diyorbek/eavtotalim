import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  DateInput,
  Input,
  Modal,
  Select,
  notify,
} from '@/components/ui'
import { EDU_TYPES, eduTypeShortName } from '@/config'
import { useCreateGroupMutation } from '@/features/groups'

const LANGS = [
  { id: 1, labelKey: 'groupsPage.langUz' },
  { id: 5, labelKey: 'groupsPage.langKiril' },
  { id: 2, labelKey: 'groupsPage.langRu' },
  { id: 3, labelKey: 'groupsPage.langQq' },
]

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

type CreateGroupModalProps = {
  open: boolean
  onClose: () => void
}

export function CreateGroupModal({ open, onClose }: CreateGroupModalProps) {
  const { t } = useTranslation()
  const createMutation = useCreateGroupMutation()
  const year = String(new Date().getFullYear()).slice(-2)
  const [partNumber, setPartNumber] = useState('')
  const [partAdditional, setPartAdditional] = useState('')
  const [eduTypeId, setEduTypeId] = useState('')
  const [langId, setLangId] = useState('1')
  const [price, setPrice] = useState('')
  const [startDate, setStartDate] = useState('')
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

  const eduShort = eduTypeShortName(eduTypeId ? Number(eduTypeId) : null)
  const generatedName = useMemo(() => {
    if (!partNumber || !eduTypeId) return ''
    return `${partNumber}-${eduShort}-${year}${partAdditional ? `(${partAdditional})` : ''}`
  }, [partNumber, eduShort, eduTypeId, year, partAdditional])

  const toggleDay = (id: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(id) ? list.filter((d) => d !== id) : [...list, id])
  }

  const reset = () => {
    setPartNumber('')
    setPartAdditional('')
    setEduTypeId('')
    setLangId('1')
    setPrice('')
    setStartDate('')
    setStartTime('08:00')
    setEndTime('12:00')
    setPracticalStart('14:00')
    setPracticalEnd('17:00')
    setWeekDays(['1', '2', '3', '4', '5', '6'])
    setPracticalDays(['1', '2', '3', '4', '5', '6'])
  }

  const submit = () => {
    if (!partNumber || !eduTypeId || !price || !startDate) {
      notify.error(t('groupsPage.fillRequired'))
      return
    }
    createMutation.mutate(
      {
        name_uz: generatedName,
        education_price: price,
        start_time: withSeconds(startTime),
        end_time: withSeconds(endTime),
        edu_starting_date: startDate,
        lang_id: Number(langId),
        edu_type_id: Number(eduTypeId),
        week_days: weekDays,
        practical_start_time: withSeconds(practicalStart),
        practical_end_time: withSeconds(practicalEnd),
        practical_week_days: practicalDays,
        part_number: partNumber,
        part_additional: partAdditional || undefined,
      },
      {
        onSuccess: () => {
          notify.success(t('groupsPage.created'))
          reset()
          onClose()
        },
        onError: (err) => notify.error(err.message || t('common.loadError')),
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('groupsPage.create')}
      sizeClassName="max-w-3xl"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label={t('groupsPage.partNumber')}
          required
          value={partNumber}
          onChange={(e) => setPartNumber(e.target.value)}
        />
        <Input
          label={t('groupsPage.partAdditional')}
          value={partAdditional}
          onChange={(e) => setPartAdditional(e.target.value)}
        />
        <Select
          label={t('groupsPage.eduType')}
          value={eduTypeId}
          onChange={(e) => setEduTypeId(e.target.value)}
          options={EDU_TYPES.map((item) => ({
            value: item.id,
            label: item.shortName,
          }))}
        />
        <Select
          label={t('groupsPage.lang')}
          value={langId}
          onChange={(e) => setLangId(e.target.value)}
          options={LANGS.map((item) => ({
            value: item.id,
            label: t(item.labelKey),
          }))}
        />
        <Input
          label={t('groupsPage.colPrice')}
          required
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))}
        />
        <DateInput
          label={t('groupsPage.colStart')}
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
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

      {generatedName ? (
        <p className="mt-3 text-sm font-semibold text-deep">{generatedName}</p>
      ) : null}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="primary"
          size="sm"
          loading={createMutation.isPending}
          onClick={submit}
        >
          {t('common.save')}
        </Button>
      </div>
    </Modal>
  )
}
