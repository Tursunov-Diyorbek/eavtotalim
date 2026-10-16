import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BookOpenCheck,
  Building2,
  Car,
  ChartColumn,
  ClipboardList,
  Download,
  FileText,
  Gauge,
  GraduationCap,
  ImageIcon,
  List,
  MapPin,
  ScanFace,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Badge,
  Button,
  DirectorDashboardSkeleton,
  Modal,
  Panel,
  Popover,
  PopoverRow,
  SafeImage,
  Skeleton,
  Tooltip,
} from '@/components/ui'
import {
  PATH_PREFIX_FILE,
  PATH_PREFIX_FILE_HOST,
  assignedLimitPath,
  eduTypeShortName,
  isDirectorProfileUnconfirmed,
  routes,
  sortEduTypes,
} from '@/config'
import { useAuth } from '@/features/auth'
import {
  useDailyPaymentsQuery,
  useEnablePaymentMutation,
  useFaceControlWarningsQuery,
  useGaiRatingQuery,
  useMarkFaceWarningSeenMutation,
  useStudentImageStatsQuery,
} from '@/features/dashboard'
import {
  cn,
  formatDate,
  formatDateTime,
  formatNumber,
  fullNameOf,
  isFilled,
} from '@/lib'
import type {
  DailyPaymentByType,
  FaceControlWarning,
} from '@/types'
import { DirectorAutodromeStatusCard } from './DirectorAutodromeStatusCard'
import { formatBadgeScore, GaiRatingModal } from './GaiRatingModal'
import { StudentImageStatsModal } from './StudentImageStatsModal'
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

function percentBar(p: number) {
  if (p >= 80) return 'bg-teal'
  if (p >= 50) return 'bg-signal'
  if (p >= 20) return 'bg-amber'
  return 'bg-rose'
}

function percentChip(p: number) {
  if (p >= 80) return 'bg-teal-soft text-teal'
  if (p >= 50) return 'bg-signal-soft text-signal'
  if (p >= 20) return 'bg-amber-soft text-amber'
  return 'bg-rose-soft text-rose'
}

/** Raqamli kichik plitka — sarlavha + katta son. */
function StatTile({
  label,
  value,
  className,
  valueClass,
}: {
  label: string
  value: string
  className: string
  valueClass: string
}) {
  return (
    <div className={cn('rounded-lg border px-2 py-1.5', className)}>
      <p className="truncate text-[10px] font-semibold tracking-wide text-muted uppercase">
        {label}
      </p>
      <p className={cn('font-display text-xl font-bold', valueClass)}>{value}</p>
    </div>
  )
}

/** Karta sarlavhasi — rangli ikonka + matn. */
function CardTitle({
  icon: Icon,
  iconClass,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  iconClass: string
  children: ReactNode
}) {
  return (
    <p className="flex min-w-0 items-center gap-2 text-[12px] font-semibold text-deep">
      <span
        className={cn(
          'inline-flex size-6 shrink-0 items-center justify-center rounded-lg',
          iconClass,
        )}
      >
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className="truncate">{children}</span>
    </p>
  )
}

function MetaPill({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-lg border border-dashed border-mist/90 bg-fog/40 px-2.5 py-1.5">
      <p className="truncate text-[12px] font-semibold text-deep">{value || '—'}</p>
      <p className="text-[10px] text-muted">{label}</p>
    </div>
  )
}

function KpiCard({
  icon,
  iconClass,
  cardClass,
  title,
  value,
  extra,
}: {
  icon: ReactNode
  iconClass: string
  cardClass?: string
  title: string
  value: ReactNode
  extra?: ReactNode
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-mist/60 bg-white px-2.5 py-2',
        cardClass,
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-lg',
            iconClass,
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-muted">{title}</p>
          <div className="flex min-w-0 items-baseline gap-1.5">
            <p className="font-display text-lg leading-none font-semibold text-deep">
              {value}
            </p>
            {extra ? (
              <span className="truncate text-[12px] font-medium text-ink/70">
                {extra}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DirectorDashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { me, user, loading } = useAuth()
  const bootLoading = loading && !me

  const profession = me?.profession ?? null
  const org = profession?.organization ?? null
  const report = org?.report
  const eduTypes = sortEduTypes(org?.report_by_edu_type ?? [])
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
  const agreementFileHref = fileUrl(examAgr?.file)
  const licenseHref = fileUrl(org?.license_file) ?? fileUrl(org?.license?.file)

  const allowedCat = eduTypes.filter((v) => v.access_organization != null).length
  const blockedCat = eduTypes.length - allowedCat
  const faceOptional =
    eduTypes.filter((v) => v.access_organization != null).length > 0 &&
    eduTypes
      .filter((v) => v.access_organization != null)
      .every((v) => v.edu_type_id === 1 || v.edu_type_id === 2)

  const ratingYear = new Date().getFullYear()
  const currentRatingPeriod: 1 | 2 = new Date().getMonth() < 6 ? 1 : 2
  const [ratingOpen, setRatingOpen] = useState(false)
  const [ratingPeriod, setRatingPeriod] = useState<1 | 2>(currentRatingPeriod)
  const ratingQuery = useGaiRatingQuery(ratingYear, currentRatingPeriod)
  const rating = ratingQuery.data
  const [tariffOpen, setTariffOpen] = useState(false)
  const [imageGroupsOpen, setImageGroupsOpen] = useState(false)
  const [priceOn, setPriceOn] = useState(org?.enable_payment === 1)
  useEffect(() => {
    setPriceOn(org?.enable_payment === 1)
  }, [org?.enable_payment])

  const priceMutation = useEnablePaymentMutation()
  const { data: payments = [], isLoading: payLoading } = useDailyPaymentsQuery()
  const { data: imageStats, isLoading: imageLoading } = useStudentImageStatsQuery()
  const { data: warnings } = useFaceControlWarningsQuery()
  const markSeen = useMarkFaceWarningSeenMutation()

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
  const paymentsTotal = payments.reduce((sum, item) => sum + sumPayments(item), 0)

  const organizationId =
    me?.organization_id ?? profession?.organization_id ?? org?.id ?? null

  type ActionLink = {
    to: string
    label: string
    icon: ComponentType<{ className?: string }>
    tone: string
    iconTone: string
  }

  const actionLinks: ActionLink[] = [
    {
      to: routes.groups,
      label: t('dashboard.goGroups'),
      icon: Users,
      tone: 'border-signal/15 bg-signal-soft/50 hover:border-signal/30 hover:bg-signal-soft',
      iconTone: 'bg-white/80 text-signal ring-signal/10 group-hover:bg-signal group-hover:text-white',
    },
    {
      to: routes.teachers,
      label: t('dashboard.goTeachers'),
      icon: GraduationCap,
      tone: 'border-violet/15 bg-violet-soft/60 hover:border-violet/30 hover:bg-violet-soft',
      iconTone: 'bg-white/80 text-violet ring-violet/10 group-hover:bg-violet group-hover:text-white',
    },
    {
      to: routes.cars,
      label: t('dashboard.goCars'),
      icon: Car,
      tone: 'border-amber/15 bg-amber-soft/60 hover:border-amber/30 hover:bg-amber-soft',
      iconTone: 'bg-white/80 text-amber ring-amber/10 group-hover:bg-amber group-hover:text-white',
    },
    {
      to: routes.templateViewStatistic,
      label: t('dashboard.testStatus'),
      icon: ClipboardList,
      tone: 'border-indigo/15 bg-indigo-soft/60 hover:border-indigo/30 hover:bg-indigo-soft',
      iconTone: 'bg-white/80 text-indigo ring-indigo/10 group-hover:bg-indigo group-hover:text-white',
    },
    {
      to: routes.contentViewStatistic,
      label: t('dashboard.topicMastery'),
      icon: BookOpenCheck,
      tone: 'border-teal/15 bg-teal-soft/60 hover:border-teal/30 hover:bg-teal-soft',
      iconTone: 'bg-white/80 text-teal ring-teal/10 group-hover:bg-teal group-hover:text-white',
    },
    ...(organizationId
      ? [
          {
            to: assignedLimitPath(organizationId),
            label: t('dashboard.assignedLimit'),
            icon: Gauge,
            tone: 'border-rose/15 bg-rose-soft/55 hover:border-rose/30 hover:bg-rose-soft',
            iconTone:
              'bg-white/80 text-rose ring-rose/10 group-hover:bg-rose group-hover:text-white',
          },
        ]
      : []),
  ]

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
          <div className="grid gap-2.5 p-3 sm:grid-cols-[80px_minmax(0,1fr)]">
            <div className="relative mx-auto w-20 sm:mx-0 sm:h-full sm:w-full sm:min-h-20">
              <SafeImage
                src={avatarUrl}
                size="lg"
                className="size-20 rounded-xl ring-1 ring-mist/80 sm:size-full sm:min-h-20"
              />
              <span
                className={cn(
                  'absolute right-1.5 bottom-1.5 z-10 size-2.5 rounded-full border-2 border-white shadow-sm',
                  isOnline ? 'bg-teal' : 'bg-deep/35',
                )}
              />
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display text-[15px] leading-snug font-semibold text-deep uppercase">
                    {displayName}
                  </h3>
                  {isDirectorProfileUnconfirmed(profession?.mspd_status) ? (
                    <div className="mt-1">
                      <Badge tone="rose">{t('directorProfile.unconfirmed')}</Badge>
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <Button
                    variant={
                      isDirectorProfileUnconfirmed(profession?.mspd_status)
                        ? 'danger'
                        : 'outline'
                    }
                    size="sm"
                    className="h-7 px-2.5 text-[12px]"
                    onClick={() => navigate(routes.directorEditData)}
                  >
                    {isDirectorProfileUnconfirmed(profession?.mspd_status)
                      ? t('directorProfile.unconfirmed')
                      : t('directorProfile.edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-[12px]"
                    onClick={() => setTariffOpen(true)}
                  >
                    {t('dashboard.changeTariff')}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {rating ? (
                  <>
                    <Tooltip content={t('dashboard.viewRating')}>
                      <Button
                        variant="ghost"
                        size="inline"
                        className="!rounded-md !bg-teal-soft !px-1.5 !py-0.5 !text-[11px] !font-semibold !text-teal"
                        onClick={() => {
                          setRatingPeriod(currentRatingPeriod)
                          setRatingOpen(true)
                        }}
                      >
                        <Trophy className="size-3" aria-hidden />
                        {t('dashboard.scorePoints', {
                          score: formatBadgeScore(rating.total_score),
                        })}
                      </Button>
                    </Tooltip>
                    {rating.rank ? (
                      <Tooltip content={t('dashboard.viewRating')}>
                        <Button
                          variant="ghost"
                          size="inline"
                          className="!rounded-md !bg-signal-soft !px-1.5 !py-0.5 !text-[11px] !font-semibold !text-signal"
                          onClick={() => {
                            setRatingPeriod(currentRatingPeriod)
                            setRatingOpen(true)
                          }}
                        >
                          <ChartColumn className="size-3" aria-hidden />
                          {t('dashboard.rankPlace', { rank: rating.rank })}
                        </Button>
                      </Tooltip>
                    ) : null}
                  </>
                ) : null}
                {hasFaceId ? (
                  <Popover
                    title={t('dashboard.faceIdInfo')}
                    content={
                      <>
                        <PopoverRow label={t('dashboard.infoName')}>
                          <span className="font-semibold">
                            {spa?.face_control?.name || '—'}
                          </span>
                        </PopoverRow>
                        <PopoverRow label={t('dashboard.infoPhone')}>
                          <span className="font-semibold">
                            {isFilled(spa?.face_control?.phone)
                              ? spa?.face_control?.phone
                              : t('dashboard.unavailable')}
                          </span>
                        </PopoverRow>
                      </>
                    }
                  >
                    <Badge tone="teal">
                      <ScanFace className="size-3" aria-hidden />
                      {t('dashboard.faceId')}: {t('dashboard.available')}
                      {faceOptional ? ` (${t('dashboard.notRequired')})` : ''}
                    </Badge>
                  </Popover>
                ) : (
                  <Badge tone="rose">
                    <ScanFace className="size-3" aria-hidden />
                    {t('dashboard.faceId')}: {t('dashboard.unavailable')}
                  </Badge>
                )}
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
                {hasAutodrome ? (
                  <Popover
                    title={t('dashboard.agreementInfo')}
                    content={
                      <>
                        <PopoverRow label={t('dashboard.infoName')}>
                          <span className="font-semibold">
                            {examAgr?.autodrome?.name || '—'}
                          </span>
                        </PopoverRow>
                        <PopoverRow label={t('dashboard.infoStatus')}>
                          <span className="font-semibold text-teal">
                            {examAgr?.organization_autodrome_agreement_status
                              ?.id === 9
                              ? t('dashboard.agreementApproved')
                              : examAgr
                                  ?.organization_autodrome_agreement_status
                                  ?.title || '—'}
                          </span>
                        </PopoverRow>
                        <PopoverRow label={t('dashboard.infoStartDate')}>
                          <span className="font-semibold">
                            {formatDate(examAgr?.start_date, i18n.language) ||
                              '—'}
                          </span>
                        </PopoverRow>
                        <PopoverRow label={t('dashboard.infoEndDate')}>
                          <span className="font-semibold">
                            {formatDate(examAgr?.end_date, i18n.language) || '—'}
                          </span>
                        </PopoverRow>
                        {agreementFileHref ? (
                          <a
                            href={agreementFileHref}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 flex items-center gap-1.5 rounded-lg border border-dashed border-mist px-2 py-1.5 text-[12px] font-semibold text-signal hover:bg-fog"
                          >
                            <FileText className="size-3.5" aria-hidden />
                            {t('dashboard.agreementFile')}
                          </a>
                        ) : null}
                      </>
                    }
                  >
                    <Badge tone="teal">
                      {t('dashboard.autodromeContract')}:{' '}
                      {t('dashboard.available')}
                    </Badge>
                  </Popover>
                ) : (
                  <Badge tone="rose">
                    {t('dashboard.autodromeContract')}:{' '}
                    {t('dashboard.unavailable')}
                  </Badge>
                )}
                <Badge tone={hasMonitoring ? 'teal' : 'rose'}>
                  {t('dashboard.monitoring')}:{' '}
                  {hasMonitoring
                    ? t('dashboard.available')
                    : t('dashboard.unavailable')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
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

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-mist/60 bg-fog/30 px-3 py-2 text-[12px] sm:px-4">
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
          <div className="grid grid-cols-3 gap-1.5 xl:grid-cols-6">
            {actionLinks.map(({ to, label, icon: Icon, tone, iconTone }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'group flex min-h-9 items-center gap-2 rounded-xl border px-2 py-1.5 text-left transition',
                  'hover:shadow-[0_3px_10px_rgba(15,36,48,0.06)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/25',
                  tone,
                )}
              >
                <span
                  className={cn(
                    'inline-flex size-7 shrink-0 items-center justify-center rounded-lg ring-1 transition',
                    iconTone,
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 truncate text-[11px] font-semibold leading-snug text-deep">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-1.5 xl:grid-cols-4">
          <KpiCard
            icon={<Users className="size-3.5" aria-hidden />}
            iconClass="bg-signal-soft text-signal"
            cardClass="border-signal/10 bg-signal-soft/25"
            title={t('dashboard.staff')}
            value={formatNumber(report?.teachers_count)}
            extra={t('dashboard.allTeachers')}
          />
          <KpiCard
            icon={<GraduationCap className="size-3.5" aria-hidden />}
            iconClass="bg-violet-soft text-violet"
            cardClass="border-violet/10 bg-violet-soft/30"
            title={t('dashboard.students')}
            value={formatNumber(report?.students_count)}
            extra={t('dashboard.activeCount', {
              count: formatNumber(report?.active_students_count),
            })}
          />
          <KpiCard
            icon={<Users className="size-3.5" aria-hidden />}
            iconClass="bg-teal-soft text-teal"
            cardClass="border-teal/10 bg-teal-soft/30"
            title={t('dashboard.groups')}
            value={formatNumber(report?.groups_count)}
            extra={t('dashboard.activeCount', {
              count: formatNumber(report?.active_groups_count),
            })}
          />
          <KpiCard
            icon={<Car className="size-3.5" aria-hidden />}
            iconClass="bg-amber-soft text-amber"
            cardClass="border-amber/10 bg-amber-soft/35"
            title={t('dashboard.cars')}
            value={formatNumber(report?.cars_count)}
            extra={t('dashboard.gpsCars', {
              count: formatNumber(report?.count_car_with_gps),
            })}
          />
        </div>

        <DirectorAutodromeStatusCard enabled={hasAutodrome} />

        <div className="grid items-stretch gap-2.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex h-full flex-col gap-2.5">
            <Panel padding="sm">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <CardTitle icon={ImageIcon} iconClass="bg-signal-soft text-signal">
                  {t('dashboard.imageStatsTitle')}
                </CardTitle>
                <div className="inline-flex h-7 shrink-0 overflow-hidden rounded-full ring-1 ring-mist/70">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7! min-h-0 gap-1 rounded-none! px-2.5! text-[11px]! leading-none font-semibold text-signal shadow-none hover:bg-signal-soft"
                    onClick={() => setImageGroupsOpen(true)}
                  >
                    <List className="size-3" aria-hidden />
                    {t('dashboard.imageByGroups')}
                  </Button>
                  {!imageLoading ? (
                    <span
                      className={cn(
                        'inline-flex h-7 items-center border-l border-mist/70 px-2.5 font-display text-[11px] font-bold leading-none',
                        percentChip(imagePercent),
                      )}
                    >
                      {imagePercent}%
                    </span>
                  ) : null}
                </div>
              </div>
              {imageLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full" rounded="lg" />
                  <Skeleton className="h-2 w-full" rounded="full" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <StatTile
                      label={t('dashboard.imageTotal')}
                      value={formatNumber(imageTotal)}
                      className="border-signal/15 bg-signal-soft/30"
                      valueClass="text-signal"
                    />
                    <StatTile
                      label={t('dashboard.withImage')}
                      value={formatNumber(imageWith)}
                      className="border-teal/20 bg-teal-soft/30"
                      valueClass="text-teal"
                    />
                    <StatTile
                      label={t('dashboard.withoutImage')}
                      value={formatNumber(imageWithout)}
                      className="border-rose/20 bg-rose-soft/30"
                      valueClass="text-rose"
                    />
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-muted">
                        {t('dashboard.uploadPercent')}
                      </span>
                      <span className="font-semibold text-deep">
                        {formatNumber(imageWith)}{' '}
                        <span className="font-normal text-muted">
                          / {formatNumber(imageTotal)}
                        </span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-fog">
                      <div
                        className={cn(
                          'h-full rounded-full transition-[width]',
                          percentBar(imagePercent),
                        )}
                        style={{
                          width: `${Math.min(100, Math.max(0, imagePercent))}%`,
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </Panel>

            <Panel padding="sm">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <CardTitle icon={Wallet} iconClass="bg-teal-soft text-teal">
                    {t('dashboard.dailyIncome')}
                  </CardTitle>
                  {!payLoading && payments.length > 0 ? (
                    <Badge tone="teal">
                      {t('dashboard.imageTotal')}:{' '}
                      {formatNumber(paymentsTotal)} {t('dashboard.sum')}
                    </Badge>
                  ) : null}
                </div>
                <label className="flex cursor-pointer items-center gap-2">
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
                      'relative h-6 w-10 shrink-0 rounded-full transition',
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
                </label>
              </div>
              {payLoading ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-14 w-full" rounded="lg" />
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <p className="py-4 text-center text-[12px] text-muted">
                  {t('dashboard.noPayments')}
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {payments.map((item, index) => {
                    const amount = sumPayments(item)
                    const paid = amount > 0
                    return (
                      <div
                        key={`${item.name}-${index}`}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border px-2.5 py-2',
                          paid
                            ? 'border-teal/20 bg-teal-soft/25'
                            : 'border-mist/70 bg-fog/40',
                        )}
                      >
                        <span
                          className={cn(
                            'inline-flex size-7 shrink-0 items-center justify-center rounded-lg',
                            paid
                              ? 'bg-teal text-white'
                              : 'bg-white text-muted ring-1 ring-mist/70',
                          )}
                        >
                          <Wallet className="size-3.5" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span
                            className={cn(
                              'block font-display text-[15px] font-bold',
                              paid ? 'text-deep' : 'text-muted',
                            )}
                          >
                            {formatNumber(amount)}{' '}
                            <span className="text-[11px] font-semibold">
                              {t('dashboard.sum')}
                            </span>
                          </span>
                          <span className="block truncate text-[11px] text-muted">
                            {item.name || '—'}
                          </span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </Panel>
          </div>

          <Panel padding="sm" className="flex h-full min-h-0 flex-col">
            <div className="mb-1.5 flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <CardTitle icon={GraduationCap} iconClass="bg-violet-soft text-violet">
                {t('dashboard.eduTypesTitle')}
              </CardTitle>
              <div className="flex flex-wrap gap-1">
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
            </div>
            {eduTypes.length === 0 ? (
              <p className="py-4 text-center text-[12px] text-muted">
                {t('common.empty')}
              </p>
            ) : (
              <div className="grid min-h-0 flex-1 grid-cols-2 content-stretch gap-1 sm:grid-cols-4">
                {eduTypes.map((item) => {
                  const on = item.access_organization != null
                  return (
                    <div
                      key={item.edu_type_id}
                      className={cn(
                        'rounded-md border px-1.5 py-1',
                        on
                          ? 'border-teal/25 bg-teal-soft/25'
                          : 'border-mist/70 bg-fog/50',
                      )}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            'inline-flex min-w-6 items-center justify-center rounded px-1 text-[10px] font-extrabold',
                            on ? 'bg-teal text-white' : 'bg-mist text-muted',
                          )}
                        >
                          {eduTypeShortName(item.edu_type_id)}
                        </span>
                        <span className="font-display text-[13px] font-bold text-deep">
                          {formatNumber(item.students_count)}
                        </span>
                      </div>
                      <div className="mt-1 grid grid-cols-2 gap-1">
                        <div className="min-w-0 text-center">
                          <p className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted">
                            <span className="size-1.5 shrink-0 rounded-full bg-teal" />
                            {t('dashboard.eduActive')}
                          </p>
                          <p className="font-display text-[13px] font-bold text-teal">
                            {formatNumber(item.active_students_count)}
                          </p>
                        </div>
                        <div className="min-w-0 text-center">
                          <p className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted">
                            <span className="size-1.5 shrink-0 rounded-full bg-mist" />
                            {t('dashboard.eduEnded')}
                          </p>
                          <p className="font-display text-[13px] font-bold text-deep/70">
                            {formatNumber(item.ended_students_count)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>
        </div>
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
      <GaiRatingModal
        open={ratingOpen}
        year={ratingYear}
        period={ratingPeriod}
        onPeriodChange={setRatingPeriod}
        onClose={() => setRatingOpen(false)}
      />
      <StudentImageStatsModal
        open={imageGroupsOpen}
        onClose={() => setImageGroupsOpen(false)}
      />
    </>
  )
}

function WarningImages({ images }: { images?: string[] | string | null }) {
  const list = Array.isArray(images) ? images : images ? [images] : []
  if (list.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {list.map((src) => {
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
              <WarningImages images={item.images} />
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
