import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Button,
  DateInput,
  ErrorMessage,
  Input,
  Panel,
  PhoneInput,
  Select,
  SkeletonLines,
  notify,
} from '@/components/ui'
import { EDU_TYPES, routes } from '@/config'
import {
  useCreateTeacherMutation,
  useTeacherCreateOptionsQuery,
  useUpdateTeacherMutation,
} from '@/features/teachers'
import { useMspdPersonSearchMutation } from '@/features/director-profile'
import { asFio, asText } from '@/lib/apiPage'
import { displayToIsoDate, toPhoneValue } from '@/lib'
import type { TeacherDetail } from '@/types/teachers'

const LANGS = [
  { id: '1', labelKey: 'groupsPage.langUz' },
  { id: '5', labelKey: 'groupsPage.langKiril' },
  { id: '2', labelKey: 'groupsPage.langRu' },
  { id: '3', labelKey: 'groupsPage.langQq' },
]

type FormState = {
  last_name: string
  first_name: string
  middle_name: string
  birthday: string
  gender: string
  phone1: string
  address: string
  passport_seria: string
  passport_number: string
  passport_jshir: string
  passport_given_date: string
  passport_given_place: string
  citizenship_id: string
  status: string
  institution_name: string
  specialization: string
  diplom_seria: string
  diplom_number: string
  diplom_given_date: string
  license_seria: string
  license_number: string
  license_date: string
}

const EMPTY: FormState = {
  last_name: '',
  first_name: '',
  middle_name: '',
  birthday: '',
  gender: '',
  phone1: '',
  address: '',
  passport_seria: '',
  passport_number: '',
  passport_jshir: '',
  passport_given_date: '',
  passport_given_place: '',
  citizenship_id: '',
  status: '1',
  institution_name: '',
  specialization: '',
  diplom_seria: '',
  diplom_number: '',
  diplom_given_date: '',
  license_seria: '',
  license_number: '',
  license_date: '',
}

function toIso(value: unknown): string {
  if (value == null || value === '') return ''
  return displayToIsoDate(String(value)) || String(value).slice(0, 10)
}

function idsOf(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (item && typeof item === 'object' && 'id' in item) {
        return String((item as { id?: unknown }).id ?? '')
      }
      return String(item)
    })
    .filter(Boolean)
}

function dataToForm(data: TeacherDetail): FormState {
  return {
    last_name: data.last_name ?? '',
    first_name: data.first_name ?? '',
    middle_name: data.middle_name ?? '',
    birthday: toIso(data.birthday),
    gender: data.gender == null ? '' : String(data.gender),
    phone1: toPhoneValue(data.phone1 ?? data.phone ?? ''),
    address: data.address ?? '',
    passport_seria: (data.passport_seria ?? '').toUpperCase(),
    passport_number: data.passport_number ?? '',
    passport_jshir: data.passport_jshir ?? '',
    passport_given_date: toIso(data.passport_given_date),
    passport_given_place: data.passport_given_place ?? '',
    citizenship_id: String(data.citizenship?.id ?? data.citizenship_id ?? ''),
    status: data.status == null ? '1' : String(Number(data.status)),
    institution_name: data.institution_name ?? '',
    specialization: data.specialization ?? '',
    diplom_seria: data.diplom_seria ?? '',
    diplom_number: data.diplom_number ?? '',
    diplom_given_date: toIso(data.diplom_given_date),
    license_seria: data.license_seria ?? '',
    license_number: data.license_number ?? '',
    license_date: toIso(data.license_date),
  }
}

function appendAll(fd: FormData, form: FormState, langs: string[], types: string[], eduTypes: string[]) {
  const skip = new Set(['phone1'])
  for (const [key, value] of Object.entries(form)) {
    if (skip.has(key)) continue
    fd.append(key, value ?? '')
  }
  fd.append('phone1', form.phone1)
  langs.forEach((id, i) => fd.append(`edu_langs[${i}]`, id))
  types.forEach((id, i) => fd.append(`type_id[${i}]`, id))
  eduTypes.forEach((id, i) => fd.append(`edu_types[${i}]`, id))
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}

export function TeacherForm({
  mode,
  teacherId,
  initial,
}: {
  mode: 'create' | 'edit'
  teacherId?: string
  initial?: TeacherDetail | null
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: options, isLoading: optionsLoading, isError: optionsError } = useTeacherCreateOptionsQuery()
  const createMutation = useCreateTeacherMutation()
  const updateMutation = useUpdateTeacherMutation(teacherId ?? '')
  const mspd = useMspdPersonSearchMutation()

  const [form, setForm] = useState<FormState>(EMPTY)
  const [langs, setLangs] = useState<string[]>(['1'])
  const [types, setTypes] = useState<string[]>([])
  const [eduTypes, setEduTypes] = useState<string[]>([])
  const [searchSeria, setSearchSeria] = useState('')
  const [searchNumber, setSearchNumber] = useState('')
  const [searchBirthday, setSearchBirthday] = useState('')

  useEffect(() => {
    if (!initial) return
    setForm(dataToForm(initial))
    setLangs(idsOf(initial.edu_langs).length ? idsOf(initial.edu_langs) : ['1'])
    setTypes(idsOf(initial.type_id))
    setEduTypes(idsOf(initial.edu_types))
    setSearchSeria((initial.passport_seria ?? '').toUpperCase())
    setSearchNumber(initial.passport_number ?? '')
    setSearchBirthday(toIso(initial.birthday))
  }, [initial])

  useEffect(() => {
    if (mode !== 'create' || form.citizenship_id || !options?.citizenships?.length) return
    setForm((prev) => ({
      ...prev,
      citizenship_id: String(options.citizenships?.[0]?.id ?? ''),
    }))
  }, [mode, options, form.citizenship_id])

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const saving = createMutation.isPending || updateMutation.isPending

  const onSearch = async () => {
    if (!searchSeria || !searchNumber || !searchBirthday) {
      notify.error(t('teachersPage.fillRequired'))
      return
    }
    const res = await mspd.mutateAsync({
      passport_seria: searchSeria,
      passport_number: searchNumber,
      birthday: searchBirthday,
    })
    const found = res.data
    if (!found) return
    setForm((prev) => ({
      ...prev,
      last_name: found.last_name ?? prev.last_name,
      first_name: found.first_name ?? prev.first_name,
      middle_name: found.middle_name ?? prev.middle_name,
      birthday: toIso(found.birthday) || prev.birthday,
      passport_jshir: found.passport_jshir ?? prev.passport_jshir,
      passport_seria: (found.passport_seria ?? prev.passport_seria).toUpperCase(),
      passport_number: found.passport_number ?? prev.passport_number,
      gender:
        found.gender === 0 || found.gender === '0'
          ? '0'
          : found.gender === 1 || found.gender === '1'
            ? '1'
            : prev.gender,
      passport_given_place: found.passport_given_place ?? prev.passport_given_place,
    }))
  }

  const submit = () => {
    if (!form.last_name || !form.first_name || !form.birthday || !form.passport_seria || !form.passport_number) {
      notify.error(t('teachersPage.fillRequired'))
      return
    }
    if (!langs.length || !eduTypes.length || !types.length) {
      notify.error(t('teachersPage.fillRequired'))
      return
    }
    const fd = new FormData()
    appendAll(fd, form, langs, types, eduTypes)
    const onOk = () => {
      notify.success(mode === 'create' ? t('common.created') : t('common.saved'))
      navigate(routes.teachers)
    }
    const onErr = (err: Error) => notify.error(err.message || t('common.loadError'))
    if (mode === 'create') {
      createMutation.mutate(fd, { onSuccess: onOk, onError: onErr })
    } else {
      updateMutation.mutate(fd, { onSuccess: onOk, onError: onErr })
    }
  }

  const title =
    mode === 'create' ? t('teachersPage.create') : t('teachersPage.edit')
  const typeOptions = options?.teacher_types ?? []
  const eduTypeOptions =
    options?.edu_types?.length ? options.edu_types : EDU_TYPES.map((item) => ({ id: Number(item.id), short_name: item.shortName }))

  return (
    <>
      <Header
        title={title}
        description={initial ? asFio(initial) : undefined}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(routes.teachers)}>
            {t('common.back')}
          </Button>
        }
      />
      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {optionsError ? <ErrorMessage /> : null}
        {optionsLoading && !options ? (
          <Panel padding="md">
            <SkeletonLines lines={10} />
          </Panel>
        ) : (
          <Panel padding="md">
            <div className="mb-3 flex flex-wrap items-end gap-2">
              <Input
                label={t('directorProfile.passportSeria')}
                value={searchSeria}
                maxLength={2}
                className="w-20"
                onChange={(e) =>
                  setSearchSeria(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))
                }
              />
              <Input
                label={t('directorProfile.passportNumber')}
                value={searchNumber}
                maxLength={7}
                className="w-28"
                onChange={(e) =>
                  setSearchNumber(e.target.value.replace(/\D/g, '').slice(0, 7))
                }
              />
              <DateInput
                label={t('directorProfile.birthday')}
                value={searchBirthday}
                onChange={(e) => setSearchBirthday(e.target.value)}
              />
              <Button
                variant="outline"
                size="md"
                loading={mspd.isPending}
                onClick={() => void onSearch()}
              >
                <Search className="size-4" aria-hidden />
                {t('directorProfile.search')}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                required
                label={t('teachersPage.lastName')}
                value={form.last_name}
                onChange={(e) => setField('last_name', e.target.value)}
              />
              <Input
                required
                label={t('teachersPage.firstName')}
                value={form.first_name}
                onChange={(e) => setField('first_name', e.target.value)}
              />
              <Input
                label={t('teachersPage.middleName')}
                value={form.middle_name}
                onChange={(e) => setField('middle_name', e.target.value)}
              />
              <DateInput
                required
                label={t('directorProfile.birthday')}
                value={form.birthday}
                onChange={(e) => setField('birthday', e.target.value)}
              />
              <Select
                label={t('directorProfile.gender')}
                value={form.gender}
                onChange={(e) => setField('gender', e.target.value)}
                options={[
                  { value: '1', label: t('directorProfile.male') },
                  { value: '0', label: t('directorProfile.female') },
                ]}
              />
              <PhoneInput
                required
                label={t('directorProfile.phone')}
                value={form.phone1}
                onChange={(e) => setField('phone1', e.target.value)}
              />
              <Input
                required
                label={t('teachersPage.passport')}
                value={`${form.passport_seria}${form.passport_number}`}
                onChange={(e) => {
                  const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                  setField('passport_seria', raw.slice(0, 2).replace(/[^A-Z]/g, ''))
                  setField('passport_number', raw.slice(2).replace(/\D/g, '').slice(0, 7))
                }}
              />
              <Input
                label={t('teachersPage.jshir')}
                value={form.passport_jshir}
                onChange={(e) =>
                  setField('passport_jshir', e.target.value.replace(/\D/g, '').slice(0, 14))
                }
              />
              <DateInput
                label={t('teachersPage.passportGivenDate')}
                value={form.passport_given_date}
                onChange={(e) => setField('passport_given_date', e.target.value)}
              />
              <Input
                label={t('teachersPage.passportGivenPlace')}
                value={form.passport_given_place}
                onChange={(e) => setField('passport_given_place', e.target.value)}
              />
              <Input
                label={t('directorProfile.address')}
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
              />
              <Select
                label={t('teachersPage.citizenship')}
                value={form.citizenship_id}
                onChange={(e) => setField('citizenship_id', e.target.value)}
                options={(options?.citizenships ?? []).map((item) => ({
                  value: String(item.id),
                  label: asText(item.name),
                }))}
              />
              <Select
                label={t('directorList.status')}
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                options={[
                  { value: '1', label: t('dashboard.active') },
                  { value: '0', label: t('dashboard.inactive') },
                ]}
              />
              <Input
                label={t('teachersPage.institution')}
                value={form.institution_name}
                onChange={(e) => setField('institution_name', e.target.value)}
              />
              <Input
                label={t('teachersPage.specialization')}
                value={form.specialization}
                onChange={(e) => setField('specialization', e.target.value)}
              />
              <Input
                label={t('teachersPage.diplom')}
                value={form.diplom_seria}
                onChange={(e) => setField('diplom_seria', e.target.value)}
              />
              <Input
                label={t('teachersPage.diplomNumber')}
                value={form.diplom_number}
                onChange={(e) => setField('diplom_number', e.target.value)}
              />
              <DateInput
                label={t('teachersPage.diplomDate')}
                value={form.diplom_given_date}
                onChange={(e) => setField('diplom_given_date', e.target.value)}
              />
              <Input
                label={t('teachersPage.license')}
                value={form.license_seria}
                onChange={(e) => setField('license_seria', e.target.value)}
              />
              <Input
                label={t('teachersPage.licenseNumber')}
                value={form.license_number}
                onChange={(e) => setField('license_number', e.target.value)}
              />
              <DateInput
                label={t('teachersPage.licenseDate')}
                value={form.license_date}
                onChange={(e) => setField('license_date', e.target.value)}
              />
            </div>

            <div className="mt-3">
              <p className="mb-1 text-[12px] font-semibold text-ink/65">
                {t('teachersPage.eduLangs')}
              </p>
              <div className="flex flex-wrap gap-1">
                {LANGS.map((item) => (
                  <Button
                    key={item.id}
                    variant="soft"
                    size="sm"
                    active={langs.includes(item.id)}
                    onClick={() => setLangs(toggle(langs, item.id))}
                  >
                    {t(item.labelKey)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <p className="mb-1 text-[12px] font-semibold text-ink/65">
                {t('teachersPage.teacherType')}
              </p>
              <div className="flex flex-wrap gap-1">
                {typeOptions.map((item) => {
                  const id = String(item.id)
                  return (
                    <Button
                      key={id}
                      variant="soft"
                      size="sm"
                      active={types.includes(id)}
                      onClick={() => setTypes(toggle(types, id))}
                    >
                      {asText(item.name)}
                    </Button>
                  )
                })}
              </div>
            </div>
            <div className="mt-3">
              <p className="mb-1 text-[12px] font-semibold text-ink/65">
                {t('teachersPage.eduTypes')}
              </p>
              <div className="flex flex-wrap gap-1">
                {eduTypeOptions.map((item) => {
                  const id = String(item.id)
                  return (
                    <Button
                      key={id}
                      variant="soft"
                      size="sm"
                      active={eduTypes.includes(id)}
                      onClick={() => setEduTypes(toggle(eduTypes, id))}
                    >
                      {asText(item.short_name ?? item.name)}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(routes.teachers)}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" size="sm" loading={saving} onClick={submit}>
                {t('common.save')}
              </Button>
            </div>
          </Panel>
        )}
      </main>
    </>
  )
}
