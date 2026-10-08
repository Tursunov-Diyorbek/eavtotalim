import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  Checkbox,
  DateInput,
  ErrorMessage,
  Input,
  Panel,
  PhoneInput,
  Select,
  SkeletonLines,
  notify,
} from '@/components/ui'
import { routes } from '@/config'
import {
  useCreateAccountantMutation,
  useAccountantDistrictsQuery,
  useAccountantQuery,
  useAccountantRegionsQuery,
  useUpdateAccountantMutation,
} from '@/features/accountants'
import { useMspdPersonSearchMutation } from '@/features/director-profile'
import { useOpenedOnce, useSmartBack } from '@/hooks'
import { displayToIsoDate, fullNameOf, parsePhoneDigits, toPhoneValue } from '@/lib'
import type { AccountantPayload } from '@/api'

type FormState = {
  last_name: string
  first_name: string
  middle_name: string
  birthday: string
  gender: string
  username: string
  address: string
  passport_seria: string
  passport_number: string
  phone: string
  email: string
  region_id: string
  area_id: string
  status: boolean
}

const EMPTY: FormState = {
  last_name: '',
  first_name: '',
  middle_name: '',
  birthday: '',
  gender: '1',
  username: '',
  address: '',
  passport_seria: '',
  passport_number: '',
  phone: '',
  email: '',
  region_id: '',
  area_id: '',
  status: true,
}

function loginPhone(raw: string) {
  const digits = parsePhoneDigits(raw)
  if (digits.length < 2) return digits
  return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
}

export function AccountantForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.accountants)
  const existing = useAccountantQuery(mode === 'edit' ? id : undefined)
  const createMutation = useCreateAccountantMutation()
  const updateMutation = useUpdateAccountantMutation(id ?? '')
  const mspd = useMspdPersonSearchMutation()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [searchSeria, setSearchSeria] = useState('')
  const [searchNumber, setSearchNumber] = useState('')
  const [searchBirthday, setSearchBirthday] = useState('')
  const [regionsEnabled, openRegions] = useOpenedOnce()
  const [districtsEnabled, openDistricts] = useOpenedOnce()
  const regions = useAccountantRegionsQuery(regionsEnabled || Boolean(form.region_id))
  const districts = useAccountantDistrictsQuery(
    districtsEnabled || Boolean(form.area_id) ? form.region_id : '',
  )

  useEffect(() => {
    const data = existing.data
    if (!data) return
    setForm({
      last_name: data.last_name ?? '',
      first_name: data.first_name ?? '',
      middle_name: data.middle_name ?? '',
      birthday: displayToIsoDate(data.birthday) || String(data.birthday ?? '').slice(0, 10),
      gender: data.gender == null || data.gender === '' ? '1' : String(data.gender),
      username: '',
      address: data.address ?? '',
      passport_seria: (data.passport_seria ?? '').toUpperCase(),
      passport_number: data.passport_number ?? '',
      phone: toPhoneValue(data.phone),
      email: data.email ?? '',
      region_id: String(data.region_id ?? data.region?.id ?? ''),
      area_id: String(data.area_id ?? data.area?.id ?? ''),
      status: Number(data.status) === 1,
    })
  }, [existing.data])

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onSearch = async () => {
    if (!searchSeria || searchNumber.length < 7 || !searchBirthday) {
      notify.warning(t('accountantsPage.searchHint'))
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
      birthday: displayToIsoDate(found.birthday) || prev.birthday,
      gender: found.gender == null ? prev.gender : String(found.gender),
      passport_seria: (found.passport_seria ?? prev.passport_seria).toUpperCase(),
      passport_number: found.passport_number ?? prev.passport_number,
    }))
  }

  const onSave = () => {
    if (
      !form.last_name.trim() ||
      !form.first_name.trim() ||
      !form.birthday ||
      !form.passport_seria ||
      !form.passport_number ||
      !form.phone ||
      !form.region_id ||
      !form.area_id ||
      (mode === 'create' && !form.username)
    ) {
      notify.warning(t('accountantsPage.required'))
      return
    }
    const payload: AccountantPayload = {
      last_name: form.last_name.trim(),
      first_name: form.first_name.trim(),
      middle_name: form.middle_name.trim(),
      birthday: form.birthday,
      gender: form.gender || '1',
      address: form.address.trim(),
      passport_seria: form.passport_seria.trim().toUpperCase(),
      passport_number: form.passport_number.trim(),
      phone: parsePhoneDigits(form.phone),
      email: form.email.trim(),
      region_id: form.region_id,
      area_id: form.area_id,
      status: form.status ? '1' : '0',
      ...(mode === 'create' ? { username: loginPhone(form.username) } : {}),
    }
    const mutation = mode === 'create' ? createMutation : updateMutation
    mutation.mutate(payload, {
      onSuccess: () => {
        notify.success(t('common.saved'))
        navigate(routes.accountants)
      },
      onError: (err) => notify.error(err.message || t('common.loadError')),
    })
  }

  const saving = createMutation.isPending || updateMutation.isPending
  const regionOptions = (regions.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name ?? '',
  }))
  const districtOptions = (districts.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.name ?? '',
  }))

  return (
    <>
      <Header
        title={mode === 'create' ? t('accountantsPage.create') : t('accountantsPage.edit')}
        description={mode === 'edit' ? fullNameOf(existing.data) ?? undefined : undefined}
        onBack={goBack}
        actions={
          <div className="flex flex-wrap items-end gap-2">
            <div className="w-16">
              <Input
                size="sm"
                label={t('accountantsPage.seria')}
                value={searchSeria}
                maxLength={2}
                placeholder="AA"
                onChange={(event) =>
                  setSearchSeria(event.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2))
                }
              />
            </div>
            <div className="w-28">
              <Input
                size="sm"
                label={t('accountantsPage.number')}
                value={searchNumber}
                maxLength={7}
                placeholder="1234567"
                onChange={(event) =>
                  setSearchNumber(event.target.value.replace(/\D/g, '').slice(0, 7))
                }
              />
            </div>
            <DateInput
              className="w-40"
              size="sm"
              label={t('accountantsPage.birthday')}
              value={searchBirthday}
              onChange={(event) => setSearchBirthday(event.target.value)}
            />
            <Button variant="primary" size="sm" loading={mspd.isPending} onClick={() => void onSearch()}>
              <Search className="size-3.5" aria-hidden />
              {t('accountantsPage.find')}
            </Button>
          </div>
        }
      />
      <PageMain>
        {existing.isError ? (
          <ErrorMessage />
        ) : mode === 'edit' && existing.isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={8} />
          </Panel>
        ) : (
          <Panel padding="md">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold tracking-wide text-deep uppercase">
                {t('accountantsPage.section')}
              </h3>
              <Button variant="primary" size="sm" loading={saving} onClick={onSave}>
                {t('common.save')}
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                required
                label={t('accountantsPage.lastName')}
                value={form.last_name}
                onChange={(event) => setField('last_name', event.target.value)}
              />
              <Input
                required
                label={t('accountantsPage.firstName')}
                value={form.first_name}
                onChange={(event) => setField('first_name', event.target.value)}
              />
              <Input
                required
                label={t('accountantsPage.middleName')}
                value={form.middle_name}
                onChange={(event) => setField('middle_name', event.target.value)}
              />
              <DateInput
                required
                label={t('accountantsPage.birthday')}
                value={form.birthday}
                onChange={(event) => setField('birthday', event.target.value)}
              />
              <Select
                label={t('accountantsPage.gender')}
                value={form.gender}
                onChange={(event) => setField('gender', event.target.value)}
                options={[
                  { value: '1', label: t('accountantsPage.male') },
                  { value: '0', label: t('accountantsPage.female') },
                ]}
              />
              <div className="flex items-end pb-2">
                <Checkbox
                  checked={form.status}
                  onChange={(checked) => setField('status', checked)}
                />
                <span className="ml-2 text-sm text-deep">{t('accountantsPage.status')}</span>
              </div>
              <Input
                required
                label={t('accountantsPage.seria')}
                value={form.passport_seria}
                maxLength={2}
                placeholder="AA"
                onChange={(event) =>
                  setField(
                    'passport_seria',
                    event.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2),
                  )
                }
              />
              <Input
                required
                label={t('accountantsPage.number')}
                value={form.passport_number}
                maxLength={7}
                placeholder="1234567"
                onChange={(event) =>
                  setField('passport_number', event.target.value.replace(/\D/g, '').slice(0, 7))
                }
              />
              {mode === 'create' ? (
                <PhoneInput
                  required
                  label={t('accountantsPage.login')}
                  hint={t('accountantsPage.loginHint')}
                  value={form.username}
                  onChange={(event) => setField('username', event.target.value)}
                />
              ) : null}
              <PhoneInput
                required
                label={t('accountantsPage.phone')}
                value={form.phone}
                onChange={(event) => setField('phone', event.target.value)}
              />
              <Input
                label={t('accountantsPage.email')}
                value={form.email}
                onChange={(event) => setField('email', event.target.value)}
              />
              <Select
                required
                label={t('accountantsPage.region')}
                value={form.region_id}
                onOpen={openRegions}
                loading={regions.isFetching && regionOptions.length === 0}
                options={regionOptions}
                onChange={(event) => {
                  setField('region_id', event.target.value)
                  setField('area_id', '')
                }}
              />
              <Select
                required
                label={t('accountantsPage.district')}
                value={form.area_id}
                disabled={!form.region_id}
                onOpen={openDistricts}
                loading={districts.isFetching && districtOptions.length === 0}
                options={districtOptions}
                onChange={(event) => setField('area_id', event.target.value)}
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <Input
                  required
                  label={t('accountantsPage.address')}
                  value={form.address}
                  onChange={(event) => setField('address', event.target.value)}
                />
              </div>
            </div>
          </Panel>
        )}
      </PageMain>
    </>
  )
}
