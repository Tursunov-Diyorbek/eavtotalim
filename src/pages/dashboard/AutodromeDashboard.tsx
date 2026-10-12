import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight, Clock, RefreshCw, Send, Users, Video } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  OrganizationSelect,
  Pagination,
  Panel,
  SearchInput,
  Select,
  Skeleton,
  SkeletonLines,
  Table,
  Tabs,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { routes } from '@/config'
import { useAuth } from '@/features/auth'
import {
  CAMERA_STATUS_VALUES,
  TELEGRAM_BOT,
  cameraVisual,
} from '@/pages/autodrome-agreement/AgreementCamerasPanel'
import {
  useAutodromeAttendanceChartQuery,
  useAutodromeMyCamerasQuery,
  useAutodromeTodayGroupsQuery,
  useAutodromeTodayVisitorsQuery,
  useAutodromeWidgetsQuery,
} from '@/features/autodrome-dashboard'
import { usePageState } from '@/hooks'
import { formatDate, formatDateTime, formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { MeProfession, MeUser } from '@/types'
import type {
  AutodromeTodayGroup,
  AutodromeTodayVisitor,
  AutodromeWeekday,
} from '@/types/autodrome-dashboard'

const DAYS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Yak'] as const

function num(value: number | string | null | undefined) {
  const n = typeof value === 'string' ? Number(value) : Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

function phoneLabel(raw?: string | null) {
  if (!raw?.trim()) return '—'
  const trimmed = raw.trim()
  if (trimmed.startsWith('+')) return trimmed
  const digits = trimmed.replace(/\D/g, '')
  const local = digits.startsWith('998') ? digits.slice(3) : digits
  if (local.length === 9) {
    return `+998 (${local.slice(0, 2)}) ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`
  }
  return `+998 ${trimmed}`
}

function amount(value: number | string | null | undefined) {
  return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 2 }).format(num(value))
}

function scheduleOf(days: AutodromeWeekday[] | null | undefined) {
  if (!days?.length) return '—'
  return days
    .map((item) => {
      const name = DAYS[(item.day ?? 1) - 1] ?? String(item.day ?? '')
      const shift = item.part === 1 ? '1-smena' : item.part === 2 ? '2-smena' : ''
      return shift ? `${name} (${shift})` : name
    })
    .join(', ')
}

function dateText(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    const ms = value < 1e12 ? value * 1000 : value
    return formatDate(new Date(ms).toISOString())
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return (
      dateText(record.date) ||
      dateText(record.formatted) ||
      dateText(record.datetime) ||
      null
    )
  }
  if (typeof value !== 'string') return null
  const raw = value.trim()
  if (!raw || raw === 'null' || raw.startsWith('0000')) return null
  return formatDate(raw) || raw
}

/** Faqat hisobning o‘zi: `profession.created_at`, bo‘lmasa `user.created_at`. */
function createdLabel(
  profession: MeProfession | null | undefined,
  user: MeUser | null,
) {
  const person = profession as (MeProfession & { createdAt?: unknown }) | null | undefined
  const account = user as (MeUser & { createdAt?: unknown }) | null
  return (
    dateText(person?.created_at) ||
    dateText(person?.createdAt) ||
    dateText(account?.created_at) ||
    dateText(account?.createdAt) ||
    '—'
  )
}

function Donut({
  passed,
  missed,
  label,
}: {
  passed: number
  missed: number
  label: string
}) {
  const total = passed + missed
  const pct = total > 0 ? (passed / total) * 100 : 0
  return (
    <div
      className="grid size-[6.75rem] shrink-0 place-items-center rounded-full p-2.5"
      style={{
        background: `conic-gradient(var(--color-teal) 0 ${pct}%, var(--color-rose) ${pct}% 100%)`,
      }}
      aria-hidden
    >
      <div className="grid size-full place-items-center rounded-full bg-white px-1 text-center shadow-[inset_0_0_0_1px_rgba(15,36,48,0.04)]">
        <span className="text-[13px] font-bold leading-none tracking-tight text-deep">{label}</span>
      </div>
    </div>
  )
}

function PassMetric({
  label,
  value,
  tone,
  onClick,
}: {
  label: string
  value: string
  tone: 'signal' | 'teal' | 'rose'
  onClick?: () => void
}) {
  const dot = tone === 'teal' ? 'bg-teal' : tone === 'rose' ? 'bg-rose' : 'bg-signal'
  const body = (
    <>
      <span className="flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] text-muted">
          <span className={cn('size-1.5 shrink-0 rounded-full', dot)} aria-hidden />
          <span className="truncate">{label}</span>
        </span>
        {onClick ? (
          <ArrowUpRight className="size-3.5 shrink-0 text-muted transition group-hover:text-signal" aria-hidden />
        ) : null}
      </span>
      <span className="mt-2 block text-[20px] font-bold leading-none tracking-tight text-deep tabular-nums">
        {value}
      </span>
    </>
  )
  const className =
    'group flex h-full min-w-0 flex-col rounded-2xl border border-mist/80 bg-white px-3.5 py-3 text-left'
  if (!onClick) return <div className={className}>{body}</div>
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        className,
        'cursor-pointer transition hover:-translate-y-px hover:border-signal/40 hover:shadow-[0_8px_20px_rgba(47,126,160,0.08)]',
      )}
    >
      {body}
    </button>
  )
}

function LegendRow({
  tone,
  label,
  value,
  onClick,
}: {
  tone: 'teal' | 'rose'
  label: string
  value: string
  onClick?: () => void
}) {
  const className = cn(
    'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left',
    onClick && 'cursor-pointer transition hover:bg-fog',
  )
  const body = (
    <>
      <span
        className={cn('size-2 shrink-0 rounded-full', tone === 'teal' ? 'bg-teal' : 'bg-rose')}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate text-[13px] text-muted">{label}</span>
      <span className="text-[13px] font-semibold tabular-nums text-deep">{value}</span>
      {onClick ? <ArrowUpRight className="size-3.5 shrink-0 text-muted" aria-hidden /> : null}
    </>
  )
  if (!onClick) return <div className={className}>{body}</div>
  return (
    <button type="button" className={className} onClick={onClick}>
      {body}
    </button>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-fog/70 px-3 py-2.5">
      <p className="m-0 text-[11px] font-medium text-muted">{label}</p>
      <p className="m-0 mt-0.5 truncate text-[14px] font-semibold text-deep" title={value}>
        {value || '—'}
      </p>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-teal-soft/50 px-3 py-2.5 text-left">
      <p className="m-0 text-[11px] font-medium text-teal">{label}</p>
      <p className="m-0 mt-0.5 text-[18px] font-bold tabular-nums text-deep">{value}</p>
    </div>
  )
}

function CapacityBar({
  used,
  max,
  percent,
  full,
  free,
}: {
  used: number
  max: number | null | undefined
  percent: number
  full: boolean
  free?: number | null
}) {
  const { t } = useTranslation()
  const width = Math.min(100, Math.max(0, percent))
  return (
    <div className="mx-auto w-40">
      <div className="mb-1 flex items-center justify-between gap-2 text-[12px] font-semibold tabular-nums text-deep">
        <span>
          {formatNumber(used)}
          {max != null ? ` / ${formatNumber(max)}` : ''}
        </span>
        <span className={full ? 'text-rose' : 'text-signal'}>{width}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-fog">
        <div
          className={cn(
            'h-full rounded-full bg-linear-to-r',
            full ? 'from-rose to-amber' : 'from-signal to-teal',
          )}
          style={{ width: `${width}%` }}
        />
      </div>
      {free != null ? (
        <p className="m-0 mt-1 text-center text-[11px] text-muted">
          {t('autodromeAgreementPage.freeSlots')}: {formatNumber(free)}
        </p>
      ) : null}
    </div>
  )
}

function SectionTitle({
  tone,
  icon,
  children,
}: {
  tone: 'signal' | 'teal'
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white',
        tone === 'signal' ? 'bg-signal' : 'bg-teal',
      )}
    >
      {icon}
      {children}
    </div>
  )
}

function ShiftFilter({
  part,
  onChange,
}: {
  part: 1 | 2 | null
  onChange: (next: 1 | 2 | null) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={part === 1 ? 'primary' : 'outline'}
        size="sm"
        active={part === 1}
        onClick={() => onChange(part === 1 ? null : 1)}
      >
        {t('autodromeHome.shift1')}
      </Button>
      <Button
        variant={part === 2 ? 'primary' : 'outline'}
        size="sm"
        active={part === 2}
        onClick={() => onChange(part === 2 ? null : 2)}
      >
        {t('autodromeHome.shift2')}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t('common.clear')}
        onClick={() => onChange(null)}
      >
        <RefreshCw className="size-3.5" />
      </Button>
    </div>
  )
}

export function AutodromeDashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { me, user } = useAuth()
  const profession = me?.profession
  const autodrome = profession?.autodrome
  const widgets = useAutodromeWidgetsQuery()
  const chart = useAutodromeAttendanceChartQuery()
  const cameras = useAutodromeMyCamerasQuery()
  const [cameraSearch, setCameraSearch] = usePageState('cameraSearch', '')
  const [cameraStatus, setCameraStatus] = usePageState('cameraStatus', '')
  const openPassed = () => navigate(routes.studentsPassedCamera)

  const [tab, setTab] = usePageState<'groups' | 'students'>('arrivalsTab', 'groups')
  const [part, setPart] = usePageState<1 | 2 | null>('shift', null)
  const [groupSearch, setGroupSearch] = usePageState('groupSearch', '')
  const [orgSearch, setOrgSearch] = usePageState('orgSearch', '')
  const [studentSearch, setStudentSearch] = usePageState('studentSearch', '')
  const [studentGroup, setStudentGroup] = usePageState('studentGroup', '')
  const [studentOrg, setStudentOrg] = usePageState('studentOrg', '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const filterKey = [
    tab,
    part,
    groupSearch,
    orgSearch,
    studentSearch,
    studentGroup,
    studentOrg,
    pageSize,
  ].join('|')
  const filterRef = useRef(filterKey)

  useEffect(() => {
    if (filterRef.current === filterKey) return
    filterRef.current = filterKey
    setPage(1)
  }, [filterKey])

  const groupsQuery = useAutodromeTodayGroupsQuery(
    {
      page,
      showCount: pageSize,
      groupSearch,
      organizationSearch: orgSearch,
      part,
    },
    tab === 'groups',
  )
  const visitorsQuery = useAutodromeTodayVisitorsQuery(
    {
      page,
      showCount: pageSize,
      studentSearch,
      groupSearch: studentGroup,
      organizationSearch: studentOrg,
      part,
    },
    tab === 'students',
  )

  const fio = (profession?.fio ?? '').trim().replace(/\s+/g, ' ')
  const chartCounts = chart.data?.chart?.datasets?.[0]?.data ?? []
  const chartPercents = chart.data?.chart?.datasets?.[1]?.data ?? []
  const passed = num(chart.data?.counts?.visitedStudents ?? chartCounts[0])
  const missed = num(chart.data?.counts?.notVisitedStudents ?? chartCounts[1])
  const totalStudents = num(
    chart.data?.counts?.totalStudents ?? passed + missed,
  )
  const passedPct = num(
    chart.data?.percentages?.visited_students ?? chartPercents[0],
  )
  const missedPct = num(
    chart.data?.percentages?.not_visited_students ?? chartPercents[1],
  )

  const activeQuery = tab === 'groups' ? groupsQuery : visitorsQuery
  const rows = activeQuery.data?.data ?? []
  const total = activeQuery.data?.total_items ?? 0
  const totalPages =
    activeQuery.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  const personal = useMemo(() => {
    const parts = fio
      ? fio.split(' ')
      : [profession?.last_name, profession?.first_name, profession?.middle_name].filter(
          (part): part is string => Boolean(part),
        )
    return [
      { label: t('autodromeHome.lastName'), value: parts[0] || '—' },
      { label: t('autodromeHome.firstName'), value: parts[1] || '—' },
      {
        label: t('autodromeHome.middleName'),
        value: parts.length > 2 ? parts.slice(2).join(' ') : '—',
      },
      { label: t('autodromeHome.username'), value: user?.username || '—' },
      {
        label: t('autodromeHome.created'),
        value: createdLabel(profession, user),
      },
      { label: t('autodromeHome.phone'), value: phoneLabel(profession?.phone) },
    ]
  }, [
    fio,
    i18n.language,
    user,
    profession?.first_name,
    profession?.last_name,
    profession?.middle_name,
    profession,
    profession?.phone,
    t,
    user?.username,
  ])

  const stats = widgets.data
  const cameraRows = useMemo(() => {
    const query = cameraSearch.trim().toLowerCase()
    return (cameras.data?.cameras ?? []).filter((camera) => {
      if (cameraStatus && (camera.status ?? '').toLowerCase() !== cameraStatus) return false
      if (!query) return true
      return [camera.ip_address, camera.model_name, camera.description].some((value) =>
        (value ?? '').toLowerCase().includes(query),
      )
    })
  }, [cameraSearch, cameraStatus, cameras.data?.cameras])

  return (
    <>
      <Header
        title={
          <span className="inline-flex min-w-0 items-baseline gap-2">
            <span className="truncate">{autodrome?.name || t('nav.dashboard')}</span>
            {autodrome?.inn ? (
              <span className="shrink-0 text-[13px] font-semibold text-rose">{autodrome.inn}</span>
            ) : null}
          </span>
        }
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1 text-[12px] font-medium text-deep">
            <Clock className="size-3.5 text-teal" aria-hidden />
            {t('autodromeHome.lastSeen')}: {formatDateTime(user?.last_seen, i18n.language) || '—'}
          </span>
        }
      />
      <PageMain>
        <Panel>
          <div className="flex flex-wrap items-center gap-2 border-b border-mist/70 px-3 py-2.5">
            <Video className="size-4 shrink-0 text-signal" aria-hidden />
            <p className="m-0 min-w-0 flex-1 truncate text-sm font-semibold text-deep">
              {t('autodromeHome.cameras')}
              {autodrome?.name ? ` — ${autodrome.name}` : ''}
              <span className="ml-2 text-[12px] font-medium text-muted">
                {t('autodromeHome.updated')}:{' '}
                {formatDateTime(cameras.data?.syncedAt, i18n.language) || '—'}
              </span>
            </p>
            <SearchInput
              debounceMs={0}
              value={cameraSearch}
              onChange={(e) => setCameraSearch(e.target.value)}
              placeholder={t('autodromeAgreementPage.cameraSearch')}
              className="w-48"
            />
            <Select
              value={cameraStatus}
              searchable={false}
              onChange={(e) => setCameraStatus(e.target.value)}
              options={CAMERA_STATUS_VALUES.map((value) => ({
                value,
                label:
                  value === ''
                    ? t('autodromeAgreementPage.allStatuses')
                    : t(`autodromeAgreementPage.camStatus_${value}`),
              }))}
              triggerClassName="min-w-40"
            />
          </div>
          <div className="p-3">
            <a
              href={TELEGRAM_BOT}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 flex items-center gap-2 rounded-lg border border-signal/20 bg-signal-soft/40 px-3 py-2 no-underline"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-signal text-white">
                <Send className="size-3.5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 text-[12px] leading-snug">
                <b className="text-deep">@intalim_bot</b>
                <span className="text-muted"> {t('autodromeAgreementPage.botHint')}</span>
              </span>
              <span className="shrink-0 text-[11px] font-semibold text-signal">
                {t('autodromeAgreementPage.openBot')}
              </span>
            </a>
            {cameras.isError ? (
              <ErrorMessage compact />
            ) : cameras.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" rounded="lg" />
                <SkeletonLines lines={4} />
              </div>
            ) : cameraRows.length === 0 ? (
              <EmptyState
                className="border-0 py-6 shadow-none"
                description={t('autodromeHome.noCameras')}
              />
            ) : (
              <Table storageKey="autodrome-home-cameras" bordered={false} className="min-w-180">
                <THead>
                  <HeaderTR>
                    <TH column="camera">{t('autodromeAgreementPage.camera')}</TH>
                    <TH column="status" className="text-center">
                      {t('autodromeAgreementPage.camStatus')}
                    </TH>
                    <TH column="capacity" className="w-52 text-center">
                      {t('autodromeAgreementPage.capacity')}
                    </TH>
                    <TH column="tech" className="text-center">
                      {t('autodromeAgreementPage.technical')}
                    </TH>
                  </HeaderTR>
                </THead>
                <TBody>
                  {cameraRows.map((camera, index) => {
                    const visual = cameraVisual(camera, t)
                    return (
                      <TR key={camera.id ?? camera.camera_id ?? index}>
                        <TD column="camera">
                          <p className="m-0 font-semibold text-deep">{camera.ip_address || '—'}</p>
                          {camera.model_name ? (
                            <p className="m-0 text-[11px] text-muted">{camera.model_name}</p>
                          ) : null}
                          {camera.description ? (
                            <p className="m-0 text-[11px] text-muted">{camera.description}</p>
                          ) : null}
                        </TD>
                        <TD column="status" className="text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <Badge tone={visual.tone}>{visual.label}</Badge>
                            {visual.offlineText &&
                            (camera.status || '').toLowerCase() !== 'online' ? (
                              <span className="text-[11px] text-rose">{visual.offlineText}</span>
                            ) : null}
                            <span className="text-[11px] text-muted">
                              {t('autodromeAgreementPage.lastOnline')}:{' '}
                              {formatDateTime(camera.last_online_at, i18n.language) || '—'}
                            </span>
                          </div>
                        </TD>
                        <TD column="capacity">
                          <CapacityBar
                            used={visual.used}
                            max={visual.max}
                            percent={visual.percent}
                            full={visual.full}
                            free={camera.free_slots}
                          />
                        </TD>
                        <TD column="tech" className="text-center text-[11px] text-muted">
                          {camera.latency_ms != null ? (
                            <p className="m-0">
                              {t('autodromeAgreementPage.latency')}: {camera.latency_ms} ms
                            </p>
                          ) : null}
                          <p className="m-0">
                            {t('autodromeAgreementPage.synced')}:{' '}
                            {formatDateTime(camera.last_synced_at, i18n.language) || '—'}
                          </p>
                        </TD>
                      </TR>
                    )
                  })}
                </TBody>
              </Table>
            )}
          </div>
        </Panel>

        <div className="grid gap-3 lg:grid-cols-2">
          <Panel>
            <SectionTitle tone="signal" icon={<Users className="size-4" aria-hidden />}>
              {t('autodromeHome.personal')}
            </SectionTitle>
            <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
              {personal.map((item) => (
                <InfoTile key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </Panel>
          <Panel>
            <SectionTitle tone="teal" icon={<Users className="size-4" aria-hidden />}>
              {t('autodromeHome.stats')}
            </SectionTitle>
            <div className="p-3">
              {widgets.isError ? (
                <ErrorMessage compact />
              ) : widgets.isLoading ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Skeleton key={i} className="h-16" rounded="xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <StatTile
                    label={t('autodromeHome.todayGroups')}
                    value={formatNumber(stats?.todays_groups_count)}
                  />
                  <StatTile
                    label={t('autodromeHome.todayComing')}
                    value={formatNumber(stats?.todays_present_students_count)}
                  />
                  <StatTile
                    label={t('autodromeHome.todayStudents')}
                    value={formatNumber(stats?.todays_students_count)}
                  />
                  <StatTile
                    label={t('autodromeHome.allGroups')}
                    value={formatNumber(stats?.total_groups_count)}
                  />
                  <StatTile
                    label={t('autodromeHome.allStudents')}
                    value={formatNumber(stats?.total_students_count)}
                  />
                </div>
              )}
            </div>
          </Panel>
        </div>

        <Panel>
          <SectionTitle tone="signal" icon={<Users className="size-4" aria-hidden />}>
            {t('autodromeHome.passTitle')}
          </SectionTitle>
          <div className="p-3">
            {chart.isError ? (
              <ErrorMessage compact />
            ) : chart.isLoading ? (
              <Skeleton className="h-36 w-full" rounded="xl" />
            ) : (
              <div className="grid gap-3">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  <PassMetric
                    tone="signal"
                    label={t('autodromeHome.totalStudents')}
                    value={formatNumber(totalStudents)}
                  />
                  <PassMetric
                    tone="teal"
                    label={t('autodromeHome.passed')}
                    value={formatNumber(passed)}
                    onClick={openPassed}
                  />
                  <PassMetric
                    tone="rose"
                    label={t('autodromeHome.missed')}
                    value={formatNumber(missed)}
                  />
                  <PassMetric
                    tone="teal"
                    label={t('autodromeHome.visitedPercent')}
                    value={`${amount(passedPct)}%`}
                    onClick={openPassed}
                  />
                  <PassMetric
                    tone="rose"
                    label={t('autodromeHome.missedPercent')}
                    value={`${amount(missedPct)}%`}
                  />
                </div>
                <div className="grid gap-2 lg:grid-cols-2">
                  <div className="flex items-center gap-4 rounded-2xl border border-mist/80 bg-fog/40 px-4 py-3">
                    <Donut passed={passed} missed={missed} label={formatNumber(totalStudents)} />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 px-2 text-[13px] font-semibold text-deep">
                        {t('autodromeHome.countChart')}
                      </p>
                      <div className="mt-2 grid gap-0.5">
                        <LegendRow
                          tone="teal"
                          label={t('autodromeHome.passedShort')}
                          value={formatNumber(passed)}
                          onClick={openPassed}
                        />
                        <LegendRow
                          tone="rose"
                          label={t('autodromeHome.missedShort')}
                          value={formatNumber(missed)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-mist/80 bg-fog/40 px-4 py-3">
                    <Donut
                      passed={passedPct}
                      missed={missedPct}
                      label={`${amount(passedPct)}%`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 px-2 text-[13px] font-semibold text-deep">
                        {t('autodromeHome.percentChart')}
                      </p>
                      <div className="mt-2 grid gap-0.5">
                        <LegendRow
                          tone="teal"
                          label={t('autodromeHome.passedShort')}
                          value={`${amount(passedPct)}%`}
                          onClick={openPassed}
                        />
                        <LegendRow
                          tone="rose"
                          label={t('autodromeHome.missedShort')}
                          value={`${amount(missedPct)}%`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Panel>

        <Panel className="flex min-h-80 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mist/70 px-3 py-2">
            <Tabs
              size="sm"
              aria-label={t('autodromeHome.todayArrivals')}
              value={tab}
              onChange={setTab}
              items={[
                { value: 'groups', label: t('autodromeHome.byGroups') },
                { value: 'students', label: t('autodromeHome.byStudents') },
              ]}
            />
            <ShiftFilter part={part} onChange={setPart} />
          </div>
          <div className="flex min-h-0 flex-1 flex-col p-3">
            {activeQuery.isError ? (
              <ErrorMessage compact />
            ) : activeQuery.isLoading ? (
              <ListPageSkeleton rows={6} />
            ) : tab === 'groups' ? (
              <Table storageKey="autodrome-today-groups">
                <THead>
                  <HeaderTR>
                    <TH column="name">{t('autodromeHome.groupName')}</TH>
                    <TH column="org">{t('autodromeHome.orgName')}</TH>
                    <TH column="edu">{t('autodromeHome.eduType')}</TH>
                    <TH column="days">{t('autodromeHome.weekdays')}</TH>
                    <TH column="auto" className="text-center">
                      {t('autodromeHome.autodromeStudents')}
                    </TH>
                    <TH column="students" className="text-center">
                      {t('autodromeHome.studentsCount')}
                    </TH>
                    <TH column="today" className="text-center">
                      {t('autodromeHome.cameToday')}
                    </TH>
                  </HeaderTR>
                  <FilterTR>
                    <FilterTH column="name">
                      <SearchInput
                        size="sm"
                        id="ad-group"
                        name="ad-group"
                        label={t('autodromeHome.groupName')}
                        placeholder={t('common.search')}
                        value={groupSearch}
                        onChange={(e) => setGroupSearch(e.target.value)}
                      />
                    </FilterTH>
                    <FilterTH column="org">
                      <OrganizationSelect
                        id="ad-org"
                        name="ad-org"
                        size="sm"
                        valueKey="name"
                        value={orgSearch}
                        onChange={(e) => setOrgSearch(e.target.value)}
                      />
                    </FilterTH>
                    <FilterTH column="edu" />
                    <FilterTH column="days" />
                    <FilterTH column="auto" />
                    <FilterTH column="students" />
                    <FilterTH column="today" />
                  </FilterTR>
                </THead>
                <TBody>
                  {rows.length === 0 ? (
                    <EmptyTR colSpan={7} description={t('autodromeHome.emptyGroups')} />
                  ) : (
                    (rows as AutodromeTodayGroup[]).map((row, index) => (
                      <TR key={row.id ?? index}>
                        <TD column="name" className="font-medium">
                          {row.name || '—'}
                        </TD>
                        <TD column="org">{row.organization?.name || '—'}</TD>
                        <TD column="edu">
                          <Badge tone="signal">
                            {row.edu_type?.code || row.edu_type?.short_name || '—'}
                          </Badge>
                        </TD>
                        <TD column="days">{scheduleOf(row.weekdays)}</TD>
                        <TD column="auto" className="text-center">
                          <Badge tone="neutral">{formatNumber(row.autodrome_students_count)}</Badge>
                        </TD>
                        <TD column="students" className="text-center">
                          <Badge tone="indigo">{formatNumber(row.students_count)}</Badge>
                        </TD>
                        <TD column="today" className="text-center">
                          <Badge tone="teal">{formatNumber(row.today_day_part)}</Badge>
                        </TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            ) : (
              <Table storageKey="autodrome-today-visitors">
                <THead>
                  <HeaderTR>
                    <TH column="fio">{t('statsPage.fish')}</TH>
                    <TH column="group">{t('autodromeHome.groupName')}</TH>
                    <TH column="org">{t('autodromeHome.orgName')}</TH>
                    <TH column="edu">{t('autodromeHome.eduType')}</TH>
                  </HeaderTR>
                  <FilterTR>
                    <FilterTH column="fio">
                      <SearchInput
                        size="sm"
                        id="ad-fio"
                        name="ad-fio"
                        label={t('statsPage.fish')}
                        placeholder={t('common.search')}
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                      />
                    </FilterTH>
                    <FilterTH column="group">
                      <SearchInput
                        size="sm"
                        id="ad-sgroup"
                        name="ad-sgroup"
                        label={t('autodromeHome.groupName')}
                        placeholder={t('common.search')}
                        value={studentGroup}
                        onChange={(e) => setStudentGroup(e.target.value)}
                      />
                    </FilterTH>
                    <FilterTH column="org">
                      <OrganizationSelect
                        id="ad-sorg"
                        name="ad-sorg"
                        size="sm"
                        valueKey="name"
                        value={studentOrg}
                        onChange={(e) => setStudentOrg(e.target.value)}
                      />
                    </FilterTH>
                    <FilterTH column="edu" />
                  </FilterTR>
                </THead>
                <TBody>
                  {rows.length === 0 ? (
                    <EmptyTR colSpan={4} description={t('autodromeHome.emptyStudents')} />
                  ) : (
                    (rows as AutodromeTodayVisitor[]).map((item, index) => (
                      <TR key={item.id ?? index}>
                        <TD column="fio" className="font-medium">
                          {item.full_name || '—'}
                        </TD>
                        <TD column="group">{item.group?.group || item.group?.name || '—'}</TD>
                        <TD column="org">{item.organization?.name || '—'}</TD>
                        <TD column="edu">
                          <Badge tone="signal">
                            {item.edu_type?.code || item.edu_type?.short_name || '—'}
                          </Badge>
                        </TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            )}
            <Pagination
              className="shrink-0"
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={total}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
            />
          </div>
        </Panel>
      </PageMain>
    </>
  )
}
