import { useEffect, useId, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Upload } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  DateInput,
  ErrorMessage,
  Input,
  MultiSelect,
  Panel,
  PhoneInput,
  Select,
  SkeletonLines,
  fieldLabelClassName,
  notify,
} from '@/components/ui'
import { fetchDistricts, fetchRegions } from '@/api'
import { EDU_TYPES, routes } from '@/config'
import { useAuth } from '@/features/auth'
import { useSmartBack } from '@/hooks'
import {
  useCreateTeacherMutation,
  useTeacherCreateOptionsQuery,
  useUpdateTeacherMutation,
} from '@/features/teachers'
import { useMspdPersonSearchMutation } from '@/features/director-profile'
import { asFio, asText } from '@/lib/apiPage'
import { displayToIsoDate, toPhoneValue } from '@/lib'
import type { NamedId, TeacherDetail } from '@/types/teachers'
import type { MspdPersonInfo } from '@/types'

const LANGS = [
  { id: '1', labelKey: 'teachersPage.langUz' },
  { id: '2', labelKey: 'teachersPage.langRu' },
  { id: '3', labelKey: 'teachersPage.langQq' },
  { id: '4', labelKey: 'teachersPage.langEn' },
  { id: '5', labelKey: 'teachersPage.langKiril' },
] as const

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
  region_id: string
  area_id: string
  status: string
  education_degree_id: string
  institution_name: string
  specialization: string
  diplom_seria: string
  diplom_number: string
  diplom_given_date: string
  license_seria: string
  license_number: string
  license_date: string
  certificate_seria: string
  certificate_number: string
  certificate_given_date: string
}

const EMPTY: FormState = {
  last_name: '',
  first_name: '',
  middle_name: '',
  birthday: '',
  gender: '1',
  phone1: '',
  address: '',
  passport_seria: '',
  passport_number: '',
  passport_jshir: '',
  passport_given_date: '',
  passport_given_place: '',
  citizenship_id: '',
  region_id: '',
  area_id: '',
  status: '1',
  education_degree_id: '',
  institution_name: '',
  specialization: '',
  diplom_seria: '',
  diplom_number: '',
  diplom_given_date: '',
  license_seria: '',
  license_number: '',
  license_date: '',
  certificate_seria: '',
  certificate_number: '',
  certificate_given_date: '',
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

function genderValue(value: unknown): string {
  const n = Number(value)
  if (n === 2 || n === 0) return '2'
  if (n === 1) return '1'
  return '1'
}

function dataToForm(data: TeacherDetail): FormState {
  return {
    last_name: data.last_name ?? '',
    first_name: data.first_name ?? '',
    middle_name: data.middle_name ?? '',
    birthday: toIso(data.birthday),
    gender: genderValue(data.gender),
    phone1: toPhoneValue(data.phone1 ?? data.phone ?? ''),
    address: data.address ?? '',
    passport_seria: (data.passport_seria ?? '').toUpperCase(),
    passport_number: data.passport_number ?? '',
    passport_jshir: data.passport_jshir ?? '',
    passport_given_date: toIso(data.passport_given_date),
    passport_given_place: data.passport_given_place ?? '',
    citizenship_id: String(data.citizenship?.id ?? data.citizenship_id ?? ''),
    region_id: String(data.region_id ?? data.region?.id ?? ''),
    area_id: String(data.area_id ?? data.area?.id ?? ''),
    status: data.status == null ? '1' : String(Number(data.status) === 0 ? 0 : 1),
    education_degree_id: String(data.education_degree?.id ?? data.education_degree_id ?? ''),
    institution_name: data.institution_name ?? '',
    specialization: data.specialization ?? '',
    diplom_seria: data.diplom_seria ?? '',
    diplom_number: data.diplom_number ?? '',
    diplom_given_date: toIso(data.diplom_given_date),
    license_seria: data.license_seria ?? '',
    license_number: data.license_number ?? '',
    license_date: toIso(data.license_date),
    certificate_seria: data.certificate_seria ?? '',
    certificate_number: data.certificate_number ?? '',
    certificate_given_date: toIso(data.certificate_given_date),
  }
}

function appendList(fd: FormData, key: string, ids: string[]) {
  ids.forEach((id, index) => fd.append(`${key}[${index}]`, id))
}

function namedLabel(item: NamedId) {
  return asText(item.name_uz || item.name || item.short_name || item.label)
}

function PdfUpload({
  label,
  required,
  file,
  onPick,
}: {
  label: string
  required?: boolean
  file: File | null
  onPick: (file: File | null) => void
}) {
  const id = useId()
  const { t } = useTranslation()
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className={fieldLabelClassName}>
        {required ? (
          <span className="text-rose" aria-hidden>
            *{' '}
          </span>
        ) : null}
        {label}
      </label>
      <div className="flex h-9 min-w-0 items-center gap-2">
        <Button variant="soft" size="sm" onClick={() => document.getElementById(id)?.click()}>
          <Upload className="size-3.5" aria-hidden />
          {t('teachersPage.upload')}
        </Button>
        <span className="min-w-0 truncate text-[12px] text-muted" title={file?.name}>
          {file?.name ?? ''}
        </span>
        <input
          id={id}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={(event) => onPick(event.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  )
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
  const goBack = useSmartBack(routes.teachers)
  const { data: options, isLoading: optionsLoading, isError: optionsError } =
    useTeacherCreateOptionsQuery()
  const createMutation = useCreateTeacherMutation()
  const updateMutation = useUpdateTeacherMutation(teacherId ?? '')
  const mspd = useMspdPersonSearchMutation()
  const { isAuthenticated } = useAuth()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [langs, setLangs] = useState<string[]>(['1'])
  const [types, setTypes] = useState<string[]>(['1'])
  const [eduTypes, setEduTypes] = useState<string[]>([])
  const [licenseCategories, setLicenseCategories] = useState<string[]>([])
  const [diplomCopy, setDiplomCopy] = useState<File | null>(null)
  const [licenseCopy, setLicenseCopy] = useState<File | null>(null)
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [searchSeria, setSearchSeria] = useState('')
  const [searchNumber, setSearchNumber] = useState('')
  const [searchBirthday, setSearchBirthday] = useState('')

  const regions = useQuery({
    queryKey: ['teachers', 'regions'],
    queryFn: fetchRegions,
    enabled: isAuthenticated,
  })
  const districts = useQuery({
    queryKey: ['teachers', 'districts', form.region_id],
    queryFn: () => fetchDistricts(form.region_id),
    enabled: isAuthenticated && Boolean(form.region_id),
  })

  useEffect(() => {
    if (!initial) return
    setForm(dataToForm(initial))
    setLangs(idsOf(initial.edu_langs).length ? idsOf(initial.edu_langs) : ['1'])
    setTypes(idsOf(initial.type_id).length ? idsOf(initial.type_id) : ['1'])
    setEduTypes(idsOf(initial.edu_types))
    setLicenseCategories(idsOf(initial.license_category_id))
    setSearchSeria((initial.passport_seria ?? '').toUpperCase())
    setSearchNumber(initial.passport_number ?? '')
    setSearchBirthday(toIso(initial.birthday))
  }, [initial])

  useEffect(() => {
    if (mode !== 'create' || !options) return
    setForm((prev) => ({
      ...prev,
      citizenship_id: prev.citizenship_id || String(options.citizenships?.[0]?.id ?? ''),
      education_degree_id:
        prev.education_degree_id || String(options.education_degrees?.[0]?.id ?? ''),
    }))
  }, [mode, options])

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const needsLicense = types.includes('1') || types.includes('2')
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
    const found = res.data as (MspdPersonInfo & { citizenship_id?: number | string | null }) | undefined
    if (!found) return
    setForm((prev) => ({
      ...prev,
      last_name: found.last_name ?? prev.last_name,
      first_name: found.first_name ?? prev.first_name,
      middle_name: found.middle_name ?? prev.middle_name,
      birthday: toIso(found.birthday) || prev.birthday,
      passport_jshir: found.passport_jshir ?? prev.passport_jshir,
      passport_seria: (found.passport_seria ?? searchSeria).toUpperCase(),
      passport_number: found.passport_number ?? searchNumber,
      gender: found.gender == null ? prev.gender : genderValue(found.gender),
      passport_given_place: found.passport_given_place ?? prev.passport_given_place,
      passport_given_date: toIso(found.passport_given_date) || prev.passport_given_date,
      citizenship_id:
        found.citizenship_id != null ? String(found.citizenship_id) : prev.citizenship_id,
    }))
  }

  const submit = () => {
    const missing =
      !form.last_name ||
      !form.first_name ||
      !form.birthday ||
      !form.gender ||
      !form.citizenship_id ||
      !form.phone1 ||
      !form.region_id ||
      !form.area_id ||
      !form.address ||
      !form.passport_seria ||
      !form.passport_number ||
      !form.passport_jshir ||
      !form.passport_given_date ||
      !form.passport_given_place ||
      !form.education_degree_id ||
      !form.institution_name ||
      !form.specialization ||
      !form.diplom_seria ||
      !form.diplom_number ||
      !form.diplom_given_date ||
      !langs.length ||
      !types.length ||
      !eduTypes.length ||
      (mode === 'create' && !diplomCopy) ||
      (needsLicense &&
        (!licenseCategories.length ||
          !form.license_seria ||
          !form.license_number ||
          !form.license_date ||
          (mode === 'create' && !licenseCopy)))
    if (missing) {
      notify.error(t('teachersPage.fillRequired'))
      return
    }

    const fd = new FormData()
    for (const [key, value] of Object.entries(form)) {
      fd.append(key, value ?? '')
    }
    appendList(fd, 'edu_langs', langs)
    appendList(fd, 'type_id', types)
    appendList(fd, 'edu_types', eduTypes)
    appendList(fd, 'license_category_id', licenseCategories)
    if (diplomCopy) fd.append('diplom_copy', diplomCopy)
    if (licenseCopy) fd.append('license_copy', licenseCopy)
    if (certificateFile) fd.append('certificate', certificateFile)

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

  const title = mode === 'create' ? t('teachersPage.create') : t('teachersPage.edit')
  const typeOptions = options?.teacher_types ?? []
  const eduTypeOptions: NamedId[] = options?.edu_types?.length
    ? options.edu_types
    : EDU_TYPES.map((item) => ({ id: Number(item.id), short_name: item.shortName }))
  const regionOptions = (regions.data ?? []).map((item) => ({
    value: String(item.id),
    label: asText(item.name),
  }))
  const districtOptions = (districts.data ?? []).map((item) => ({
    value: String(item.id),
    label: asText(item.name),
  }))

  return (
    <>
      <Header
        title={title}
        description={initial ? asFio(initial) : undefined}
        onBack={goBack}
        actions={
          <div className="flex flex-wrap items-end gap-2">
            <div className="w-16">
              <Input
                size="sm"
                label={t('teachersPage.seria')}
                value={searchSeria}
                maxLength={2}
                placeholder="AA"
                onChange={(e) =>
                  setSearchSeria(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))
                }
              />
            </div>
            <div className="w-28">
              <Input
                size="sm"
                label={t('teachersPage.number')}
                value={searchNumber}
                maxLength={7}
                placeholder="1234567"
                onChange={(e) => setSearchNumber(e.target.value.replace(/\D/g, '').slice(0, 7))}
              />
            </div>
            <DateInput
              className="w-40"
              size="sm"
              label={t('teachersPage.birthday')}
              value={searchBirthday}
              onChange={(e) => setSearchBirthday(e.target.value)}
            />
            <Button
              variant="primary"
              size="sm"
              loading={mspd.isPending}
              onClick={() => void onSearch()}
            >
              <Search className="size-3.5" aria-hidden />
              {t('teachersPage.find')}
            </Button>
          </div>
        }
      />
      <PageMain>
        {optionsError ? <ErrorMessage /> : null}
        {optionsLoading && !options ? (
          <Panel padding="md">
            <SkeletonLines lines={10} />
          </Panel>
        ) : (
          <div className="space-y-3">
            <Panel padding="md">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold tracking-wide text-deep uppercase">
                  {t('teachersPage.sectionPersonal')}
                </h3>
                <Button variant="primary" size="sm" loading={saving} onClick={submit}>
                  {t('common.save')}
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                  label={t('teachersPage.birthday')}
                  value={form.birthday}
                  onChange={(e) => setField('birthday', e.target.value)}
                />
                <Select
                  required
                  label={t('directorProfile.gender')}
                  value={form.gender}
                  onChange={(e) => setField('gender', e.target.value)}
                  options={[
                    { value: '1', label: t('directorProfile.male') },
                    { value: '2', label: t('directorProfile.female') },
                  ]}
                />
                <Select
                  required
                  label={t('teachersPage.citizenship')}
                  value={form.citizenship_id}
                  onChange={(e) => setField('citizenship_id', e.target.value)}
                  options={(options?.citizenships ?? []).map((item) => ({
                    value: String(item.id),
                    label: asText(item.name),
                  }))}
                />
                <PhoneInput
                  required
                  label={t('teachersPage.phone')}
                  value={form.phone1}
                  onChange={(e) => setField('phone1', e.target.value)}
                />
                <Select
                  required
                  label={t('teachersPage.regionSelect')}
                  value={form.region_id}
                  loading={regions.isFetching && regionOptions.length === 0}
                  options={regionOptions}
                  onChange={(e) => {
                    setField('region_id', e.target.value)
                    setField('area_id', '')
                  }}
                />
                <Select
                  required
                  label={t('teachersPage.districtSelect')}
                  value={form.area_id}
                  disabled={!form.region_id}
                  loading={districts.isFetching && districtOptions.length === 0}
                  options={districtOptions}
                  onChange={(e) => setField('area_id', e.target.value)}
                />
                <Input
                  required
                  label={t('teachersPage.address')}
                  value={form.address}
                  onChange={(e) => setField('address', e.target.value)}
                />
                <Input
                  required
                  label={t('teachersPage.passportSeria')}
                  value={form.passport_seria}
                  maxLength={2}
                  placeholder="AA"
                  onChange={(e) =>
                    setField('passport_seria', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))
                  }
                />
                <Input
                  required
                  label={t('teachersPage.passportNumber')}
                  value={form.passport_number}
                  maxLength={7}
                  placeholder="1234567"
                  onChange={(e) =>
                    setField('passport_number', e.target.value.replace(/\D/g, '').slice(0, 7))
                  }
                />
                <Input
                  required
                  label={t('teachersPage.formJshir')}
                  value={form.passport_jshir}
                  onChange={(e) =>
                    setField('passport_jshir', e.target.value.replace(/\D/g, '').slice(0, 14))
                  }
                />
                <DateInput
                  required
                  label={t('teachersPage.passportGivenDate')}
                  value={form.passport_given_date}
                  onChange={(e) => setField('passport_given_date', e.target.value)}
                />
                <Input
                  required
                  label={t('teachersPage.passportGivenPlace')}
                  value={form.passport_given_place}
                  onChange={(e) => setField('passport_given_place', e.target.value)}
                />
              </div>
            </Panel>

            <Panel padding="md">
              <h3 className="mb-4 text-sm font-semibold tracking-wide text-deep uppercase">
                {t('teachersPage.sectionEducation')}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Select
                  required
                  label={t('teachersPage.educationDegree')}
                  value={form.education_degree_id}
                  onChange={(e) => setField('education_degree_id', e.target.value)}
                  options={(options?.education_degrees ?? []).map((item) => ({
                    value: String(item.id),
                    label: asText(item.name),
                  }))}
                />
                <Input
                  required
                  label={t('teachersPage.institution')}
                  value={form.institution_name}
                  onChange={(e) => setField('institution_name', e.target.value)}
                />
                <Input
                  required
                  label={t('teachersPage.specialization')}
                  value={form.specialization}
                  onChange={(e) => setField('specialization', e.target.value)}
                />
                <Input
                  required
                  label={t('teachersPage.diplom')}
                  value={form.diplom_seria}
                  maxLength={2}
                  placeholder="AA"
                  onChange={(e) =>
                    setField('diplom_seria', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))
                  }
                />
                <Input
                  required
                  label={t('teachersPage.diplomNumber')}
                  value={form.diplom_number}
                  maxLength={7}
                  placeholder="1234567"
                  onChange={(e) =>
                    setField('diplom_number', e.target.value.replace(/\D/g, '').slice(0, 7))
                  }
                />
                <DateInput
                  required
                  label={t('teachersPage.diplomDate')}
                  value={form.diplom_given_date}
                  onChange={(e) => setField('diplom_given_date', e.target.value)}
                />
                <MultiSelect
                  required={needsLicense}
                  label={t('teachersPage.licenseType')}
                  value={licenseCategories}
                  onChange={setLicenseCategories}
                  options={(options?.license_category ?? []).map((item) => ({
                    value: String(item.id),
                    label: namedLabel(item),
                  }))}
                />
                <Input
                  required={needsLicense}
                  label={t('teachersPage.license')}
                  value={form.license_seria}
                  maxLength={2}
                  placeholder="AA"
                  onChange={(e) =>
                    setField('license_seria', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))
                  }
                />
                <Input
                  required={needsLicense}
                  label={t('teachersPage.licenseNumber')}
                  value={form.license_number}
                  maxLength={7}
                  placeholder="1234567"
                  onChange={(e) =>
                    setField('license_number', e.target.value.replace(/\D/g, '').slice(0, 7))
                  }
                />
                <DateInput
                  required={needsLicense}
                  label={t('teachersPage.licenseDate')}
                  value={form.license_date}
                  onChange={(e) => setField('license_date', e.target.value)}
                />
                <Input
                  label={t('teachersPage.certificateSeria')}
                  value={form.certificate_seria}
                  onChange={(e) => setField('certificate_seria', e.target.value)}
                />
                <Input
                  label={t('teachersPage.certificateNumber')}
                  value={form.certificate_number}
                  onChange={(e) => setField('certificate_number', e.target.value)}
                />
                <DateInput
                  label={t('teachersPage.certificateDate')}
                  value={form.certificate_given_date}
                  onChange={(e) => setField('certificate_given_date', e.target.value)}
                />
                <MultiSelect
                  required
                  label={t('teachersPage.eduLangs')}
                  value={langs}
                  onChange={setLangs}
                  options={LANGS.map((item) => ({
                    value: item.id,
                    label: t(item.labelKey),
                  }))}
                />
                <MultiSelect
                  required
                  label={t('teachersPage.teacherType')}
                  value={types}
                  onChange={setTypes}
                  options={typeOptions.map((item) => ({
                    value: String(item.id),
                    label: namedLabel(item),
                  }))}
                />
                <MultiSelect
                  required
                  label={t('teachersPage.eduTypes')}
                  value={eduTypes}
                  onChange={setEduTypes}
                  options={eduTypeOptions.map((item) => ({
                    value: String(item.id),
                    label: namedLabel(item),
                  }))}
                />
                <Select
                  required
                  label={t('teachersPage.teacherStatus')}
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value)}
                  options={[
                    { value: '1', label: t('teachersPage.working') },
                    { value: '0', label: t('teachersPage.leftJob') },
                  ]}
                />
                <PdfUpload
                  required={mode === 'create'}
                  label={t('teachersPage.diplomFile')}
                  file={diplomCopy}
                  onPick={setDiplomCopy}
                />
                <PdfUpload
                  required={mode === 'create' && needsLicense}
                  label={t('teachersPage.licenseFile')}
                  file={licenseCopy}
                  onPick={setLicenseCopy}
                />
                <PdfUpload
                  label={t('teachersPage.certificateFile')}
                  file={certificateFile}
                  onPick={setCertificateFile}
                />
              </div>
            </Panel>
          </div>
        )}
      </PageMain>
    </>
  )
}
