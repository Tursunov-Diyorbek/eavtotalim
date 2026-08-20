import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Button,
  ErrorMessage,
  Input,
  Panel,
  Select,
  SkeletonLines,
  notify,
} from '@/components/ui'
import { routes } from '@/config'
import {
  useCarFormOptionsQuery,
  useCreateCarMutation,
  useUpdateCarMutation,
} from '@/features/cars'
import { asFio, asText } from '@/lib/apiPage'
import { useSmartBack } from '@/hooks'
import type { CarDetail, NamedOption } from '@/types/cars'

type FormState = {
  name: string
  number: string
  model_id: string
  type_id: string
  color_id: string
  teacher_id: string
  year_of_manufacture: string
  fuel_type_id: string
  yhx_department_id: string
  car_category_id: string
  tex_passport_seria: string
  tex_passport_number: string
  engine_number: string
  engine_power: string
  body: string
  number_of_seats: string
  status: string
}

const EMPTY: FormState = {
  name: '',
  number: '',
  model_id: '',
  type_id: '',
  color_id: '',
  teacher_id: '',
  year_of_manufacture: '',
  fuel_type_id: '',
  yhx_department_id: '',
  car_category_id: '',
  tex_passport_seria: '',
  tex_passport_number: '',
  engine_number: '',
  engine_power: '',
  body: '',
  number_of_seats: '',
  status: '1',
}

function optionLabel(item: NamedOption) {
  const fio = asFio(item)
  if (fio !== '—') return fio
  return asText(item.name ?? item.short_name ?? item.year ?? item.id)
}

function dataToForm(data: CarDetail): FormState {
  return {
    name: data.name ?? '',
    number: data.number ?? '',
    model_id: String(data.model_id ?? data.model?.id ?? ''),
    type_id: String(data.type_id ?? data.type?.id ?? ''),
    color_id: String(data.color_id ?? data.color?.id ?? ''),
    teacher_id: String(data.teacher_id ?? data.teacher?.id ?? ''),
    year_of_manufacture: String(data.year_of_manufacture ?? ''),
    fuel_type_id: String(data.fuel_type_id ?? data.fuel_type?.id ?? ''),
    yhx_department_id: String(data.yhx_department_id ?? ''),
    car_category_id: String(data.car_category_id ?? ''),
    tex_passport_seria: data.tex_passport_seria ?? '',
    tex_passport_number: data.tex_passport_number ?? '',
    engine_number: data.engine_number ?? '',
    engine_power: String(data.engine_power ?? ''),
    body: data.body ?? '',
    number_of_seats: String(data.number_of_seats ?? ''),
    status: data.status == null ? '1' : String(Number(data.status)),
  }
}

function toOptions(list?: NamedOption[]) {
  return (list ?? []).map((item) => ({
    value: String(item.id),
    label: optionLabel(item),
  }))
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

  useEffect(() => {
    if (initial) setForm(dataToForm(initial))
  }, [initial])

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submit = () => {
    if (!form.name || !form.number) {
      notify.error(t('carsPage.fillRequired'))
      return
    }
    const fd = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (value !== '') fd.append(key, value)
    })
    const onOk = () => {
      notify.success(mode === 'create' ? t('common.created') : t('common.saved'))
      navigate(routes.cars)
    }
    const onErr = (err: Error) => notify.error(err.message || t('common.loadError'))
    if (mode === 'create') {
      createMutation.mutate(fd, { onSuccess: onOk, onError: onErr })
    } else {
      updateMutation.mutate(fd, { onSuccess: onOk, onError: onErr })
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending
  const title = mode === 'create' ? t('carsPage.add') : t('carsPage.edit')

  return (
    <>
      <Header
        title={title}
        actions={
          <Button variant="outline" size="sm" onClick={goBack}>
            {t('common.back')}
          </Button>
        }
      />
      <main className="flex-1 p-3 sm:p-4">
        {isError ? <ErrorMessage /> : null}
        {isLoading && !options ? (
          <Panel padding="md">
            <SkeletonLines lines={8} />
          </Panel>
        ) : (
          <Panel padding="md">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                required
                label={t('directorList.name')}
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
              <Input
                required
                label={t('directorList.number')}
                value={form.number}
                onChange={(e) => setField('number', e.target.value)}
              />
              <Select
                label={t('carsPage.model')}
                value={form.model_id}
                onChange={(e) => setField('model_id', e.target.value)}
                options={toOptions(options?.car_models)}
              />
              <Select
                label={t('carsPage.type')}
                value={form.type_id}
                onChange={(e) => setField('type_id', e.target.value)}
                options={toOptions(options?.car_types)}
              />
              <Select
                label={t('carsPage.color')}
                value={form.color_id}
                onChange={(e) => setField('color_id', e.target.value)}
                options={toOptions(options?.car_colors)}
              />
              <Select
                label={t('carsPage.year')}
                value={form.year_of_manufacture}
                onChange={(e) => setField('year_of_manufacture', e.target.value)}
                options={toOptions(options?.years)}
              />
              <Select
                label={t('carsPage.fuel')}
                value={form.fuel_type_id}
                onChange={(e) => setField('fuel_type_id', e.target.value)}
                options={toOptions(options?.fuel_types)}
              />
              <Select
                label={t('carsPage.teacher')}
                value={form.teacher_id}
                onChange={(e) => setField('teacher_id', e.target.value)}
                options={toOptions(options?.teachers)}
              />
              <Select
                label={t('carsPage.yhx')}
                value={form.yhx_department_id}
                onChange={(e) => setField('yhx_department_id', e.target.value)}
                options={toOptions(options?.yhx_managements)}
              />
              <Select
                label={t('carsPage.category')}
                value={form.car_category_id}
                onChange={(e) => setField('car_category_id', e.target.value)}
                options={toOptions(options?.categories)}
              />
              <Input
                label={t('carsPage.texPassport')}
                value={form.tex_passport_seria}
                onChange={(e) => setField('tex_passport_seria', e.target.value)}
              />
              <Input
                label={t('carsPage.texNumber')}
                value={form.tex_passport_number}
                onChange={(e) => setField('tex_passport_number', e.target.value)}
              />
              <Input
                label={t('carsPage.engine')}
                value={form.engine_number}
                onChange={(e) => setField('engine_number', e.target.value)}
              />
              <Input
                label={t('carsPage.enginePower')}
                value={form.engine_power}
                onChange={(e) => setField('engine_power', e.target.value)}
              />
              <Input
                label={t('carsPage.body')}
                value={form.body}
                onChange={(e) => setField('body', e.target.value)}
              />
              <Input
                label={t('carsPage.seats')}
                value={form.number_of_seats}
                onChange={(e) => setField('number_of_seats', e.target.value.replace(/\D/g, ''))}
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
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={goBack}>
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
