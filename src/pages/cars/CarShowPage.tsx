import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ImageOff, Minus, RefreshCw } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  DetailList,
  ErrorMessage,
  Modal,
  Notification,
  Panel,
  SafeImage,
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
  groupShowPath,
  routes,
  teacherPath,
} from '@/config'
import {
  useCarFormOptionsQuery,
  useCarQuery,
  useChangeCarCategoryMutation,
  useChangeCarTeacherMutation,
  useDisableCarMutation,
  useEnableCarMutation,
  useRecheckCarMspdMutation,
  useUnmergeCarTeacherMutation,
} from '@/features/cars'
import { gaiStatusOf } from '@/features/groups'
import { resolveFileUrl } from '@/features/lessons'
import { asFio, asText } from '@/lib/apiPage'
import { formatDate, fullNameOf } from '@/lib/format'
import { useSmartBack } from '@/hooks'
import type { CarDetail } from '@/types/cars'

function photoUrl(value?: string | null) {
  return value ? resolveFileUrl(value, PATH_PREFIX_FILE) : ''
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
  const [categoryId, setCategoryId] = useState('')

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

  const photos = [
    { key: 'main', src: photoUrl(data?.photo ?? data?.image), label: t('carsPage.photoMain') },
    { key: 'front', src: photoUrl(data?.front_photo), label: t('carsPage.photoFront') },
    { key: 'back', src: photoUrl(data?.back_photo), label: t('carsPage.photoBack') },
    { key: 'right', src: photoUrl(data?.right_photo), label: t('carsPage.photoRight') },
    { key: 'left', src: photoUrl(data?.left_photo), label: t('carsPage.photoLeft') },
    { key: 'pedal', src: photoUrl(data?.pedal_photo), label: t('carsPage.photoPedal') },
    { key: 'texFront', src: photoUrl(data?.tex_passport_front), label: t('carsPage.photoTexFront') },
    { key: 'texBack', src: photoUrl(data?.tex_passport_back), label: t('carsPage.photoTexBack') },
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
          <Button variant="outline" size="icon-sm" onClick={goBack}>
            <ArrowLeft className="size-3.5" aria-hidden />
          </Button>
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
                    [t('carsPage.model'), asText(data.model?.name ?? data.car_model?.name ?? data.name)],
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

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
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
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {photos.map((photo) => (
                      <div
                        key={photo.key}
                        className="overflow-hidden rounded-xl border border-mist/70 bg-fog"
                      >
                        <div className="aspect-square">
                          <SafeImage
                            src={photo.src}
                            alt={photo.label}
                            size="lg"
                            icon={ImageOff}
                            label={photo.src ? undefined : t('carsPage.noPhoto')}
                            className="size-full"
                          />
                        </div>
                        <p className="border-t border-mist/70 px-2 py-1 text-center text-[11px] text-muted">
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
                  <DetailList
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
                      { label: t('carsPage.model'), value: asText(data.model?.name ?? data.car_model?.name) },
                      { label: t('carsPage.yhx'), value: asText(data.yhx_department?.name) },
                      { label: t('carsPage.specialMarks'), value: data.special_marks },
                      { label: t('carsPage.mileage'), value: data.total_mileage },
                      { label: t('carsPage.comments'), value: data.comments },
                      { label: t('carsPage.type'), value: asText(data.type?.name) },
                      { label: t('carsPage.color'), value: asText(data.color?.name) },
                      { label: t('carsPage.teacher'), value: teacherName },
                      { label: t('carsPage.year'), value: data.year_of_manufacture },
                      { label: t('carsPage.fuel'), value: asText(data.fuel_type?.name) },
                      { label: t('carsPage.body'), value: data.body },
                      { label: t('carsPage.educationType'), value: asText(data.education_type?.name) },
                      { label: t('carsPage.engine'), value: data.engine_number },
                      { label: t('carsPage.enginePower'), value: data.engine_power },
                      { label: t('carsPage.fullWeight'), value: data.full_weight },
                      { label: t('carsPage.unloadedWeight'), value: data.unloaded_weight },
                      { label: t('carsPage.seats'), value: data.number_of_seats },
                      {
                        label: t('carsPage.oilChange'),
                        value: formatDate(data.last_oil_change_date, i18n.language),
                      },
                      {
                        label: t('carsPage.tireChange'),
                        value: formatDate(data.last_tire_change_date, i18n.language),
                      },
                    ]}
                  />
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
                      category: asText(data.car_category?.name),
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
                  <h3 className="mb-2 text-xs font-semibold uppercase text-muted">
                    {t('carsPage.assignedInstructor')}
                  </h3>
                  {data.teacher?.id ? (
                    <Link
                      to={teacherPath(data.teacher.id)}
                      className="mb-2 block text-sm font-semibold uppercase text-signal hover:underline"
                    >
                      {teacherName}
                    </Link>
                  ) : (
                    <p className="mb-2 text-sm text-rose">
                      {t('groupsPage.showPage.teacherNotAttached')}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={locked || !data.teacher?.id}
                      onClick={() => setDetachOpen(true)}
                    >
                      {t('common.delete')}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={locked}
                      onClick={() => {
                        setTeacherId(String(data.teacher_id ?? data.teacher?.id ?? ''))
                        setTeacherOpen(true)
                      }}
                    >
                      {t('carsPage.swap')}
                    </Button>
                  </div>
                </Panel>

                <Notification tone="warning">
                  <p className="font-semibold">{t('carsPage.teacherLockedTitle')}</p>
                  <ul className="mt-1 list-disc pl-4">
                    <li>{t('carsPage.teacherDetachHint')}</li>
                    <li>{t('carsPage.teacherSwapHint')}</li>
                  </ul>
                </Notification>
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
        title={t('carsPage.swap')}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setTeacherOpen(false)}>
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
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <Select
          label={t('carsPage.teacher')}
          value={teacherId}
          options={(optionsQuery.data?.teachers ?? []).map((row) => ({
            value: String(row.id),
            label: fullNameOf(row) ?? asText(row.name),
          }))}
          onChange={(event) => setTeacherId(event.target.value)}
        />
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
    </>
  )
}
