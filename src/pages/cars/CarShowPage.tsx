import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ImageOff, Minus, Printer, RefreshCw } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  DetailList,
  ErrorMessage,
  Modal,
  Panel,
  SafeImage,
  SearchInput,
  Select,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import {
  PATH_PREFIX_FILE,
  carRoadCostPath,
  carShowPath,
  groupShowPath,
  routes,
  teacherPath,
} from '@/config'
import {
  useCarDetailsQuery,
  useCarFormOptionsQuery,
  useCarQuery,
  useChangeCarCategoryMutation,
  useChangeCarTeacherMutation,
  useDisableCarMutation,
  useEnableCarMutation,
  useRecheckCarMspdMutation,
  useUnmergeCarTeacherMutation,
} from '@/features/cars'
import { CarEducationalStatus } from './CarEducationalStatus'
import { gaiStatusOf } from '@/features/groups'
import { resolveFileUrl } from '@/features/lessons'
import { asFio, asLangName, asText } from '@/lib/apiPage'
import { formatDate, fullNameOf } from '@/lib/format'
import { useSmartBack } from '@/hooks'
import type { CarDetail, NamedOption } from '@/types/cars'

function photoUrl(value?: string | null) {
  return value ? resolveFileUrl(value, PATH_PREFIX_FILE) : ''
}

function relationName(
  embedded: unknown,
  id: unknown,
  list: NamedOption[] | undefined,
  lang: string,
) {
  const direct = asLangName(embedded, lang)
  if (direct !== '—') return direct
  if (id == null || id === '') return '—'
  const found = (list ?? []).find((item) => String(item.id) === String(id))
  return found ? asLangName(found.name ?? found, lang) : '—'
}

function mspdRef(name?: string | null, code?: string | number | null) {
  const title = name?.trim()
  if (title) return code ? `${title} (${code})` : title
  if (code != null && code !== '') return String(code)
  return '—'
}

function assignedGroup(row: NonNullable<CarDetail['group_cars']>[number]) {
  return row.group ?? row
}

/** Eski `ShowCar` — avtomobil batafsil. */
export function CarShowPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.cars)
  const { id } = useParams()
  const query = useCarQuery(id)
  const detailsQuery = useCarDetailsQuery(id)
  const optionsQuery = useCarFormOptionsQuery()
  const recheckMutation = useRecheckCarMspdMutation()
  const enableMutation = useEnableCarMutation()
  const disableMutation = useDisableCarMutation()
  const unmergeMutation = useUnmergeCarTeacherMutation()
  const changeTeacherMutation = useChangeCarTeacherMutation()
  const changeCategoryMutation = useChangeCarCategoryMutation()

  const [stopOpen, setStopOpen] = useState(false)
  const [detachOpen, setDetachOpen] = useState(false)
  const [teacherOpen, setTeacherOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [teacherId, setTeacherId] = useState('')
  const [teacherQuery, setTeacherQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [preview, setPreview] = useState<{ src: string; title: string } | null>(null)

  const data = query.data
  const groups = useMemo(
    () => (data?.group_cars ?? []).map(assignedGroup).filter((row) => row.id),
    [data?.group_cars],
  )
  const locked = groups.some(
    (row) => gaiStatusOf(row.check_gai) === 'approved' || Number(row.edu_status) === 1,
  )
  const active = Number(data?.status) === 1
  const teacherName = fullNameOf(data?.teacher) ?? asFio(data?.teacher)
  const title = [asText(data?.name), asText(data?.number)].filter((v) => v !== '—').join(' - ')

  const options = optionsQuery.data
  const info = detailsQuery.data
  const detail = data?.detail
  const modelName = relationName(
    data?.car_model ?? data?.model,
    data?.model_id ?? data?.car_model?.id,
    options?.car_models,
    i18n.language,
  )
  const typeName = relationName(
    data?.car_type ?? data?.type,
    data?.type_id ?? data?.car_type?.id,
    options?.car_types,
    i18n.language,
  )
  const colorName = relationName(
    data?.car_color ?? data?.color,
    data?.color_id ?? data?.car_color?.id,
    options?.car_colors,
    i18n.language,
  )
  const fuelName = relationName(
    data?.fuel_type,
    data?.fuel_type_id,
    options?.fuel_types,
    i18n.language,
  )
  const yhxName = relationName(
    data?.yhx_department,
    data?.yhx_department_id,
    options?.yhx_managements,
    i18n.language,
  )
  const categoryName = relationName(
    data?.car_category,
    data?.car_category_id,
    options?.categories,
    i18n.language,
  )
  const conditionKey = info?.condition_status ?? detail?.condition_status
  const teacherRows = useMemo(() => {
    const needle = teacherQuery.trim().toLocaleLowerCase('uz')
    return (options?.teachers ?? []).filter((row) => {
      if (!needle) return true
      const carBits = [row.car?.name, row.car?.number].filter(Boolean).join(' ')
      const hay = `${fullNameOf(row) ?? ''} ${carBits}`.toLocaleLowerCase('uz')
      return hay.includes(needle)
    })
  }, [options?.teachers, teacherQuery])

  const conditionLabel =
    conditionKey === 'good'
      ? t('carsPage.conditionGood')
      : conditionKey === 'needs_service'
        ? t('carsPage.conditionService')
        : conditionKey === 'critical'
          ? t('carsPage.conditionCritical')
          : '—'

  const photos = [
    { key: 'main', src: photoUrl(data?.photo ?? data?.image), label: t('carsPage.photoMain') },
    { key: 'front', src: photoUrl(data?.front_photo), label: t('carsPage.photoFront') },
    { key: 'back', src: photoUrl(data?.back_photo), label: t('carsPage.photoBack') },
    { key: 'right', src: photoUrl(data?.right_photo), label: t('carsPage.photoRight') },
    { key: 'left', src: photoUrl(data?.left_photo), label: t('carsPage.photoLeft') },
    { key: 'pedal', src: photoUrl(data?.pidal_photo ?? data?.pedal_photo), label: t('carsPage.photoPedal') },
    {
      key: 'texFront',
      src: photoUrl(data?.tex_front_image ?? data?.tex_passport_front),
      label: t('carsPage.photoTexFront'),
    },
    {
      key: 'texBack',
      src: photoUrl(data?.tex_back_image ?? data?.tex_passport_back),
      label: t('carsPage.photoTexBack'),
    },
  ]

  const onToast = {
    onSuccess: () => notify.success(t('common.saved')),
    onError: (err: Error) => notify.error(err.message || t('common.loadError')),
  }

  return (
    <>
      <Header
        title={t('carsPage.showTitle', { name: title || t('carsPage.show') })}
        actions={
          <div className="flex items-center gap-2">
            {id ? (
              <Button variant="outline" onClick={() => navigate(carRoadCostPath(id))}>
                <Printer className="size-3.5" aria-hidden />
                {t('carsPage.printRoad')}
              </Button>
            ) : null}
            <Button variant="outline" size="icon-sm" onClick={goBack} aria-label={t('common.back')}>
              <ArrowLeft className="size-3.5" aria-hidden />
            </Button>
          </div>
        }
      />
      <PageMain>
        {query.isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={10} />
          </Panel>
        ) : query.isError || !data ? (
          <ErrorMessage />
        ) : (
          <>
            <Panel padding="sm">
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                {(
                  [
                    [t('carsPage.model'), modelName],
                    [t('directorList.number'), asText(data.number)],
                    [t('carsPage.year'), asText(data.year_of_manufacture)],
                    [
                      t('carsPage.gps'),
                      Number(data.status_gps) === 1 ? t('carsPage.gpsYes') : t('carsPage.gpsNo'),
                    ],
                    [
                      t('carsPage.mspd'),
                      Number(data.mspd_status) === 1
                        ? t('teachersPage.mspdOk')
                        : Number(data.mspd_status) === 0
                          ? t('teachersPage.mspdPending')
                          : t('teachersPage.mspdBad'),
                    ],
                    [t('carsPage.enteredAt'), formatDate(data.created_at, i18n.language) ?? '—'],
                    [t('carsPage.checkedAt'), formatDate(data.mspd_check_date, i18n.language) ?? '—'],
                  ] as const
                ).map(([label, value]) => (
                  <span key={label}>
                    <span className="text-muted">{label}: </span>
                    <span className="font-semibold text-deep">{value}</span>
                  </span>
                ))}
              </div>
            </Panel>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)]">
              <div className="space-y-3">
                <Panel padding="md">
                  <h3 className="mb-2 font-display text-sm font-semibold uppercase text-deep">
                    {t('carsPage.assignedGroups')}
                  </h3>
                  <Table storageKey="car-show:groups" className="min-w-160">
                    <THead>
                      <TR>
                        <TH className="w-12 text-center">№</TH>
                        <TH>{t('groupsPage.colName')}</TH>
                        <TH>{t('groupsPage.showPage.gai')}</TH>
                        <TH>{t('carsPage.lessonDates')}</TH>
                        <TH>{t('directorList.status')}</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {groups.length === 0 ? (
                        <TR>
                          <TD colSpan={5} className="py-6 text-center">
                            <span className="text-sm text-muted">{t('common.empty')}</span>
                          </TD>
                        </TR>
                      ) : (
                        groups.map((row, index) => (
                          <TR key={row.id ?? index}>
                            <TD className="text-center text-muted">{index + 1}</TD>
                            <TD>
                              {row.id ? (
                                <Link
                                  to={groupShowPath(row.id)}
                                  className="font-semibold text-signal hover:underline"
                                >
                                  {asText(row.name)}
                                </Link>
                              ) : (
                                asText(row.name)
                              )}
                            </TD>
                            <TD>
                              <Badge
                                tone={
                                  gaiStatusOf(row.check_gai) === 'approved' ? 'teal' : 'neutral'
                                }
                              >
                                {gaiStatusOf(row.check_gai) === 'approved'
                                  ? t('groupsPage.showPage.gaiApproved')
                                  : t('groupsPage.showPage.gaiWaiting')}
                              </Badge>
                            </TD>
                            <TD>
                              {[
                                formatDate(row.edu_starting_date, i18n.language),
                                formatDate(row.edu_ending_date, i18n.language),
                              ]
                                .filter(Boolean)
                                .join(' - ') || '—'}
                            </TD>
                            <TD>
                              <Badge tone={Number(row.edu_status) === 1 ? 'teal' : 'neutral'}>
                                {Number(row.edu_status) === 1
                                  ? t('dashboard.active')
                                  : Number(row.edu_status) === 2
                                    ? t('groupsPage.tabFinished')
                                    : t('groupsPage.tabNew')}
                              </Badge>
                            </TD>
                          </TR>
                        ))
                      )}
                    </TBody>
                  </Table>
                </Panel>

                <Panel padding="md">
                  <h3 className="mb-2 font-display text-sm font-semibold uppercase text-deep">
                    {t('carsPage.photos')}
                  </h3>
                  <div className="grid grid-cols-4 gap-1.5 lg:grid-cols-8">
                    {photos.map((photo) => (
                      <div
                        key={photo.key}
                        className="overflow-hidden rounded-lg border border-mist/70 bg-fog"
                      >
                        <div className="h-20 sm:h-24">
                          {photo.src ? (
                            <Button
                              variant="ghost"
                              size="inline"
                              className="!size-full !rounded-none !p-0"
                              aria-label={photo.label}
                              onClick={() => setPreview({ src: photo.src, title: photo.label })}
                            >
                              <SafeImage
                                src={photo.src}
                                alt={photo.label}
                                size="md"
                                icon={ImageOff}
                                className="size-full"
                              />
                            </Button>
                          ) : (
                            <SafeImage
                              src=""
                              alt={photo.label}
                              size="sm"
                              icon={ImageOff}
                              className="size-full"
                            />
                          )}
                        </div>
                        <p className="truncate border-t border-mist/70 px-1 py-0.5 text-center text-[10px] text-muted">
                          {photo.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel padding="md">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-semibold uppercase text-deep">
                      {t('carsPage.internal')}
                    </h3>
                    <Badge tone={active ? 'teal' : 'rose'}>
                      {t('directorList.status')}: {active ? t('dashboard.active') : t('dashboard.inactive')}
                    </Badge>
                  </div>
                  <div className="grid gap-x-6 gap-y-2 lg:grid-cols-3">
                    <DetailList
                      dense
                      items={[
                        { label: t('directorList.name'), value: data.name },
                        { label: t('directorList.number'), value: data.number },
                        {
                          label: t('carsPage.texPassport'),
                          value: [data.tex_passport_seria, data.tex_passport_number]
                            .filter(Boolean)
                            .join(' '),
                        },
                        { label: t('carsPage.givenDate'), value: formatDate(data.given_date, i18n.language) },
                        { label: t('carsPage.model'), value: modelName },
                        { label: t('carsPage.yhx'), value: yhxName },
                        {
                          label: t('carsPage.specialMarks'),
                          value: data.separate_characters || data.special_marks,
                        },
                        {
                          label: t('carsPage.mileage'),
                          value: info?.mileage_km ?? detail?.mileage_km ?? data.total_mileage,
                        },
                        {
                          label: t('carsPage.comments'),
                          value: info?.condition_notes ?? detail?.condition_notes ?? data.comments,
                        },
                      ]}
                    />
                    <DetailList
                      dense
                      items={[
                        { label: t('carsPage.type'), value: typeName },
                        {
                          label: t('carsPage.mspdType'),
                          value: mspdRef(data.mspd_type_name, data.mspd_type_id),
                        },
                        { label: t('carsPage.color'), value: colorName },
                        { label: t('carsPage.teacher'), value: teacherName },
                        { label: t('carsPage.year'), value: data.year_of_manufacture },
                        { label: t('carsPage.fuel'), value: fuelName },
                        { label: t('carsPage.body'), value: data.body },
                        {
                          label: t('carsPage.mspdBody'),
                          value: mspdRef(data.mspd_body_type_name, data.mspd_body_type_id),
                        },
                        { label: t('carsPage.educationType'), value: categoryName },
                        { label: t('carsPage.conditionShort'), value: conditionLabel },
                        {
                          label: t('carsPage.oilMileage'),
                          value: info?.oil_change_mileage_km ?? detail?.oil_change_mileage_km,
                        },
                      ]}
                    />
                    <DetailList
                      dense
                      items={[
                        { label: t('carsPage.engine'), value: data.engine_number },
                        { label: t('carsPage.enginePower'), value: data.engine_power },
                        { label: t('carsPage.fullWeight'), value: data.full_weight },
                        { label: t('carsPage.unloadedWeight'), value: data.unloaded_weight },
                        { label: t('carsPage.seats'), value: data.number_of_seats },
                        { label: t('carsPage.standLabel'), value: data.number_of_standings },
                        {
                          label: t('carsPage.oilChange'),
                          value: formatDate(
                            info?.last_oil_change_date ??
                              detail?.last_oil_change_date ??
                              data.last_oil_change_date,
                            i18n.language,
                          ),
                        },
                        {
                          label: t('carsPage.tireChange'),
                          value: formatDate(
                            info?.last_tire_change_date ??
                              detail?.last_tire_change_date ??
                              data.last_tire_change_date,
                            i18n.language,
                          ),
                        },
                      ]}
                    />
                  </div>
                  <CarEducationalStatus car={data} />
                </Panel>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  loading={recheckMutation.isPending}
                  onClick={() => id && recheckMutation.mutate(Number(id), onToast)}
                >
                  <RefreshCw className="size-3.5" aria-hidden />
                  {t('carsPage.refreshInfo')}
                </Button>

                <Panel padding="md">
                  <h3 className="mb-2 text-xs font-semibold uppercase text-muted">
                    {t('carsPage.systemStatus')}
                  </h3>
                  {active ? (
                    <Button
                      variant="danger"
                      size="sm"
                      className="w-full"
                      onClick={() => setStopOpen(true)}
                    >
                      <Minus className="size-3.5" aria-hidden />
                      {t('carsPage.stop')}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      loading={enableMutation.isPending}
                      onClick={() => id && enableMutation.mutate(Number(id), onToast)}
                    >
                      {t('carsPage.start')}
                    </Button>
                  )}
                </Panel>

                <Panel padding="md">
                  <h3 className="mb-2 text-xs font-semibold uppercase text-muted">
                    {t('carsPage.eduCategoryLabel', {
                      category: categoryName,
                    })}
                  </h3>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setCategoryId(String(data.car_category_id ?? ''))
                      setCategoryOpen(true)
                    }}
                  >
                    {t('carsPage.change')}
                  </Button>
                </Panel>

                <Panel padding="md">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="text-xs font-semibold uppercase text-muted">
                      {t('carsPage.assignedInstructor')}
                    </h3>
                    {data.teacher?.id ? (
                      <Link
                        to={teacherPath(data.teacher.id)}
                        className="text-right text-sm font-semibold uppercase text-signal hover:underline"
                      >
                        {teacherName}
                      </Link>
                    ) : (
                      <p className="text-right text-sm font-semibold text-rose">
                        {t('carsPage.teacherMissing')}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={() => {
                        if (!data.teacher?.id) {
                          notify.warning(t('carsPage.teacherMissing'))
                          return
                        }
                        if (locked) {
                          notify.warning(t('carsPage.teacherBlockedIntro'))
                          return
                        }
                        setDetachOpen(true)
                      }}
                    >
                      {t('common.delete')}
                    </Button>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => {
                        if (locked) {
                          notify.warning(t('carsPage.teacherBlockedIntro'))
                          return
                        }
                        setTeacherId('')
                        setTeacherQuery('')
                        setTeacherOpen(true)
                      }}
                    >
                      {t('carsPage.swap')}
                    </Button>
                  </div>
                  <p className="mt-3 text-sm font-medium text-deep">
                    {t('carsPage.teacherBlockedIntro')}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div>
                      <p className="flex gap-1.5 text-xs font-semibold leading-snug text-rose">
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-rose" />
                        {t('carsPage.teacherDetachTitle')}
                      </p>
                      <ul className="mt-1 space-y-0.5 pl-3.5 text-[11px] leading-snug text-muted">
                        <li>- {t('carsPage.teacherDetach1')}</li>
                        <li>- {t('carsPage.teacherDetach2')}</li>
                      </ul>
                    </div>
                    <div>
                      <p className="flex gap-1.5 text-xs font-semibold leading-snug text-signal">
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-signal" />
                        {t('carsPage.teacherSwapTitle')}
                      </p>
                      <ul className="mt-1 space-y-0.5 pl-3.5 text-[11px] leading-snug text-muted">
                        <li>- {t('carsPage.teacherSwap1')}</li>
                        <li>- {t('carsPage.teacherSwap2')}</li>
                      </ul>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
          </>
        )}
      </PageMain>

      <ConfirmDialog
        open={stopOpen}
        onClose={() => setStopOpen(false)}
        onConfirm={() => {
          if (!id) return
          disableMutation.mutate(Number(id), {
            ...onToast,
            onSuccess: () => {
              notify.success(t('common.saved'))
              setStopOpen(false)
            },
          })
        }}
        title={t('carsPage.stop')}
        loading={disableMutation.isPending}
      />
      <ConfirmDialog
        open={detachOpen}
        onClose={() => setDetachOpen(false)}
        onConfirm={() => {
          if (!data?.id || !data.teacher?.id) return
          unmergeMutation.mutate(
            { carId: data.id, teacherId: data.teacher.id },
            {
              ...onToast,
              onSuccess: () => {
                notify.success(t('common.saved'))
                setDetachOpen(false)
              },
            },
          )
        }}
        title={t('common.delete')}
        loading={unmergeMutation.isPending}
      />

      <Modal
        open={teacherOpen}
        onClose={() => setTeacherOpen(false)}
        title={t('carsPage.swapTitle')}
        sizeClassName="max-w-3xl"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="danger" size="sm" onClick={() => setTeacherOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!teacherId}
              loading={changeTeacherMutation.isPending}
              onClick={() => {
                if (!data?.id || !teacherId) return
                changeTeacherMutation.mutate(
                  { carId: data.id, teacherId: Number(teacherId) },
                  {
                    ...onToast,
                    onSuccess: () => {
                      notify.success(t('common.saved'))
                      setTeacherOpen(false)
                    },
                  },
                )
              }}
            >
              {t('carsPage.swap')}
            </Button>
          </div>
        }
      >
        <p className="mb-2 text-sm text-deep">{t('carsPage.swapPick')}</p>
        <SearchInput
          label={t('carsPage.swapSearch')}
          placeholder={t('carsPage.swapSearch')}
          value={teacherQuery}
          debounceMs={0}
          onChange={(event) => setTeacherQuery(event.target.value)}
        />
        <div className="mt-2 max-h-[min(50svh,420px)] overflow-y-auto">
          {optionsQuery.isLoading ? (
            <SkeletonLines lines={6} />
          ) : teacherRows.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted">{t('common.empty')}</p>
          ) : (
            teacherRows.map((row) => {
              const carText = [row.car?.name, row.car?.number].filter(Boolean).join(' - ')
              const taken = Boolean(row.car)
              const selected = teacherId === String(row.id)
              return (
                <div key={row.id} className="flex items-center gap-2 border-b border-mist/50 py-1">
                  <Button
                    variant="ghost"
                    size="inline"
                    className={`!h-auto !min-h-8 !w-full !justify-start !whitespace-normal !px-2 !py-1 !text-left !text-[13px] !font-medium uppercase ${selected ? '!bg-signal-soft' : ''}`}
                    onClick={() => {
                      if (taken) return
                      setTeacherId(String(row.id))
                    }}
                  >
                    <span>
                      {fullNameOf(row) ?? asText(row.name)}
                      {carText ? (
                        <span className="font-normal normal-case text-muted"> | {carText}</span>
                      ) : null}
                    </span>
                  </Button>
                  {row.car?.id ? (
                    <Link
                      to={carShowPath(row.car.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-[13px] font-medium text-signal hover:underline"
                    >
                      {t('carsPage.swapView')}
                    </Link>
                  ) : null}
                </div>
              )
            })
          )}
        </div>
      </Modal>

      <Modal
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        title={t('carsPage.category')}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setCategoryOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!categoryId || !id}
              loading={changeCategoryMutation.isPending}
              onClick={() => {
                if (!id || !categoryId) return
                changeCategoryMutation.mutate(
                  { carId: id, categoryId: Number(categoryId) },
                  {
                    ...onToast,
                    onSuccess: () => {
                      notify.success(t('common.saved'))
                      setCategoryOpen(false)
                    },
                  },
                )
              }}
            >
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <Select
          label={t('carsPage.category')}
          value={categoryId}
          options={(optionsQuery.data?.categories ?? []).map((row) => ({
            value: String(row.id),
            label: asText(row.name),
          }))}
          onChange={(event) => setCategoryId(event.target.value)}
        />
      </Modal>
      <Modal
        open={preview != null}
        onClose={() => setPreview(null)}
        title={preview?.title || t('carsPage.photo')}
        sizeClassName="max-w-3xl"
        bodyClassName="p-3 sm:p-4"
      >
        <SafeImage
          src={preview?.src}
          alt={preview?.title || ''}
          icon={ImageOff}
          size="xl"
          fit="contain"
          className="mx-auto h-[min(70svh,640px)] w-full rounded-xl bg-fog"
        />
      </Modal>
    </>
  )
}
