import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  Car,
  Gauge,
  Pencil,
  UserRound,
  Wrench,
  ZoomIn,
} from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  DateInput,
  Drawer,
  EmptyState,
  ErrorMessage,
  Input,
  Modal,
  notify,
  SafeImage,
  Select,
  Skeleton,
  Textarea,
} from '@/components/ui'
import { useAuth } from '@/features/auth'
import {
  useCarDetailsQuery,
  useTeacherCarsQuery,
  useUpdateCarDetailsMutation,
} from '@/features/cars'
import { asText } from '@/lib/apiPage'
import { formatDate } from '@/lib/format'
import type { CarDetailsPayload, TeacherCar } from '@/types/cars'

const CONDITIONS = ['good', 'needs_service', 'critical'] as const

function isoDay(value?: string | null) {
  if (!value) return ''
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/)
  return match?.[1] ?? ''
}

function personName(car: TeacherCar) {
  const teacher = car.teacher
  if (!teacher) return ''
  return [teacher.last_name, teacher.first_name, teacher.middle_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')
}

function groupMeta(car: TeacherCar) {
  const row = car.group_cars?.[0]
  const group = row?.group
  return {
    eduType: group?.edu_type,
    start: group?.edu_starting_date ?? row?.edu_starting_date,
    end: group?.edu_ending_date ?? row?.edu_ending_date,
  }
}

function photoOf(car: TeacherCar) {
  return car.tex_front_image || car.front_photo || car.photo || car.image || ''
}

function conditionKey(status?: string | null) {
  if (status === 'good' || status === 'needs_service' || status === 'critical') return status
  return ''
}

function CarCard({ car }: { car: TeacherCar }) {
  const { t, i18n } = useTranslation()
  const details = useCarDetailsQuery(String(car.id))
  const info = details.data
  const { eduType, start, end } = groupMeta(car)
  const teacher = personName(car)
  const category =
    eduType?.short_name || eduType?.name_for_exam || eduType?.name || ''
  const dates =
    start && formatDate(start, i18n.language)
      ? `${formatDate(start, i18n.language)} — ${formatDate(end, i18n.language) ?? '—'}`
      : ''
  const active = Number(car.status) === 1
  const mspd = Number(car.mspd_status)
  const mspdLabel =
    mspd === 1
      ? t('teacherCarsPage.mspdOk')
      : mspd === 2
        ? t('teacherCarsPage.mspdBad')
        : t('teacherCarsPage.mspdPending')
  const condition = conditionKey(info?.condition_status)
  const photo = photoOf(car)
  const [preview, setPreview] = useState(false)
  const title = [car.name, car.number].filter(Boolean).join(' / ') || t('nav.cars')

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-mist/70 bg-white shadow-[0_10px_28px_rgba(15,36,48,0.05)]">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
          {photo ? (
            <Button
              variant="ghost"
              size="inline"
              className="group relative !h-28 !w-full !shrink-0 !rounded-xl !p-0 sm:!w-40"
              aria-label={t('teacherCarsPage.enlarge')}
              onClick={() => setPreview(true)}
            >
              <SafeImage
                src={photo}
                alt={car.name || ''}
                icon={Car}
                size="md"
                fit="contain"
                className="size-full rounded-xl bg-fog"
              />
              <span className="absolute right-1.5 bottom-1.5 inline-flex size-7 items-center justify-center rounded-full bg-deep/55 text-white opacity-0 transition group-hover:opacity-100">
                <ZoomIn className="size-3.5" aria-hidden />
              </span>
            </Button>
          ) : (
            <SafeImage
              src=""
              alt=""
              icon={Car}
              size="md"
              label={t('teacherCarsPage.noPhoto')}
              className="h-28 w-full rounded-xl sm:w-40"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-semibold tracking-tight text-deep">
                  {car.name || '—'}
                </h3>
                {car.number ? (
                  <span className="rounded-md bg-signal-soft px-2 py-0.5 font-mono text-[13px] font-semibold tracking-wider text-signal">
                    {car.number}
                  </span>
                ) : null}
              </div>
              {car.mspd_model_name ? (
                <p className="mt-1 text-[12px] font-medium tracking-wide text-muted uppercase">
                  {car.mspd_model_name}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {car.car_category?.name ? (
                <Badge tone="signal">{car.car_category.name}</Badge>
              ) : null}
              {car.year_of_manufacture ? (
                <Badge>{t('teacherCarsPage.year', { year: car.year_of_manufacture })}</Badge>
              ) : null}
              <Badge tone={active ? 'teal' : 'neutral'}>
                {active ? t('teacherCarsPage.active') : t('teacherCarsPage.inactive')}
              </Badge>
              {car.mspd_status != null ? (
                <Badge tone={mspd === 1 ? 'teal' : mspd === 2 ? 'rose' : 'amber'}>
                  {t('teacherCarsPage.mspd', { status: mspdLabel })}
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {category ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-fog px-2.5 py-1.5 text-[13px] text-ink">
                  {eduType?.image ? (
                    <img src={eduType.image} alt="" className="size-4 object-contain" />
                  ) : (
                    <Car className="size-4 text-signal" aria-hidden />
                  )}
                  {category}
                </span>
              ) : null}
              {dates ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-fog px-2.5 py-1.5 text-[13px] text-ink">
                  <Calendar className="size-4 text-signal" aria-hidden />
                  {dates}
                </span>
              ) : null}
              {teacher ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-fog px-2.5 py-1.5 text-[13px] text-ink uppercase">
                  <UserRound className="size-4 text-signal" aria-hidden />
                  {teacher}
                </span>
              ) : null}
            </div>
            {info ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {info.last_oil_change_date ? (
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
                    <Wrench className="size-3.5 shrink-0 text-signal" aria-hidden />
                    {t('teacherCarsPage.oil')}: {formatDate(info.last_oil_change_date, i18n.language)}
                  </span>
                ) : null}
                {info.last_tire_change_date ? (
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
                    <Wrench className="size-3.5 shrink-0 text-signal" aria-hidden />
                    {t('teacherCarsPage.tire')}: {formatDate(info.last_tire_change_date, i18n.language)}
                  </span>
                ) : null}
                {info.mileage_km != null && asText(info.mileage_km) !== '—' ? (
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
                    <Gauge className="size-3.5 shrink-0 text-signal" aria-hidden />
                    {t('teacherCarsPage.mileageShort', { km: info.mileage_km })}
                  </span>
                ) : null}
                {condition ? (
                  <span className="text-[13px] text-muted">
                    {t('teacherCarsPage.conditionShort', {
                      status: t(`teacherCarsPage.${condition === 'needs_service' ? 'needsService' : condition}`),
                    })}
                  </span>
                ) : null}
                {info.condition_notes ? (
                  <span className="text-[13px] text-muted sm:col-span-2">
                    {t('teacherCarsPage.notesShort', { text: info.condition_notes })}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </article>
      <Modal
        open={preview}
        onClose={() => setPreview(false)}
        title={title}
        sizeClassName="max-w-4xl"
        bodyClassName="p-3 sm:p-4"
      >
        <SafeImage
          src={photo}
          alt={car.name || ''}
          icon={Car}
          size="xl"
          fit="contain"
          className="mx-auto h-[min(75svh,720px)] w-full rounded-xl bg-fog"
        />
      </Modal>
    </>
  )
}

function UpdateForm({ carId, onClose }: { carId: number; onClose: () => void }) {
  const { t } = useTranslation()
  const details = useCarDetailsQuery(String(carId))
  const mutation = useUpdateCarDetailsMutation()
  const [oil, setOil] = useState('')
  const [tire, setTire] = useState('')
  const [mileage, setMileage] = useState('')
  const [condition, setCondition] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const info = details.data
    if (!info) return
    setOil(isoDay(info.last_oil_change_date))
    setTire(isoDay(info.last_tire_change_date))
    setMileage(info.mileage_km == null ? '' : String(info.mileage_km))
    setCondition(conditionKey(info.condition_status))
    setNotes(info.condition_notes?.trim() || '')
  }, [details.data])

  const hasData = Boolean(
    oil || tire || mileage.trim() || condition || notes.trim(),
  )

  const save = () => {
    if (!hasData) return
    const km = mileage.trim() === '' ? undefined : Number(mileage)
    if (km != null && Number.isNaN(km)) return
    const payload: CarDetailsPayload = {
      last_oil_change_date: oil || undefined,
      last_tire_change_date: tire || undefined,
      mileage_km: km,
      condition_status: condition || undefined,
      condition_notes: notes.trim() || undefined,
    }
    mutation.mutate(
      { id: String(carId), payload },
      {
        onSuccess: () => {
          notify.success(t('common.saved'))
          onClose()
        },
        onError: (error) => {
          notify.error(error instanceof Error ? error.message : t('teacherCarsPage.saveError'))
        },
      },
    )
  }

  if (details.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    )
  }

  return (
    <form
      id="teacher-car-details"
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        save()
      }}
    >
      <DateInput
        label={t('teacherCarsPage.oil')}
        name="last_oil_change_date"
        value={oil}
        onChange={(event) => setOil(event.target.value)}
      />
      <DateInput
        label={t('teacherCarsPage.tire')}
        name="last_tire_change_date"
        value={tire}
        onChange={(event) => setTire(event.target.value)}
      />
      <Input
        label={t('teacherCarsPage.mileage')}
        name="mileage_km"
        type="number"
        min={0}
        placeholder={t('teacherCarsPage.mileagePh')}
        value={mileage}
        onChange={(event) => setMileage(event.target.value)}
      />
      <Select
        label={t('teacherCarsPage.condition')}
        placeholder={t('teacherCarsPage.conditionPh')}
        searchable={false}
        value={condition}
        onChange={(event) => setCondition(event.target.value)}
        options={CONDITIONS.map((value) => ({
          value,
          label: t(
            `teacherCarsPage.${value === 'needs_service' ? 'needsService' : value}`,
          ),
        }))}
      />
      <Textarea
        label={t('teacherCarsPage.notes')}
        name="condition_notes"
        rows={4}
        placeholder={t('teacherCarsPage.notesPh')}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button type="submit" loading={mutation.isPending} disabled={!hasData}>
          {t('common.save')}
        </Button>
        <Button variant="danger" onClick={onClose} disabled={mutation.isPending}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  )
}

export function TeacherCarsPage() {
  const { t } = useTranslation()
  const { me } = useAuth()
  const teacherId = me?.profession?.id
  const { data, isLoading, isError, error } = useTeacherCarsQuery(teacherId)
  const cars = data ?? []
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const close = () => {
    setOpen(false)
    setSelectedId(null)
  }

  const openDrawer = () => {
    setSelectedId(cars.length === 1 ? cars[0].id : null)
    setOpen(true)
  }

  return (
    <>
      <Header
        title={t('nav.cars')}
        actions={
          <Button size="sm" onClick={openDrawer} disabled={cars.length === 0}>
            <Pencil className="size-4" aria-hidden />
            {t('teacherCarsPage.update')}
          </Button>
        }
      />
      <PageMain>
        {isError ? (
          <ErrorMessage>
            {error instanceof Error ? error.message : undefined}
          </ErrorMessage>
        ) : isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : cars.length === 0 ? (
          <EmptyState description={t('teacherCarsPage.empty')} />
        ) : (
          <div className="flex flex-col gap-3">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </PageMain>
      <Drawer open={open} onClose={close} title={t('teacherCarsPage.updateTitle')} widthClassName="max-w-md">
        {cars.length === 0 ? (
          <EmptyState description={t('teacherCarsPage.empty')} />
        ) : cars.length > 1 && selectedId == null ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted">{t('teacherCarsPage.pickCar')}</p>
            <Select
              label={t('teacherCarsPage.pickCarPh')}
              placeholder={t('teacherCarsPage.pickCarPh')}
              value=""
              onChange={(event) => setSelectedId(Number(event.target.value))}
              options={cars.map((car) => ({
                value: car.id,
                label: `${car.name || '—'} (${car.number || '—'})`,
              }))}
            />
          </div>
        ) : selectedId != null ? (
          <div className="flex flex-col gap-3">
            {cars.length > 1 ? (
              <Button variant="link" size="inline" onClick={() => setSelectedId(null)}>
                {t('teacherCarsPage.pickOther')}
              </Button>
            ) : null}
            <UpdateForm key={selectedId} carId={selectedId} onClose={close} />
          </div>
        ) : null}
      </Drawer>
    </>
  )
}
