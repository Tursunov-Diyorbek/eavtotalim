import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, ImagePlus, X } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  Checkbox,
  DateInput,
  DeleteButton,
  ErrorMessage,
  Input,
  Panel,
  Select,
  SkeletonLines,
  Textarea,
  fieldLabelClassName,
  notify,
} from '@/components/ui'
import { PATH_PREFIX_FILE, routes } from '@/config'
import {
  useCarFormOptionsQuery,
  useCreateCarMutation,
  useUpdateCarMutation,
} from '@/features/cars'
import { resolveFileUrl } from '@/features/lessons'
import { asText } from '@/lib/apiPage'
import { cn } from '@/lib/cn'
import { useSmartBack } from '@/hooks'
import type { CarDetail, NamedOption } from '@/types/cars'

const MAX_PHOTO = 4 * 1024 * 1024

type FormState = {
  name: string
  number: string
  model_id: string
  type_id: string
  color_id: string
  year_of_manufacture: string
  fuel_type_id: string
  yhx_department_id: string
  car_category_id: string
  tex_passport_seria: string
  tex_passport_number: string
  engine_number: string
  engine_power: string
  body: string
  full_weight: string
  unloaded_weight: string
  number_of_seats: string
  number_of_standings: string
  separate_characters: string
  given_date: string
  status: string
  status_gps: string
}

type PhotoKey =
  | 'image'
  | 'front_photo'
  | 'back_photo'
  | 'right_photo'
  | 'left_photo'
  | 'pidal_photo'
  | 'tex_image_front'

const EMPTY: FormState = {
  name: '',
  number: '',
  model_id: '',
  type_id: '',
  color_id: '',
  year_of_manufacture: '',
  fuel_type_id: '',
  yhx_department_id: '',
  car_category_id: '',
  tex_passport_seria: '',
  tex_passport_number: '',
  engine_number: '',
  engine_power: '',
  body: '',
  full_weight: '',
  unloaded_weight: '',
  number_of_seats: '',
  number_of_standings: '',
  separate_characters: '',
  given_date: '',
  status: '1',
  status_gps: '0',
}

const EMPTY_FILES: Record<PhotoKey, File | null> = {
  image: null,
  front_photo: null,
  back_photo: null,
  right_photo: null,
  left_photo: null,
  pidal_photo: null,
  tex_image_front: null,
}

function isoDate(value?: string | null) {
  if (!value) return ''
  const text = value.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : ''
}

function dataToForm(data: CarDetail): FormState {
  return {
    name: data.name ?? '',
    number: data.number ?? '',
    model_id: String(data.model_id ?? data.model?.id ?? ''),
    type_id: String(data.type_id ?? data.type?.id ?? ''),
    color_id: String(data.color_id ?? data.color?.id ?? ''),
    year_of_manufacture: String(data.year_of_manufacture ?? ''),
    fuel_type_id: String(data.fuel_type_id ?? data.fuel_type?.id ?? ''),
    yhx_department_id: String(data.yhx_department_id ?? data.yhx_department?.id ?? ''),
    car_category_id: String(data.car_category_id ?? data.car_category?.id ?? ''),
    tex_passport_seria: data.tex_passport_seria ?? '',
    tex_passport_number: data.tex_passport_number ?? '',
    engine_number: data.engine_number ?? '',
    engine_power: String(data.engine_power ?? ''),
    body: data.body ?? '',
    full_weight: String(data.full_weight ?? ''),
    unloaded_weight: String(data.unloaded_weight ?? ''),
    number_of_seats: String(data.number_of_seats ?? ''),
    number_of_standings: String(data.number_of_standings ?? ''),
    separate_characters:
      (data as CarDetail & { separate_characters?: string | null }).separate_characters ??
      data.special_marks ??
      '',
    given_date: isoDate(data.given_date),
    status: data.status == null ? '1' : String(Number(data.status) === 1 ? 1 : 0),
    status_gps: Number(data.status_gps) === 1 ? '1' : '0',
  }
}

function toOptions(list?: NamedOption[]) {
  return (list ?? []).map((item) => ({
    value: String(item.id),
    label: asText(item.name ?? item.short_name ?? item.id),
  }))
}

function yearOptions(list?: Array<NamedOption | string | number>) {
  return (list ?? []).flatMap((item) => {
    if (item == null || item === '') return []
    if (typeof item === 'string' || typeof item === 'number') {
      return [{ value: String(item), label: String(item) }]
    }
    const value = String(item.year ?? item.name ?? item.id ?? '')
    if (!value) return []
    return [{ value, label: asText(item.name ?? item.year ?? item.id) }]
  })
}

function saveError(message: string, t: (key: string) => string) {
  if (message === 'exists_other_organization') return t('carsPage.existsOther')
  if (message === 'exists_own_organization') return t('carsPage.existsOwn')
  return message || t('common.loadError')
}

export function CarForm({
  mode,
  carId,
  initial,
}: {
  mode: 'create' | 'edit'
  carId?: string
  initial?: CarDetail | null
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.cars)
  const { data: options, isLoading, isError } = useCarFormOptionsQuery()
  const createMutation = useCreateCarMutation()
  const updateMutation = useUpdateCarMutation(carId ?? '')
  const [form, setForm] = useState<FormState>(EMPTY)
  const [files, setFiles] = useState(EMPTY_FILES)
  const [categoryOn, setCategoryOn] = useState(false)

  const canSetCategory = Boolean(options?.can_set_car_category_manually)

  useEffect(() => {
    if (!initial) return
    setForm(dataToForm(initial))
    if (initial.car_category_id || initial.car_category?.id) setCategoryOn(true)
  }, [initial])

  useEffect(() => {
    if (canSetCategory) setCategoryOn(true)
  }, [canSetCategory])

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const setPhoto = (key: PhotoKey, file: File | null) => {
    if (file && file.size > MAX_PHOTO) {
      notify.error(t('carsPage.fileTooBig'))
      return
    }
    setFiles((prev) => ({ ...prev, [key]: file }))
  }

  const tramId = options?.tram_category_id
  const categories = (options?.categories ?? []).filter((item) => {
    if (canSetCategory) return true
    if (tramId == null || tramId === '') return false
    return String(item.id) === String(tramId)
  })

  const submit = () => {
    if (!form.name.trim() || !form.number.trim()) {
      notify.error(t('carsPage.fillRequired'))
      return
    }
    if (mode === 'create' && !files.image) {
      notify.error(t('carsPage.fillRequired'))
      return
    }
    if (canSetCategory && !form.car_category_id) {
      notify.error(t('carsPage.fillRequired'))
      return
    }
    const fd = new FormData()
    const payload: Record<string, string> = { ...form }
    if (!categoryOn) payload.car_category_id = ''
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'status' || key === 'status_gps' || value !== '') fd.append(key, value)
    })
    ;(Object.keys(files) as PhotoKey[]).forEach((key) => {
      const file = files[key]
      if (file) fd.append(key, file)
    })
    const onOk = () => {
      notify.success(mode === 'create' ? t('common.created') : t('common.saved'))
      navigate(routes.cars)
    }
    const onErr = (err: Error) => notify.error(saveError(err.message, t))
    if (mode === 'create') {
      createMutation.mutate(fd, { onSuccess: onOk, onError: onErr })
    } else {
      updateMutation.mutate(fd, { onSuccess: onOk, onError: onErr })
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending
  const title = mode === 'create' ? t('carsPage.formTitle') : t('carsPage.edit')
  const existing = (key: PhotoKey) => existingPhoto(initial, key)

  return (
    <>
      <Header
        title={<span className="uppercase">{title}</span>}
        onBack={goBack}
        actions={
          <Button variant="primary" loading={saving} onClick={submit}>
            {t('common.save')}
          </Button>
        }
      />
      <PageMain>
        {isError ? <ErrorMessage /> : null}
        {isLoading && !options ? (
          <Panel padding="md">
            <SkeletonLines lines={10} />
          </Panel>
        ) : (
          <div className="flex flex-col gap-3">
            <Section
              title={t('carsPage.basic')}
              tag={t('carsPage.requiredTag')}
              required
              extra={
                <div className="flex items-center gap-4">
                  <Toggle
                    label={t('carsPage.gps')}
                    checked={form.status_gps === '1'}
                    onChange={(on) => setField('status_gps', on ? '1' : '0')}
                  />
                  <Toggle
                    label={t('carsPage.statusToggle')}
                    checked={form.status === '1'}
                    onChange={(on) => setField('status', on ? '1' : '0')}
                  />
                </div>
              }
            >
              <div className="grid gap-3 lg:grid-cols-[11rem_1fr]">
                <PhotoField
                  label={t('carsPage.photoMainLabel')}
                  required
                  file={files.image}
                  existing={existing('image')}
                  onChange={(file) => setPhoto('image', file)}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    required
                    label={t('carsPage.brand')}
                    placeholder={t('carsPage.namePh')}
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                  />
                  <Input
                    required
                    label={t('carsPage.plateFull')}
                    placeholder={t('carsPage.numberPh')}
                    maxLength={8}
                    value={form.number}
                    onChange={(e) =>
                      setField(
                        'number',
                        e.target.value.toUpperCase().replace(/[А-ЯЁа-яё]/g, ''),
                      )
                    }
                  />
                  <div className="sm:col-span-2">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className={fieldLabelClassName}>
                        {t('carsPage.eduCategory')}
                        {canSetCategory ? <span className="text-rose"> *</span> : null}
                      </span>
                      <label className="inline-flex items-center gap-2 text-[13px] text-deep">
                        <Checkbox
                          checked={categoryOn}
                          onChange={(checked) => {
                            setCategoryOn(checked)
                            if (!checked) setField('car_category_id', '')
                          }}
                        />
                        {t('carsPage.tram')}
                      </label>
                    </div>
                    <Select
                      disabled={!categoryOn}
                      clearable
                      placeholder={categoryOn ? t('carsPage.categoryPh') : t('carsPage.categoryOffPh')}
                      value={form.car_category_id}
                      onChange={(e) => setField('car_category_id', e.target.value)}
                      options={toOptions(categories)}
                    />
                    {!canSetCategory && !categoryOn ? (
                      <p className="mt-1 text-[12px] text-muted">{t('carsPage.categoryHint')}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </Section>

            <Section title={t('carsPage.extra')} tag={t('carsPage.optionalTag')}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Select clearable searchable label={t('carsPage.modelLabel')} placeholder={t('carsPage.modelPh')} value={form.model_id} onChange={(e) => setField('model_id', e.target.value)} options={toOptions(options?.car_models)} />
                <Select clearable searchable label={t('carsPage.typeLabel')} placeholder={t('carsPage.typePh')} value={form.type_id} onChange={(e) => setField('type_id', e.target.value)} options={toOptions(options?.car_types)} />
                <Select clearable searchable label={t('carsPage.colorLabel')} placeholder={t('carsPage.colorPh')} value={form.color_id} onChange={(e) => setField('color_id', e.target.value)} options={toOptions(options?.car_colors)} />
                <Input label={t('carsPage.engine')} placeholder={t('carsPage.enginePh')} value={form.engine_number} onChange={(e) => setField('engine_number', e.target.value)} />
                <Input label={t('carsPage.enginePower')} placeholder={t('carsPage.enginePowerPh')} value={form.engine_power} onChange={(e) => setField('engine_power', e.target.value)} />
                <Select clearable searchable label={t('carsPage.yearLabel')} placeholder={t('carsPage.yearPh')} value={form.year_of_manufacture} onChange={(e) => setField('year_of_manufacture', e.target.value)} options={yearOptions(options?.years)} />
                <Select clearable searchable label={t('carsPage.fuelLabel')} placeholder={t('carsPage.fuelPh')} value={form.fuel_type_id} onChange={(e) => setField('fuel_type_id', e.target.value)} options={toOptions(options?.fuel_types)} />
                <Input label={t('carsPage.bodyLabel')} placeholder={t('carsPage.bodyPh')} value={form.body} onChange={(e) => setField('body', e.target.value)} />
                <Input label={t('carsPage.fullWeightLabel')} placeholder={t('carsPage.fullWeightPh')} value={form.full_weight} onChange={(e) => setField('full_weight', e.target.value)} />
                <Input label={t('carsPage.emptyWeightLabel')} placeholder={t('carsPage.emptyWeightPh')} value={form.unloaded_weight} onChange={(e) => setField('unloaded_weight', e.target.value)} />
                <Input label={t('carsPage.seatsLabel')} placeholder={t('carsPage.seatsPh')} value={form.number_of_seats} onChange={(e) => setField('number_of_seats', e.target.value)} />
                <Input label={t('carsPage.standLabel')} placeholder={t('carsPage.standPh')} value={form.number_of_standings} onChange={(e) => setField('number_of_standings', e.target.value)} />
                <Textarea
                  label={t('carsPage.marksLabel')}
                  placeholder={t('carsPage.marksPh')}
                  rows={3}
                  value={form.separate_characters}
                  onChange={(e) => setField('separate_characters', e.target.value)}
                />
                <PhotoField label={t('carsPage.photoFrontLabel')} file={files.front_photo} existing={existing('front_photo')} onChange={(file) => setPhoto('front_photo', file)} />
                <PhotoField label={t('carsPage.photoBackLabel')} file={files.back_photo} existing={existing('back_photo')} onChange={(file) => setPhoto('back_photo', file)} />
                <PhotoField label={t('carsPage.photoRightLabel')} file={files.right_photo} existing={existing('right_photo')} onChange={(file) => setPhoto('right_photo', file)} />
                <PhotoField label={t('carsPage.photoLeftLabel')} file={files.left_photo} existing={existing('left_photo')} onChange={(file) => setPhoto('left_photo', file)} />
                <PhotoField label={t('carsPage.photoPedalLabel')} file={files.pidal_photo} existing={existing('pidal_photo')} onChange={(file) => setPhoto('pidal_photo', file)} />
              </div>
            </Section>

            <Section title={t('carsPage.texSection')} tag={t('carsPage.optionalTag')}>
              <div className="grid gap-3 lg:grid-cols-[11rem_1fr]">
                <PhotoField
                  label={t('carsPage.texPhoto')}
                  file={files.tex_image_front}
                  existing={existing('tex_image_front')}
                  onChange={(file) => setPhoto('tex_image_front', file)}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className={cn(fieldLabelClassName, 'mb-1')}>{t('carsPage.texSerial')}</p>
                    <div className="grid grid-cols-[minmax(0,8rem)_1fr] gap-2">
                      <Input
                        label=""
                        placeholder={t('carsPage.seriaPh')}
                        maxLength={3}
                        value={form.tex_passport_seria}
                        onChange={(e) => setField('tex_passport_seria', e.target.value.toUpperCase())}
                      />
                      <Input
                        label=""
                        placeholder={t('carsPage.texNumberPh')}
                        maxLength={7}
                        value={form.tex_passport_number}
                        onChange={(e) => setField('tex_passport_number', e.target.value)}
                      />
                    </div>
                  </div>
                  <DateInput
                    label={t('carsPage.texDate')}
                    value={form.given_date}
                    onChange={(e) => setField('given_date', e.target.value)}
                  />
                  <Select
                    clearable
                    searchable
                    label={t('carsPage.yhxLabel')}
                    placeholder={t('carsPage.yhxPh')}
                    value={form.yhx_department_id}
                    onChange={(e) => setField('yhx_department_id', e.target.value)}
                    options={toOptions(options?.yhx_managements)}
                  />
                </div>
              </div>
            </Section>
          </div>
        )}
      </PageMain>
    </>
  )
}

function existingPhoto(data: CarDetail | null | undefined, key: PhotoKey) {
  if (!data) return ''
  const value =
    key === 'image'
      ? data.image || data.photo
      : key === 'pidal_photo'
        ? data.pedal_photo
        : key === 'tex_image_front'
          ? data.tex_passport_front
          : data[key]
  return value ? resolveFileUrl(value, PATH_PREFIX_FILE) : ''
}

function Section({
  title,
  tag,
  required,
  extra,
  children,
}: {
  title: string
  tag: string
  required?: boolean
  extra?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-mist/70 bg-white p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-deep">
          {title}{' '}
          <span className={required ? 'text-rose' : 'text-signal'}>({tag})</span>
        </h3>
        {extra}
      </div>
      {children}
    </section>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[13px] text-deep">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full text-white transition',
          checked ? 'bg-signal' : 'bg-mist',
        )}
      >
        <span className="absolute inset-y-0 left-1 flex items-center">
          {checked ? <Check className="size-3" aria-hidden /> : null}
        </span>
        <span className="absolute inset-y-0 right-1 flex items-center">
          {checked ? null : <X className="size-3" aria-hidden />}
        </span>
        <span
          className={cn(
            'absolute top-0.5 size-5 rounded-full bg-white shadow transition',
            checked ? 'left-5' : 'left-0.5',
          )}
        />
      </button>
    </label>
  )
}

function PhotoField({
  label,
  required,
  file,
  existing,
  onChange,
}: {
  label: string
  required?: boolean
  file: File | null
  existing?: string
  onChange: (file: File | null) => void
}) {
  const { t } = useTranslation()
  const [localUrl, setLocalUrl] = useState('')

  useEffect(() => {
    if (!file) {
      setLocalUrl('')
      return
    }
    const url = URL.createObjectURL(file)
    setLocalUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const src = localUrl || existing || ''
  const inputId = `car-photo-${label}`

  return (
    <div className="min-w-0">
      <p className={cn(fieldLabelClassName, 'mb-1')}>
        {label}
        {required ? <span className="text-rose"> *</span> : null}
      </p>
      <div className="relative">
        <label
          htmlFor={inputId}
          className="flex h-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-mist bg-fog text-muted"
        >
          {src ? (
            <img src={src} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-6" aria-hidden />
          )}
          <span className="sr-only">{t('carsPage.uploadPhoto')}</span>
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            onChange(e.target.files?.[0] ?? null)
            e.target.value = ''
          }}
        />
        {file ? (
          <div className="absolute top-1 right-1">
            <DeleteButton onClick={() => onChange(null)} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
