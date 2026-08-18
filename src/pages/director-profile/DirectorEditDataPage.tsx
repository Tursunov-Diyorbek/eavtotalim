import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Button,
  DateInput,
  ErrorMessage,
  Input,
  Modal,
  Notification,
  Panel,
  PhoneInput,
  SkeletonLines,
  Tabs,
  notify,
} from '@/components/ui'
import {
  isDirectorProfileUnconfirmed,
  isDirectorRole,
  routes,
} from '@/config'
import { useAuth } from '@/features/auth'
import {
  useDirectorEditDataQuery,
  useMspdPersonSearchMutation,
  useUpdateDirectorDataMutation,
} from '@/features/director-profile'
import { displayToIsoDate, isPhoneComplete, toPhoneValue } from '@/lib'
import type { DirectorEditData, DirectorEditFormValues } from '@/types'
import { OrganizationRekvizitPanel } from './OrganizationRekvizitPanel'

const EMPTY_FORM: DirectorEditFormValues = {
  last_name: '',
  first_name: '',
  middle_name: '',
  passport_seria: '',
  passport_number: '',
  passport_jshir: '',
  passport_given_place: '',
  birthday: '',
  gender: '',
  address: '',
  phone: '',
}

function toIsoDate(value: unknown): string {
  if (value == null || value === '') return ''
  return displayToIsoDate(String(value)) || ''
}

function todayIso(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function dataToForm(data: DirectorEditData): DirectorEditFormValues {
  return {
    last_name: data.last_name ?? '',
    first_name: data.first_name ?? '',
    middle_name: data.middle_name ?? '',
    passport_seria: (data.passport_seria ?? '').toUpperCase(),
    passport_number: data.passport_number ?? '',
    passport_jshir: data.passport_jshir ?? '',
    passport_given_place: data.passport_given_place ?? '',
    birthday: toIsoDate(data.birthday),
    gender:
      data.gender === 0 || data.gender === '0'
        ? '0'
        : data.gender === 1 || data.gender === '1'
          ? '1'
          : '',
    address: data.address ?? '',
    phone: toPhoneValue(data.phone ?? ''),
  }
}

export function DirectorEditDataPage() {
  const { t } = useTranslation()
  const { me, user } = useAuth()
  const { data, isLoading, isError, error, refetch } = useDirectorEditDataQuery()
  const updateMutation = useUpdateDirectorDataMutation()
  const mspdMutation = useMspdPersonSearchMutation()

  const [form, setForm] = useState<DirectorEditFormValues>(EMPTY_FORM)
  const [loadedData, setLoadedData] = useState<DirectorEditData | undefined>()
  const [errors, setErrors] = useState<
    Partial<Record<keyof DirectorEditFormValues, string>>
  >({})
  const [searchSeria, setSearchSeria] = useState('')
  const [searchNumber, setSearchNumber] = useState('')
  const [searchBirthday, setSearchBirthday] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (data && data !== loadedData) {
    setLoadedData(data)
    setForm(dataToForm(data))
  }

  if (!isDirectorRole(user)) {
    return <Navigate to={routes.home} replace />
  }

  const identityLocked = Number(data?.new) !== 0
  const addressLocked = !data?.new
  const unconfirmed = isDirectorProfileUnconfirmed(me?.profession?.mspd_status)
  const saving = updateMutation.isPending
  const searching = mspdMutation.isPending
  const busy = saving || searching

  function setField<K extends keyof DirectorEditFormValues>(
    key: K,
    value: DirectorEditFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const next: Partial<Record<keyof DirectorEditFormValues, string>> = {}
    const required: Array<keyof DirectorEditFormValues> = [
      'last_name',
      'first_name',
      'middle_name',
      'passport_seria',
      'passport_number',
      'birthday',
      'gender',
      'address',
      'phone',
    ]
    for (const key of required) {
      if (!String(form[key] ?? '').trim()) {
        next[key] = t('directorProfile.required')
      }
    }
    if (form.phone && !isPhoneComplete(form.phone)) {
      next.phone = t('directorProfile.phoneInvalid')
    }
    if (form.birthday && !displayToIsoDate(form.birthday)) {
      next.birthday = t('directorProfile.required')
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setConfirmOpen(true)
  }

  function confirmSave() {
    const formData = new FormData()
    const payload: Record<string, string> = {
      last_name: form.last_name.trim(),
      first_name: form.first_name.trim(),
      middle_name: form.middle_name.trim(),
      passport_seria: form.passport_seria.trim().toUpperCase(),
      passport_number: form.passport_number.trim(),
      passport_jshir: form.passport_jshir.trim(),
      passport_given_place: form.passport_given_place.trim(),
      birthday: form.birthday,
      gender: form.gender,
      address: form.address.trim(),
      phone: form.phone.trim(),
    }
    for (const [key, value] of Object.entries(payload)) {
      formData.append(key, value)
    }
    setConfirmOpen(false)
    updateMutation.mutate(formData)
  }

  async function onSearch() {
    const seria = searchSeria.trim().toUpperCase()
    const number = searchNumber.trim()
    const birthday = searchBirthday
    if (!seria || !number || !birthday) {
      notify.warning(t('directorProfile.required'))
      return
    }
    const res = await mspdMutation.mutateAsync({
      passport_seria: seria,
      passport_number: number,
      birthday,
    })
    if (res.status !== 200 || !res.data) return
    const found = res.data
    setForm((prev) => ({
      ...prev,
      last_name: found.last_name ?? prev.last_name,
      first_name: found.first_name ?? prev.first_name,
      middle_name: found.middle_name ?? prev.middle_name,
      birthday: toIsoDate(found.birthday) || prev.birthday,
      passport_jshir: found.passport_jshir ?? prev.passport_jshir,
      passport_seria: (found.passport_seria ?? prev.passport_seria).toUpperCase(),
      passport_number: found.passport_number ?? prev.passport_number,
      gender:
        found.gender === 0 || found.gender === '0'
          ? '0'
          : found.gender === 1 || found.gender === '1'
            ? '1'
            : prev.gender,
      passport_given_place:
        found.passport_given_place ?? prev.passport_given_place,
    }))
    setErrors({})
  }

  return (
    <>
      <Header
        title={t('directorProfile.pageTitle')}
        description={t('directorProfile.description')}
      />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {unconfirmed ? (
          <Notification tone="error">{t('directorProfile.alert')}</Notification>
        ) : null}

        <Panel>
          <div className="flex flex-col gap-3 p-3 sm:p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <p className="font-display shrink-0 text-sm font-semibold text-deep">
                {t('directorProfile.title')}
              </p>
              <div className="ml-auto flex flex-wrap items-end justify-end gap-2 sm:flex-nowrap">
                <div className="w-44 shrink-0 [&_label]:whitespace-nowrap">
                  <Input
                    label={t('directorProfile.passportSeria')}
                    name="mspd_seria"
                    placeholder="AA"
                    maxLength={2}
                    autoComplete="off"
                    value={searchSeria}
                    onChange={(e) =>
                      setSearchSeria(
                        e.target.value.toUpperCase().replace(/[^A-Z]/g, ''),
                      )
                    }
                  />
                </div>
                <div className="w-44 shrink-0 [&_label]:whitespace-nowrap">
                  <Input
                    label={t('directorProfile.passportNumber')}
                    name="mspd_number"
                    placeholder="1234567"
                    maxLength={7}
                    inputMode="numeric"
                    autoComplete="off"
                    value={searchNumber}
                    onChange={(e) =>
                      setSearchNumber(
                        e.target.value.replace(/\D/g, '').slice(0, 7),
                      )
                    }
                  />
                </div>
                <div className="w-52 shrink-0 [&_label]:whitespace-nowrap">
                  <DateInput
                    label={t('directorProfile.birthday')}
                    name="mspd_birthday"
                    max={todayIso()}
                    value={searchBirthday}
                    onChange={(e) => setSearchBirthday(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="md"
                  className="shrink-0"
                  loading={searching}
                  onClick={() => void onSearch()}
                >
                  <Search className="size-4" aria-hidden />
                  {t('directorProfile.search')}
                </Button>
                <Button
                  size="md"
                  className="shrink-0"
                  loading={saving}
                  onClick={() => {
                    if (validate()) setConfirmOpen(true)
                  }}
                >
                  {t('common.save')}
                </Button>
              </div>
            </div>

            {isError ? (
              <div className="flex flex-wrap items-center gap-2">
                <ErrorMessage>
                  {error instanceof Error
                    ? error.message
                    : t('common.loadError')}
                </ErrorMessage>
                <Button variant="ghost" size="sm" onClick={() => void refetch()}>
                  {t('common.refresh')}
                </Button>
              </div>
            ) : null}

            {isLoading && !data ? (
              <SkeletonLines lines={8} />
            ) : (
              <form
                onSubmit={onSubmit}
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              >
                <Input
                  required
                  label={t('directorProfile.lastName')}
                  name="last_name"
                  value={form.last_name}
                  disabled={identityLocked}
                  error={errors.last_name}
                  onChange={(e) => setField('last_name', e.target.value)}
                />
                <Input
                  required
                  label={t('directorProfile.firstName')}
                  name="first_name"
                  value={form.first_name}
                  disabled={identityLocked}
                  error={errors.first_name}
                  onChange={(e) => setField('first_name', e.target.value)}
                />
                <Input
                  required
                  label={t('directorProfile.middleName')}
                  name="middle_name"
                  value={form.middle_name}
                  disabled={identityLocked}
                  error={errors.middle_name}
                  onChange={(e) => setField('middle_name', e.target.value)}
                />
                <Input
                  required
                  label={t('directorProfile.passportSeria')}
                  name="passport_seria"
                  placeholder="AA"
                  maxLength={2}
                  value={form.passport_seria}
                  disabled={identityLocked}
                  error={errors.passport_seria}
                  onChange={(e) =>
                    setField(
                      'passport_seria',
                      e.target.value.toUpperCase().replace(/[^A-Z]/g, ''),
                    )
                  }
                />
                <Input
                  required
                  label={t('directorProfile.passportNumber')}
                  name="passport_number"
                  placeholder="1234567"
                  maxLength={7}
                  inputMode="numeric"
                  value={form.passport_number}
                  disabled={identityLocked}
                  error={errors.passport_number}
                  onChange={(e) =>
                    setField(
                      'passport_number',
                      e.target.value.replace(/\D/g, '').slice(0, 7),
                    )
                  }
                />
                <DateInput
                  required
                  label={t('directorProfile.birthday')}
                  name="birthday"
                  max={todayIso()}
                  value={form.birthday}
                  disabled={identityLocked}
                  error={errors.birthday}
                  onChange={(e) => setField('birthday', e.target.value)}
                />
                <div className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-ink/65 sm:text-[13px]">
                    <span className="text-rose" aria-hidden>
                      *{' '}
                    </span>
                    {t('directorProfile.gender')}
                  </span>
                  <Tabs
                    aria-label={t('directorProfile.gender')}
                    value={form.gender || 'unset'}
                    onChange={(v) => {
                      if (!identityLocked) setField('gender', String(v))
                    }}
                    items={[
                      {
                        value: '1',
                        label: t('directorProfile.male'),
                        disabled: identityLocked,
                      },
                      {
                        value: '0',
                        label: t('directorProfile.female'),
                        disabled: identityLocked,
                      },
                    ]}
                  />
                  {errors.gender ? (
                    <p className="text-xs text-red-500/90">{errors.gender}</p>
                  ) : null}
                </div>
                <Input
                  required
                  label={t('directorProfile.address')}
                  name="address"
                  value={form.address}
                  disabled={addressLocked}
                  error={errors.address}
                  onChange={(e) => setField('address', e.target.value)}
                />
                <PhoneInput
                  required
                  label={t('directorProfile.phone')}
                  name="phone"
                  value={form.phone}
                  error={errors.phone}
                  hint={t('directorProfile.phoneHint')}
                  onChange={(e) => setField('phone', e.target.value)}
                />
                <button type="submit" className="hidden" disabled={busy} />
              </form>
            )}
          </div>
        </Panel>

        <OrganizationRekvizitPanel />
      </main>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('directorProfile.saveConfirmTitle')}
        sizeClassName="max-w-md"
      >
        <p className="text-sm text-deep">{t('directorProfile.saveConfirm')}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button loading={saving} onClick={confirmSave}>
            {t('common.save')}
          </Button>
        </div>
      </Modal>
    </>
  )
}
