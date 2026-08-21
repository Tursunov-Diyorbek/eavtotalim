import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Building2,
  Car,
  Download,
  GraduationCap,
  ImageIcon,
  MapPin,
  ScanFace,
  Users,
  Video,
  Wallet,
  WifiOff,
} from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Badge,
  Button,
  DirectorDashboardSkeleton,
  Modal,
  Panel,
  SafeImage,
  Skeleton,
} from '@/components/ui'
import {
  PATH_PREFIX_FILE,
  PATH_PREFIX_FILE_HOST,
  TONE_CLASS,
  assignedLimitPath,
  eduTypeShortName,
  getRoleMeta,
  isDirectorProfileUnconfirmed,
  routes,
  sortEduTypes,
} from '@/config'
import { useAuth } from '@/features/auth'
import {
  useDailyPaymentsQuery,
  useDirectorCamerasQuery,
  useEnablePaymentMutation,
  useFaceControlWarningsQuery,
  useMarkFaceWarningSeenMutation,
  useStudentImageStatsQuery,
} from '@/features/dashboard'
import {
  cn,
  formatDateTime,
  formatNumber,
  fullNameOf,
  isFilled,
} from '@/lib'
import type {
  AutodromeCameraItem,
  DailyPaymentByType,
  FaceControlWarning,
} from '@/types'
import { TariffPlansModal } from './TariffPlansModal'

function fileUrl(
  path: string | null | undefined,
  base: string = PATH_PREFIX_FILE,
): string | null {
  if (!isFilled(path)) return null
  const value = String(path)
  if (/^https?:\/\//i.test(value) || value.startsWith('blob:')) return value
  return `${base.replace(/\/$/, '')}/${value.replace(/^\//, '')}`
}

function sumPayments(item: DailyPaymentByType): number {
  return (item.payments ?? []).reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0,
  )
}

function percentTone(p: number) {
  if (p >= 80) return 'text-teal'
  if (p >= 50) return 'text-signal'
  if (p >= 20) return 'text-amber'
  return 'text-rose'
}

function percentBar(p: number) {
  if (p >= 80) return 'bg-teal'
  if (p >= 50) return 'bg-signal'
  if (p >= 20) return 'bg-amber'
  return 'bg-rose'
}

function humanizeSeconds(
  sec: number | null | undefined,
  t: (k: string, opts?: Record<string, unknown>) => string,
) {
  if (sec == null) return null
  const s = Number(sec)
  if (!Number.isFinite(s) || s < 0) return null
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return t('dashboard.offlineForDays', { days: d, hours: h })
  if (h > 0) return t('dashboard.offlineForHours', { hours: h, minutes: m })
  if (m > 0) return t('dashboard.offlineForMinutes', { minutes: m })
  return t('dashboard.offlineForSeconds', { seconds: s })
}

function cameraMeta(
  c: AutodromeCameraItem,
  t: (k: string, opts?: Record<string, unknown>) => string,
) {
  const status = (c.status || '').toLowerCase()
  const online = status === 'online'
  const used = c.used_slots ?? 0
  const max = c.max_users_count
  const full = c.free_slots === 0 || (max != null && used >= max)
  const percent =
    c.usage_percent != null
      ? Math.round(c.usage_percent)
      : max
        ? Math.round((used / max) * 100)
        : 0
  const labels: Record<string, string> = {
    online: 'Online',
    offline: 'Offline',
    degraded: t('dashboard.camDegraded'),
    syncing: t('dashboard.camSyncing'),
    idle: t('dashboard.camIdle'),
    never_synced: t('dashboard.camNever'),
  }
  let tone: 'ok' | 'warn' | 'bad' = 'warn'
  if (online) tone = 'ok'
  if (status === 'offline' || status === 'never_synced') tone = 'bad'
  if (online && full) tone = 'warn'
  return {
    label: labels[status] || status || t('dashboard.unknown'),
    online,
    used,
    max,
    full,
    percent,
    tone,
    offlineText: humanizeSeconds(c.offline_seconds, t),
  }
}

function MetaPill({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-lg border border-dashed border-mist/90 bg-fog/40 px-2.5 py-2">
      <p className="truncate text-[13px] font-semibold text-deep">{value || '—'}</p>
      <p className="text-[10px] text-muted">{label}</p>
    </div>
  )
}

function KpiCard({
  icon,
  iconClass,
  title,
  value,
  extra,
}: {
  icon: ReactNode
  iconClass: string
  title: string
  value: ReactNode
  extra?: ReactNode
}) {
  return (
    <Panel padding="sm">
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            iconClass,
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-muted">{title}</p>
          <p className="font-display text-xl leading-tight font-semibold text-deep">
            {value}
          </p>
          {extra}
        </div>
      </div>
    </Panel>
  )
}

export function DirectorDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { me, user, loading } = useAuth()
  const bootLoading = loading && !me

  const profession = me?.profession ?? null
  const org = profession?.organization ?? null
  const report = org?.report
  const eduTypes = sortEduTypes(org?.report_by_edu_type ?? [])
  const roleMeta = getRoleMeta(user?.role)
  const displayName =
    fullNameOf(profession) ??
    (loading && !user ? t('common.loading') : (user?.username ?? '—'))
  const avatarUrl =
    fileUrl(profession?.image, PATH_PREFIX_FILE_HOST) ??
    fileUrl(user?.image, PATH_PREFIX_FILE_HOST)
  const isOnline = user?.online === 1
  const spa = org?.study_platform_agreement
  const examAgr = org?.examination_area_agreement
  const hasFaceId = Boolean(spa?.face_control?.name)
  const hasStudyGuide = Boolean(spa?.study_guide?.name)
  const hasMonitoring = spa?.monitoring === 1
  const hasAutodrome = examAgr != null
  const licenseHref = fileUrl(org?.license_file) ?? fileUrl(org?.license?.file)
  const agreementName = org?.last_agreement?.agreement_type?.name_uz

  const allowedCat = eduTypes.filter((v) => v.access_organization != null).length
  const blockedCat = eduTypes.length - allowedCat
  const faceOptional =
    eduTypes.filter((v) => v.access_organization != null).length > 0 &&
    eduTypes
      .filter((v) => v.access_organization != null)
      .every((v) => v.edu_type_id === 1 || v.edu_type_id === 2)

  const [tariffOpen, setTariffOpen] = useState(false)
  const [priceOn, setPriceOn] = useState(org?.enable_payment === 1)
  useEffect(() => {
    setPriceOn(org?.enable_payment === 1)
  }, [org?.enable_payment])

  const priceMutation = useEnablePaymentMutation()
  const { data: payments = [], isLoading: payLoading } = useDailyPaymentsQuery()
  const { data: imageStats, isLoading: imageLoading } = useStudentImageStatsQuery()
  const { data: warnings } = useFaceControlWarningsQuery()
  const markSeen = useMarkFaceWarningSeenMutation()
  const { data: cameraRows = [], isLoading: camLoading } =
    useDirectorCamerasQuery(hasAutodrome)

  const unseen = warnings?.unseen_warnings ?? []
  const [warnOpen, setWarnOpen] = useState(false)
  useEffect(() => {
    if ((warnings?.unseen_warnings_count ?? 0) > 0 && unseen.length > 0) {
      setWarnOpen(true)
    }
  }, [warnings?.unseen_warnings_count, unseen.length])

  const imageTotal = imageStats?.total_students ?? 0
  const imageWith = imageStats?.with_image ?? 0
  const imageWithout = imageStats?.without_image ?? 0
  const imagePercent = Number(imageStats?.percent_uploaded ?? 0)

  const camTotals = useMemo(() => {
    let online = 0
    let offline = 0
    let full = 0
    for (const row of cameraRows) {
      for (const cam of row.cameras) {
        const a = cameraMeta(cam, t)
        if (a.online) online += 1
        if (a.tone === 'bad') offline += 1
        if (a.full) full += 1
      }
    }
    return { online, offline, full }
  }, [cameraRows, t])

  const organizationId =
    me?.organization_id ?? profession?.organization_id ?? org?.id ?? null

  const actionLinks = [
    { to: routes.studentAdd, label: t('dashboard.addStudent') },
    { to: routes.groups, label: t('dashboard.goGroups') },
    { to: routes.teachers, label: t('dashboard.goTeachers') },
    { to: routes.cars, label: t('dashboard.goCars') },
    {
      to: routes.templateViewStatistic,
      label: t('dashboard.testStatus'),
    },
    {
      to: routes.contentViewStatistic,
      label: t('dashboard.topicMastery'),
    },
    organizationId
      ? {
          to: assignedLimitPath(organizationId),
          label: t('dashboard.assignedLimit'),
        }
      : null,
  ].filter(Boolean) as Array<{ to: string; label: string }>

  const togglePrice = () => {
    const next: 0 | 1 = priceOn ? 0 : 1
    priceMutation.mutate(next, {
      onSuccess: (value) => setPriceOn(value === 1),
    })
  }

  if (bootLoading) {
    return (
      <>
        <Header
          title={t('dashboard.title')}
          description={t('dashboard.directorDescription')}
        />
        <main className="flex-1 p-3 sm:p-4">
          <DirectorDashboardSkeleton />
        </main>
      </>
    )
  }

  return (
    <>
      <Header
        title={t('dashboard.title')}
        description={t('dashboard.directorDescription')}
      />

      <main className="flex-1 space-y-2.5 p-3 sm:p-4">
        <Panel>
          <div className="grid gap-3 p-3 sm:grid-cols-[104px_minmax(0,1fr)] sm:p-4">
            <div className="relative">
              <SafeImage
                src={avatarUrl}
                size="lg"
                className="h-full min-h-30 w-full rounded-xl ring-1 ring-mist/80"
              />
              <span
                className={cn(
                  'absolute right-1.5 bottom-1.5 size-2.5 rounded-full border-2 border-white',
                  isOnline ? 'bg-teal' : 'bg-mist',
                )}
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display text-[16px] leading-snug font-semibold text-deep uppercase">
                    {displayName}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                        TONE_CLASS[roleMeta.tone],
                      )}
                    >
                      {t(roleMeta.labelKey)}
                    </span>
                    <Badge tone={isOnline ? 'teal' : 'neutral'}>
                      {isOnline ? t('dashboard.online') : t('dashboard.offline')}
                    </Badge>
                    {agreementName ? (
                      <Badge tone="amber">{agreementName}</Badge>
                    ) : null}
                    {isDirectorProfileUnconfirmed(profession?.mspd_status) ? (
                      <Badge tone="rose">{t('directorProfile.unconfirmed')}</Badge>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={
                      isDirectorProfileUnconfirmed(profession?.mspd_status)
                        ? 'danger'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => navigate(routes.directorEditData)}
                  >
                    {isDirectorProfileUnconfirmed(profession?.mspd_status)
                      ? t('directorProfile.unconfirmed')
                      : t('directorProfile.edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTariffOpen(true)}
                  >
                    {t('dashboard.changeTariff')}
                  </Button>
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Badge tone={hasFaceId ? 'teal' : 'rose'}>
                  <ScanFace className="size-3" aria-hidden />
                  {t('dashboard.faceId')}:{' '}
                  {hasFaceId
                    ? t('dashboard.available')
                    : t('dashboard.unavailable')}
                  {hasFaceId && faceOptional
                    ? ` (${t('dashboard.notRequired')})`
                    : ''}
                </Badge>
                <Badge tone={hasStudyGuide ? 'teal' : 'rose'}>
                  {t('dashboard.singleTest')}:{' '}
                  {hasStudyGuide
                    ? t('dashboard.available')
                    : t('dashboard.unavailable')}
                </Badge>
                <Badge tone={hasStudyGuide ? 'teal' : 'rose'}>
                  {t('dashboard.euq')}:{' '}
                  {hasStudyGuide
                    ? t('dashboard.available')
                    : t('dashboard.unavailable')}
                </Badge>
                <Badge tone={hasAutodrome ? 'teal' : 'rose'}>
                  {t('dashboard.autodromeContract')}:{' '}
                  {hasAutodrome
                    ? t('dashboard.available')
                    : t('dashboard.unavailable')}
                </Badge>
                <Badge tone={hasMonitoring ? 'teal' : 'rose'}>
                  {t('dashboard.monitoring')}:{' '}
                  {hasMonitoring
                    ? t('dashboard.available')
                    : t('dashboard.unavailable')}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
                <MetaPill
                  label={t('dashboard.inn')}
                  value={isFilled(org?.inn) ? org?.inn : t('dashboard.notSet')}
                />
                <MetaPill
                  label={t('dashboard.phone')}
                  value={
                    isFilled(profession?.phone)
                      ? profession?.phone
                      : t('dashboard.notSet')
                  }
                />
                <MetaPill
                  label={t('dashboard.accountNumber')}
                  value={isFilled(org?.hr) ? org?.hr : t('dashboard.notSet')}
                />
                <MetaPill
                  label={t('dashboard.mfo')}
                  value={isFilled(org?.mfo) ? org?.mfo : t('dashboard.notSet')}
                />
                <MetaPill
                  label={t('dashboard.licenseFile')}
                  value={
                    licenseHref ? (
                      <a
                        href={licenseHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-signal"
                      >
                        <Download className="size-3.5" aria-hidden />
                        {t('dashboard.download')}
                      </a>
                    ) : (
                      t('dashboard.notSet')
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-mist/60 bg-fog/30 px-3 py-2.5 text-[12px] sm:px-4">
            <p className="inline-flex min-w-0 items-center gap-1.5">
              <Building2 className="size-3.5 shrink-0 text-signal" aria-hidden />
              <span className="text-muted">{t('dashboard.legalName')}:</span>
              <span className="truncate font-semibold text-deep">
                {org?.name || '—'}
              </span>
            </p>
            <p className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0 text-signal" aria-hidden />
              <span className="text-muted">{t('dashboard.legalAddress')}:</span>
              <span className="truncate font-medium text-deep">
                {isFilled(org?.y_address)
                  ? org?.y_address
                  : org?.address || '—'}
              </span>
            </p>
          </div>
        </Panel>

        {actionLinks.length > 0 ? (
          <Panel padding="sm">
            <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
              {actionLinks.map((item) => (
                <Button
                  key={item.to}
                  variant="soft"
                  size="sm"
                  className="h-auto min-h-8 w-full whitespace-normal py-1.5 text-center"
                  onClick={() => navigate(item.to)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </Panel>
        ) : null}

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={<Users className="size-4" aria-hidden />}
            iconClass="bg-signal-soft text-signal"
            title={t('dashboard.staff')}
            value={formatNumber(report?.teachers_count)}
            extra={
              <p className="text-[11px] text-muted">
                {t('dashboard.allTeachers')}
              </p>
            }
          />
          <KpiCard
            icon={<GraduationCap className="size-4" aria-hidden />}
            iconClass="bg-violet-soft text-violet"
            title={t('dashboard.students')}
            value={formatNumber(report?.students_count)}
            extra={
              <p className="text-[11px] text-muted">
                {t('dashboard.activeCount', {
                  count: formatNumber(report?.active_students_count),
                })}
              </p>
            }
          />
          <KpiCard
            icon={<Users className="size-4" aria-hidden />}
            iconClass="bg-teal-soft text-teal"
            title={t('dashboard.groups')}
            value={formatNumber(report?.groups_count)}
            extra={
              <p className="text-[11px] text-muted">
                {t('dashboard.activeCount', {
                  count: formatNumber(report?.active_groups_count),
                })}
              </p>
            }
          />
          <KpiCard
            icon={<Car className="size-4" aria-hidden />}
            iconClass="bg-amber-soft text-amber"
            title={t('dashboard.cars')}
            value={formatNumber(report?.cars_count)}
            extra={
              <p className="text-[11px] text-muted">
                {t('dashboard.gpsCars', {
                  count: formatNumber(report?.count_car_with_gps),
                })}
              </p>
            }
          />
        </div>

        <div className="grid gap-2.5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Panel padding="sm">
            <p className="mb-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-deep">
              <ImageIcon className="size-3.5 text-signal" aria-hidden />
              {t('dashboard.imageStatsTitle')}
            </p>
            {imageLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-2 w-full" rounded="full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[11px] text-muted">{t('dashboard.imageTotal')}</p>
                    <p className="font-display text-lg font-semibold text-signal">
                      {formatNumber(imageTotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted">{t('dashboard.withImage')}</p>
                    <p className="font-display text-lg font-semibold text-teal">
                      {formatNumber(imageWith)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted">{t('dashboard.withoutImage')}</p>
                    <p className="font-display text-lg font-semibold text-rose">
                      {formatNumber(imageWithout)}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="text-muted">{t('dashboard.uploadPercent')}</span>
                    <span className={cn('font-semibold', percentTone(imagePercent))}>
                      {imagePercent}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-fog">
                    <div
                      className={cn('h-full rounded-full', percentBar(imagePercent))}
                      style={{ width: `${Math.min(100, Math.max(0, imagePercent))}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </Panel>

          <Panel padding="sm">
            <p className="mb-2.5 text-[12px] font-semibold text-deep">
              {t('dashboard.eduTypesTitle')}
            </p>
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              <Badge tone="signal">
                {t('dashboard.allCategories')}: {eduTypes.length}
              </Badge>
              <Badge tone="teal">
                {t('dashboard.allowedCategories')}: {allowedCat}
              </Badge>
              <Badge tone="rose">
                {t('dashboard.blockedCategories')}: {blockedCat}
              </Badge>
            </div>
            {eduTypes.length === 0 ? (
              <p className="py-4 text-center text-[12px] text-muted">
                {t('common.empty')}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-4">
                {eduTypes.map((item) => {
                  const on = item.access_organization != null
                  return (
                    <div
                      key={item.edu_type_id}
                      className={cn(
                        'rounded-lg border px-2.5 py-2',
                        on
                          ? 'border-teal/25 bg-teal-soft/40'
                          : 'border-mist/80 bg-fog/50 opacity-70',
                      )}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[12px] font-bold text-deep">
                          {eduTypeShortName(item.edu_type_id)}
                        </span>
                        <span className="text-[12px] font-semibold text-signal">
                          {formatNumber(item.students_count)}
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between text-[10px]">
                        <span className="text-teal">
                          {formatNumber(item.active_students_count)}
                        </span>
                        <span className="text-muted">
                          {formatNumber(item.ended_students_count)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>
        </div>

        <Panel padding="sm">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[12px] font-semibold text-deep">
              <Wallet className="size-3.5 text-signal" aria-hidden />
              {t('dashboard.dailyIncome')}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted">
                {t('dashboard.showTuition')}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={priceOn}
                disabled={priceMutation.isPending}
                onClick={togglePrice}
                className={cn(
                  'relative h-6 w-10 rounded-full transition',
                  priceOn ? 'bg-teal' : 'bg-mist',
                  priceMutation.isPending && 'opacity-60',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-[left]',
                    priceOn ? 'left-[1.15rem]' : 'left-0.5',
                  )}
                />
              </button>
            </div>
          </div>
          {payLoading ? (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-16 w-full" rounded="lg" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <p className="py-4 text-center text-[12px] text-muted">
              {t('dashboard.noPayments')}
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {payments.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="rounded-lg border border-mist/70 bg-fog/40 px-3 py-2.5"
                >
                  <p className="flex items-center gap-1.5 font-display text-[15px] font-semibold text-deep">
                    <Wallet className="size-3.5 text-signal" aria-hidden />
                    {formatNumber(sumPayments(item))} {t('dashboard.sum')}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted">
                    {item.name || '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {hasAutodrome ? (
          <Panel padding="sm">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-deep">
                <Video className="size-3.5 text-signal" aria-hidden />
                {t('dashboard.autodromeCameras')}
              </p>
              {!camLoading ? (
                <div className="flex flex-wrap gap-1">
                  <Badge tone="teal">
                    {camTotals.online} online
                  </Badge>
                  {camTotals.offline > 0 ? (
                    <Badge tone="rose">
                      {camTotals.offline} offline
                    </Badge>
                  ) : null}
                  {camTotals.full > 0 ? (
                    <Badge tone="amber">
                      {camTotals.full} {t('dashboard.camFull')}
                    </Badge>
                  ) : null}
                </div>
              ) : null}
            </div>
            {camLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : cameraRows.length === 0 ? (
              <p className="py-4 text-center text-[12px] text-muted">
                {t('dashboard.noAutodrome')}
              </p>
            ) : (
              <div className="space-y-3">
                {cameraRows.map((row) => (
                  <div key={row.id}>
                    <p className="mb-1.5 text-[12px] font-semibold text-deep">
                      {row.name || '—'}
                    </p>
                    {row.cameras.length === 0 ? (
                      <p className="text-[12px] text-muted">
                        {t('dashboard.noCameras')}
                      </p>
                    ) : (
                      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                        {row.cameras.map((cam, i) => {
                          const a = cameraMeta(cam, t)
                          return (
                            <div
                              key={cam.id ?? `${cam.ip_address}-${i}`}
                              className={cn(
                                'rounded-lg border px-2.5 py-2',
                                a.tone === 'ok' && 'border-teal/30 bg-teal-soft/30',
                                a.tone === 'warn' && 'border-amber/30 bg-amber-soft/40',
                                a.tone === 'bad' && 'border-rose/30 bg-rose-soft/40',
                              )}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[11px] font-semibold text-deep">
                                  {a.label}
                                </span>
                                <span className="truncate text-[11px] text-muted">
                                  {cam.ip_address || '—'}
                                </span>
                              </div>
                              <div className="mt-1.5">
                                <div className="mb-0.5 flex justify-between text-[10px] text-muted">
                                  <span>{t('dashboard.camCapacity')}</span>
                                  <span>
                                    {a.used}
                                    {a.max != null ? ` / ${a.max}` : ''}
                                  </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-white/80">
                                  <div
                                    className={cn(
                                      'h-full rounded-full',
                                      a.full ? 'bg-rose' : 'bg-teal',
                                    )}
                                    style={{
                                      width: `${Math.min(100, Math.max(0, a.percent))}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              {a.full ? (
                                <p className="mt-1 text-[10px] text-amber">
                                  {t('dashboard.camFullHint')}
                                </p>
                              ) : null}
                              {a.tone === 'bad' ? (
                                <p className="mt-1 flex items-center gap-1 text-[10px] text-rose">
                                  <WifiOff className="size-3" aria-hidden />
                                  {a.offlineText || t('dashboard.camNeedNet')}
                                </p>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        ) : null}
      </main>

      <FaceControlModal
        open={warnOpen}
        warnings={unseen}
        loading={markSeen.isPending}
        onClose={() => setWarnOpen(false)}
        onMark={(id) => markSeen.mutate(id)}
      />
      <TariffPlansModal
        open={tariffOpen}
        onClose={() => setTariffOpen(false)}
      />
    </>
  )
}

function FaceControlModal({
  open,
  warnings,
  loading,
  onClose,
  onMark,
}: {
  open: boolean
  warnings: FaceControlWarning[]
  loading: boolean
  onClose: () => void
  onMark: (id: number) => void
}) {
  const { t, i18n } = useTranslation()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('dashboard.faceWarningsTitle')}
      sizeClassName="max-w-xl"
    >
      {warnings.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-muted">
          {t('dashboard.noWarnings')}
        </p>
      ) : (
        <div className="space-y-2.5">
          {warnings.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-amber/25 bg-amber-soft/30 p-3"
            >
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <Badge tone="rose">{t('dashboard.warningNew')}</Badge>
                <span className="text-[11px] text-muted">
                  {formatDateTime(item.created_at, i18n.language) || '—'}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-[13px] text-deep">
                {item.text}
              </p>
              {item.images && item.images.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.images.map((src) => {
                    const href = fileUrl(src)
                    if (!href) return null
                    return (
                      <a key={src} href={href} target="_blank" rel="noreferrer">
                        <SafeImage
                          src={href}
                          size="md"
                          className="size-20 rounded-lg ring-1 ring-mist/80"
                        />
                      </a>
                    )
                  })}
                </div>
              ) : null}
              <div className="mt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  loading={loading}
                  onClick={() => onMark(item.id)}
                >
                  {t('dashboard.markRead')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
