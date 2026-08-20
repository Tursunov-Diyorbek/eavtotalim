import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Save, Search, Upload, Wallet } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Button,
  DateInput,
  ErrorMessage,
  Input,
  Panel,
  PhoneInput,
  SafeImage,
  Select,
  SkeletonLines,
  Tabs,
  fieldLabelClassName,
  notify,
} from '@/components/ui'
import { EDU_TYPES, PATH_PREFIX_FILE, routes, studentPath } from '@/config'
import { useSmartBack } from '@/hooks'
import { useAuth } from '@/features/auth'
import {
  useStudentCreateOptionsQuery,
  useStudentDistrictsQuery,
  useUpdateStudentMutation,
} from '@/features/students'
import { useMspdPersonSearchMutation } from '@/features/director-profile'
import { resolveFileUrl } from '@/features/lessons'
import { asFio, asText } from '@/lib/apiPage'
import { displayToIsoDate, formatNumber, toPhoneValue } from '@/lib'
import type { StudentDetail, StudentEduType } from '@/types/student'

type FormState = {
  last_name: string
  first_name: string
  middle_name: string
  birthday: string
  gender: string
  phone1: string
  constant_address: string
  constant_region_id: string
  constant_area_id: string
  passport_seria: string
  passport_number: string
  passport_jshir: string
  passport_given_date: string
  passport_given_place: string
  citizenship_id: string
  social_status_id: string
  is_low_security: string
  edu_type_id: string
  edu_lang_id: string
  medical_sertificate: string
}

function toIso(value: unknown): string {
  if (value == null || value === '') return ''
  return displayToIsoDate(String(value)) || String(value).slice(0, 10)
}

function eduLangId(value: StudentDetail['edu_lang'] | StudentDetail['edu_lang_id']): string {
  if (value && typeof value === 'object' && 'id' in value) {
    return String(value.id ?? '1')
  }
  if (value == null || value === '') return '1'
  return String(value)
}

function dataToForm(data: StudentDetail): FormState {
  const genderNum = Number(data.gender)
  return {
    last_name: data.last_name ?? '',
    first_name: data.first_name ?? '',
    middle_name: data.middle_name ?? '',
    birthday: toIso(data.birthday),
    gender: genderNum === 0 || genderNum === 2 ? '2' : '1',
    phone1: toPhoneValue(data.phone1 ?? data.phone ?? ''),
    constant_address: data.constant_address ?? data.address ?? '',
    constant_region_id: String(data.constant_region?.id ?? data.constant_region_id ?? ''),
    constant_area_id: String(data.constant_area?.id ?? data.constant_area_id ?? ''),
    passport_seria: (data.passport_seria ?? data.passport?.serial ?? '').toUpperCase(),
    passport_number: data.passport_number ?? data.passport?.number ?? '',
    passport_jshir: data.passport_jshir ?? '',
    passport_given_date: toIso(data.passport_given_date),
    passport_given_place: data.passport_given_place ?? '',
    citizenship_id: String(data.citizenship?.id ?? data.citizenship_id ?? '1'),
    social_status_id: String(Number(data.social_status_id) || 1),
    is_low_security: String(Number(data.is_low_security) || 2),
    edu_type_id: String(data.edu_type?.id ?? data.edu_type_id ?? ''),
    edu_lang_id: eduLangId(data.edu_lang_id ?? data.edu_lang),
    medical_sertificate: data.medical_sertificate ?? '',
  }
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 text-[13px] font-semibold tracking-wide text-muted uppercase">
      {children}
    </h2>
  )
}

function SegmentField({
  label,
  required,
  value,
  onChange,
  items,
}: {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  items: { value: string; label: string }[]
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className={fieldLabelClassName}>
        {required ? (
          <span className="text-rose" aria-hidden>
            *{' '}
          </span>
        ) : null}
        {label}
      </span>
      <Tabs size="sm" fullWidth value={value} onChange={onChange} items={items} />
    </div>
  )
}

const COL4 = 'grid gap-x-3 gap-y-3 sm:grid-cols-2 xl:grid-cols-4'
const COL5 = 'grid gap-x-3 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'

export function StudentForm({
  studentId,
  initial,
}: {
  studentId: string
  initial: StudentDetail
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.students)
  const { hasRole } = useAuth()
  const canPay = !hasRole('moderator')
  const { data: options, isLoading: optionsLoading, isError: optionsError } =
    useStudentCreateOptionsQuery()
  const updateMutation = useUpdateStudentMutation(studentId)
  const mspd = useMspdPersonSearchMutation()
  const photoRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>(() => dataToForm(initial))
  const [searchSeria, setSearchSeria] = useState(
    (initial.passport_seria ?? initial.passport?.serial ?? '').toUpperCase(),
  )
  const [searchNumber, setSearchNumber] = useState(
    initial.passport_number ?? initial.passport?.number ?? '',
  )
  const [searchBirthday, setSearchBirthday] = useState(toIso(initial.birthday))
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [isPay, setIsPay] = useState(false)
  const [payTypeId, setPayTypeId] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const districtsQuery = useStudentDistrictsQuery(form.constant_region_id)

  useEffect(() => {
    setForm(dataToForm(initial))
    setSearchSeria((initial.passport_seria ?? initial.passport?.serial ?? '').toUpperCase())
    setSearchNumber(initial.passport_number ?? initial.passport?.number ?? '')
    setSearchBirthday(toIso(initial.birthday))
  }, [initial])

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => {
      if (key === 'constant_region_id' && value !== prev.constant_region_id) {
        return { ...prev, constant_region_id: value, constant_area_id: '' }
      }
      return { ...prev, [key]: value }
    })
  }

  const onSearch = async () => {
    if (!searchSeria || !searchNumber || !searchBirthday) {
      notify.error(t('students.fillRequired'))
      return
    }
    const res = await mspd.mutateAsync({
      passport_seria: searchSeria,
      passport_number: searchNumber,
      birthday: searchBirthday,
    })
    const found = res.data
    if (!found) return
    const g = Number(found.gender)
    setForm((prev) => ({
      ...prev,
      last_name: found.last_name ?? prev.last_name,
      first_name: found.first_name ?? prev.first_name,
      middle_name: found.middle_name ?? prev.middle_name,
      birthday: toIso(found.birthday) || prev.birthday,
      passport_jshir: found.passport_jshir ?? prev.passport_jshir,
      passport_seria: (found.passport_seria ?? prev.passport_seria).toUpperCase(),
      passport_number: found.passport_number ?? prev.passport_number,
      gender: g === 0 || g === 2 ? '2' : '1',
      passport_given_place: found.passport_given_place ?? prev.passport_given_place,
      passport_given_date: toIso(found.passport_given_date) || prev.passport_given_date,
    }))
  }

  const submit = () => {
    if (
      !form.last_name ||
      !form.first_name ||
      !form.birthday ||
      !form.phone1 ||
      !form.edu_type_id ||
      !form.passport_seria ||
      !form.passport_number ||
      !form.passport_jshir ||
      !form.constant_region_id ||
      !form.constant_area_id ||
      !form.constant_address
    ) {
      notify.error(t('students.fillRequired'))
      return
    }
    const fd = new FormData()
    fd.append('student_id', studentId)
    fd.append('last_name', form.last_name)
    fd.append('first_name', form.first_name)
    fd.append('middle_name', form.middle_name)
    fd.append('birthday', form.birthday)
    fd.append('gender', form.gender)
    fd.append('phone1', form.phone1)
    fd.append('citizenship_id', form.citizenship_id)
    fd.append('social_status_id', form.social_status_id)
    fd.append('is_low_security', form.is_low_security)
    fd.append('edu_type_id', form.edu_type_id)
    fd.append('edu_lang_id', form.edu_lang_id)
    fd.append('medical_sertificate', form.medical_sertificate)
    fd.append('constant_address', form.constant_address)
    fd.append('constant_region_id', form.constant_region_id)
    fd.append('constant_area_id', form.constant_area_id)
    fd.append('passport_seria', form.passport_seria)
    fd.append('passport_number', form.passport_number)
    fd.append('passport_jshir', form.passport_jshir)
    fd.append('passport_given_place', form.passport_given_place)
    fd.append('passport_given_date', form.passport_given_date)
    if (photoFile) fd.append('image', photoFile)
    if (documentFile) fd.append('document_copy', documentFile)
    if (isPay && payTypeId && paymentAmount) {
      fd.append('pay_type_id', payTypeId)
      fd.append('amount', paymentAmount)
    }

    updateMutation.mutate(fd, {
      onSuccess: () => {
        notify.success(t('common.saved'))
        navigate(studentPath(studentId))
      },
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  const eduTypeOptions: StudentEduType[] = options?.edu_types?.length
    ? options.edu_types
    : EDU_TYPES.map((item) => ({ id: item.id, short_name: item.shortName }))
  const selectedEdu = eduTypeOptions.find((item) => String(item.id) === form.edu_type_id)
  const firstPayPercent = selectedEdu?.edu_type_price?.first_pay ?? 30
  const firstPayAmount =
    ((selectedEdu?.edu_type_price?.price ?? 0) * firstPayPercent) / 100
  const photoUrl = photoFile
    ? URL.createObjectURL(photoFile)
    : resolveFileUrl(initial.image, PATH_PREFIX_FILE)
  const documentUrl = documentFile
    ? documentFile.name
    : initial.document_copy
      ? resolveFileUrl(initial.document_copy, PATH_PREFIX_FILE)
      : ''

  return (
    <>
      <Header
        title={t('students.edit')}
        description={asFio(initial)}
        actions={
          <span className="text-xs text-muted">{t('students.editPage.requiredMark')}</span>
        }
      />
      <main className="flex-1 p-3 sm:p-4">
        {optionsError ? <ErrorMessage /> : null}
        {optionsLoading && !options ? (
          <Panel padding="md">
            <SkeletonLines lines={12} />
          </Panel>
        ) : (
          <Panel>
            <div className="grid gap-3 border-b border-mist/70 px-3 py-4 sm:px-4 lg:grid-cols-[minmax(14rem,22%)_minmax(0,1fr)] lg:items-end">
              <p className="text-[13px] font-semibold tracking-wide text-muted uppercase">
                {t('students.editPage.autofill')}
              </p>
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1.15fr)_auto]">
                <Input
                  label={t('directorProfile.passportSeria')}
                  value={searchSeria}
                  maxLength={2}
                  onChange={(e) =>
                    setSearchSeria(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))
                  }
                />
                <Input
                  label={t('directorProfile.passportNumber')}
                  value={searchNumber}
                  maxLength={7}
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
                  variant="primary"
                  size="md"
                  className="w-full shrink-0 self-end xl:w-auto"
                  loading={mspd.isPending}
                  onClick={() => void onSearch()}
                >
                  <Search className="size-4" aria-hidden />
                  {t('directorProfile.search')}
                </Button>
              </div>
            </div>

            <div className="border-b border-mist/70 px-3 py-4 sm:px-4">
              <SectionTitle>{t('students.editPage.personal')}</SectionTitle>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                <div className="w-36 shrink-0">
                  <p className={fieldLabelClassName}>{t('students.editPage.photo')}</p>
                  <div className="mt-1.5 overflow-hidden rounded-xl border border-mist/90 bg-fog">
                    <SafeImage
                      src={photoUrl}
                      size="lg"
                      label={t('common.noImage')}
                      className="aspect-3/4 w-full"
                    />
                    <input
                      ref={photoRef}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="sr-only"
                      onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                    />
                    <Button
                      variant="soft"
                      size="sm"
                      className="w-full rounded-none"
                      onClick={() => photoRef.current?.click()}
                    >
                      <Upload className="size-3.5" aria-hidden />
                      {t('students.editPage.uploadPhoto')}
                    </Button>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className={COL4}>
                    <Input
                      required
                      label={t('students.lastName')}
                      value={form.last_name}
                      onChange={(e) => setField('last_name', e.target.value)}
                    />
                    <Input
                      required
                      label={t('students.firstName')}
                      value={form.first_name}
                      onChange={(e) => setField('first_name', e.target.value)}
                    />
                    <Input
                      label={t('students.middleName')}
                      value={form.middle_name}
                      onChange={(e) => setField('middle_name', e.target.value)}
                    />
                    <DateInput
                      required
                      label={t('directorProfile.birthday')}
                      value={form.birthday}
                      onChange={(e) => setField('birthday', e.target.value)}
                    />
                  </div>
                  <div className={COL4}>
                    <SegmentField
                      required
                      label={t('directorProfile.gender')}
                      value={form.gender}
                      onChange={(value) => setField('gender', value)}
                      items={[
                        { value: '1', label: t('directorProfile.male') },
                        { value: '2', label: t('directorProfile.female') },
                      ]}
                    />
                    <PhoneInput
                      required
                      label={t('directorProfile.phone')}
                      value={form.phone1}
                      onChange={(e) => setField('phone1', e.target.value)}
                    />
                    <Select
                      label={t('students.socialStatus')}
                      value={form.social_status_id}
                      onChange={(e) => setField('social_status_id', e.target.value)}
                      options={(options?.social_statuses ?? []).map((item) => ({
                        value: String(item.id),
                        label: asText(item.name),
                      }))}
                    />
                    <SegmentField
                      required
                      label={t('students.poor')}
                      value={form.is_low_security}
                      onChange={(value) => setField('is_low_security', value)}
                      items={[
                        { value: '1', label: t('dashboard.yes') },
                        { value: '2', label: t('dashboard.no') },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-mist/70 px-3 py-4 sm:px-4">
              <SectionTitle>{t('students.editPage.passport')}</SectionTitle>
              <div className={COL5}>
                <Select
                  required
                  label={t('students.editPage.citizenship')}
                  value={form.citizenship_id}
                  onChange={(e) => setField('citizenship_id', e.target.value)}
                  options={(options?.citizenships ?? []).map((item) => ({
                    value: String(item.id),
                    label: asText(item.name),
                  }))}
                />
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className={fieldLabelClassName}>
                    <span className="text-rose" aria-hidden>
                      *{' '}
                    </span>
                    {t('students.editPage.passportFile')}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="sr-only"
                      onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
                    />
                    <Button
                      variant="outline"
                      size="md"
                      className="min-w-0 flex-1"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="size-3.5" aria-hidden />
                      <span className="truncate">
                        {documentFile?.name || t('students.editPage.uploadFile')}
                      </span>
                    </Button>
                    {documentUrl && !documentFile ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(String(documentUrl), '_blank', 'noopener')
                        }
                      >
                        {t('directorProfile.viewFile')}
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2">
                  <Input
                    required
                    label={t('students.editPage.series')}
                    value={form.passport_seria}
                    maxLength={2}
                    onChange={(e) =>
                      setField(
                        'passport_seria',
                        e.target.value.toUpperCase().replace(/[^A-Z]/g, ''),
                      )
                    }
                  />
                  <Input
                    required
                    label={t('students.editPage.number')}
                    value={form.passport_number}
                    maxLength={7}
                    onChange={(e) =>
                      setField(
                        'passport_number',
                        e.target.value.replace(/\D/g, '').slice(0, 7),
                      )
                    }
                  />
                </div>
                <DateInput
                  required
                  label={t('students.givenDate')}
                  value={form.passport_given_date}
                  onChange={(e) => setField('passport_given_date', e.target.value)}
                />
                <Input
                  required
                  label={t('students.editPage.pin')}
                  value={form.passport_jshir}
                  onChange={(e) =>
                    setField('passport_jshir', e.target.value.replace(/\D/g, '').slice(0, 14))
                  }
                />
                <Input
                  label={t('students.givenPlace')}
                  value={form.passport_given_place}
                  onChange={(e) => setField('passport_given_place', e.target.value)}
                />
                <Select
                  required
                  label={t('students.editPage.region')}
                  value={form.constant_region_id}
                  placeholder={t('students.editPage.selectRegion')}
                  onChange={(e) => setField('constant_region_id', e.target.value)}
                  options={(options?.regions ?? []).map((item) => ({
                    value: String(item.id),
                    label: asText(item.name),
                  }))}
                />
                <Select
                  required
                  label={t('students.editPage.district')}
                  value={form.constant_area_id}
                  placeholder={t('students.editPage.selectDistrict')}
                  disabled={!form.constant_region_id}
                  onChange={(e) => setField('constant_area_id', e.target.value)}
                  options={(districtsQuery.data ?? []).map((item) => ({
                    value: String(item.id),
                    label: asText(item.name),
                  }))}
                />
                <div className="xl:col-span-2">
                  <Input
                    required
                    label={t('students.editPage.address')}
                    value={form.constant_address}
                    onChange={(e) => setField('constant_address', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-mist/70 px-3 py-4 sm:px-4">
              <SectionTitle>{t('students.editPage.education')}</SectionTitle>
              <div className="grid gap-x-3 gap-y-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.4fr)]">
                <SegmentField
                  required
                  label={t('students.eduLang')}
                  value={form.edu_lang_id}
                  onChange={(value) => setField('edu_lang_id', value)}
                  items={[
                    { value: '1', label: t('groupsPage.langUz') },
                    { value: '2', label: t('groupsPage.langRu') },
                  ]}
                />
                <Select
                  required
                  label={t('students.eduType')}
                  value={form.edu_type_id}
                  onChange={(e) => setField('edu_type_id', e.target.value)}
                  options={eduTypeOptions.map((item) => ({
                    value: String(item.id),
                    label:
                      item.short_name ||
                      asText(item.name_uz ?? item.name),
                  }))}
                />
                <Input
                  label={t('students.medical')}
                  value={form.medical_sertificate}
                  onChange={(e) => setField('medical_sertificate', e.target.value)}
                />
                {canPay ? (
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className={fieldLabelClassName}>
                      {t('students.editPage.firstPay')}
                    </span>
                    <div className="flex min-h-11 items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-sm font-semibold text-amber">
                        {firstPayPercent}% — {formatNumber(firstPayAmount)}{' '}
                        {t('students.editPage.sum')}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        disabled={isPay}
                        onClick={() => {
                          setIsPay(true)
                          if (!paymentAmount) {
                            setPaymentAmount(String(Math.round(firstPayAmount) || ''))
                          }
                        }}
                      >
                        <Wallet className="size-3.5" aria-hidden />
                        {t('students.editPage.pay')}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
              {canPay && isPay ? (
                <div className="mt-3 grid gap-x-3 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
                  <Select
                    label={t('students.editPage.payType')}
                    value={payTypeId}
                    onChange={(e) => setPayTypeId(e.target.value)}
                    options={(options?.pay_type ?? []).map((item) => ({
                      value: String(item.id),
                      label: asText(item.name),
                    }))}
                  />
                  <Input
                    label={t('students.editPage.payAmount')}
                    type="number"
                    value={paymentAmount}
                    placeholder={`${formatNumber(firstPayAmount)} ${t('students.editPage.sum')}`}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className={`${fieldLabelClassName} text-rose`}>
                      {t('students.editPage.cancelPay')}
                    </span>
                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => {
                        setIsPay(false)
                        setPayTypeId('')
                        setPaymentAmount('')
                      }}
                    >
                      <Wallet className="size-4" aria-hidden />
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 px-3 py-3 sm:px-4">
              <Button
                variant="outline"
                size="md"
                onClick={goBack}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={updateMutation.isPending}
                onClick={submit}
              >
                <Save className="size-4" aria-hidden />
                {t('common.save')}
              </Button>
            </div>
          </Panel>
        )}
      </main>
    </>
  )
}
