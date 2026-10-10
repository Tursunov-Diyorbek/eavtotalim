import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  Users,
  Wallet,
} from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  EmptyTR,
  ErrorMessage,
  HeaderTR,
  Modal,
  Panel,
  SafeImage,
  ShowButton,
  Skeleton,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Tabs,
  type BadgeTone,
} from '@/components/ui'
import {
  PATH_PREFIX_FILE_HOST,
  groupShowPath,
  routes,
  templateViewStudentPath,
} from '@/config'
import { useAuth } from '@/features/auth'
import { useTemplateTestStatsQuery } from '@/features/director-stats'
import { useTeacherGroupsQuery, useTeacherScheduleQuery } from '@/features/dashboard'
import { asLangName, cn, formatDate, formatNumber, fullNameOf, isFilled } from '@/lib'
import type { TemplateStatRow } from '@/types/director-stats'
import type { MeProfession } from '@/types/auth'
import type { TeacherGroupCard } from '@/types/teacher-dashboard'
import {
  CalendarToolbar,
  LessonDayModal,
  WEEK,
  YearPanel,
  indexSchedule,
  isoOf,
  markedCount,
  monthCells,
  type CalendarMode,
} from './teacherCalendar'

type TabId = 'personal' | 'education' | 'contacts' | 'organization' | 'documents'

function fileUrl(path: string | null | undefined): string | null {
  if (!isFilled(path)) return null
  const value = String(path)
  if (/^https?:\/\//i.test(value)) return value
  return `${PATH_PREFIX_FILE_HOST.replace(/\/$/, '')}/${value.replace(/^\//, '')}`
}

function phoneLabel(value: string | null | undefined): string | null {
  if (!isFilled(value)) return null
  const raw = String(value).trim()
  if (raw.startsWith('+')) return raw
  if (raw.startsWith('998')) return `+${raw}`
  return `+998 ${raw}`
}

function maskPassport(seria?: string | null, number?: string | null) {
  const raw = `${seria ?? ''}${number ?? ''}`.replace(/\s+/g, '')
  if (raw.length < 4) return raw || '—'
  return `${raw.slice(0, 1)}${'*'.repeat(Math.max(2, raw.length - 2))}${raw.slice(-1)}`
}

function textOrDash(value: string | null | undefined) {
  return isFilled(value) ? String(value) : '—'
}

function SectionHead({
  title,
  to,
  action,
}: {
  title: string
  to?: string
  action?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-mist/70 px-4 py-2.5">
      <h3 className="text-[14px] font-semibold text-deep">{title}</h3>
      {to && action ? (
        <Link
          to={to}
          className="inline-flex items-center gap-0.5 text-[13px] font-medium text-signal hover:underline"
        >
          {action}
          <ChevronRight className="size-3.5" aria-hidden />
        </Link>
      ) : null}
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  const text = textOrDash(value)
  return (
    <div className="min-w-0 border-b border-mist/60 py-1.5">
      <p className="text-[10px] text-muted">{label}</p>
      <p className="truncate text-[13px] font-medium text-deep" title={text}>
        {text}
      </p>
    </div>
  )
}

function Chip({
  icon: Icon,
  children,
}: {
  icon: typeof CalendarDays
  children: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-fog px-2 py-1.5 text-[12px] font-medium text-deep">
      <Icon className="size-3.5 shrink-0 text-signal" aria-hidden />
      <span className="truncate">{children}</span>
    </div>
  )
}

function DocLink({
  label,
  href,
  fileLabel,
}: {
  label: string
  href: string
  fileLabel: string
}) {
  const pdf = /\.pdf($|\?)/i.test(href)
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex h-16 min-w-0 items-center gap-2.5 rounded-xl border border-mist bg-white px-2.5 transition hover:border-signal/40"
    >
      {pdf ? (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-rose/20 bg-rose-soft text-rose">
          <FileText className="size-4" aria-hidden />
        </span>
      ) : (
        <SafeImage
          src={href}
          alt=""
          fit="cover"
          size="sm"
          className="size-10 shrink-0 rounded-lg border border-mist"
        />
      )}
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium text-deep">{label}</span>
        <span className="text-[11px] text-muted">{fileLabel}</span>
      </span>
    </a>
  )
}

function ProfileCard({ profession }: { profession: MeProfession | null | undefined }) {
  const { t, i18n } = useTranslation()
  const [tab, setTab] = useState<TabId>('personal')
  const [photoOpen, setPhotoOpen] = useState(false)
  const name = fullNameOf(profession) ?? '—'
  const orgName = profession?.organization?.name_uz || profession?.organization?.name
  const phone = phoneLabel(profession?.phone1) ?? phoneLabel(profession?.phone)
  const phone2 = phoneLabel(profession?.phone2)
  const photo = fileUrl(profession?.image)
  const phones = [phone, phone2].filter(Boolean).join(' · ')

  const docs = [
    { key: 'passport', label: t('teacherDash.passportCopy'), href: fileUrl(profession?.passport_copy) },
    { key: 'diploma', label: t('teacherDash.diplomaCopy'), href: fileUrl(profession?.diplom_copy) },
    {
      key: 'app',
      label: t('teacherDash.diplomaApp'),
      href: fileUrl(profession?.diplom_application_copy),
    },
    {
      key: 'license',
      label: t('teacherDash.licenseFile'),
      href: fileUrl(profession?.organization?.license_file),
    },
  ].filter((item) => item.href)

  return (
    <Panel className="flex h-full flex-col">
      <div className="flex items-center gap-3 p-3">
        <Button
          type="button"
          variant="ghost"
          className="!size-20 !shrink-0 !overflow-hidden !rounded-2xl !border-2 !border-mist !bg-white !p-0.5 !shadow-none"
          aria-label={name}
          disabled={!photo}
          onClick={() => setPhotoOpen(true)}
        >
          <SafeImage src={photo} alt="" size="lg" className="size-full rounded-[14px]" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-deep uppercase">
              {name}
            </h3>
            <Badge tone="violet">{t('teacherDash.diploma')}</Badge>
            {profession?.gender != null ? (
              <Badge tone="signal">
                {profession.gender === 1 ? t('teacherDash.male') : t('teacherDash.female')}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 truncate text-[12px] text-muted" title={orgName ?? undefined}>
            {textOrDash(orgName)}
          </p>
          <p className="truncate text-[12px] text-ink">{phones || '—'}</p>
        </div>
      </div>
      <div className="px-3">
        <Tabs
          size="sm"
          aria-label={t('teacherDash.personal')}
          value={tab}
          onChange={setTab}
          items={[
            { value: 'personal', label: t('teacherDash.personal') },
            { value: 'education', label: t('teacherDash.education') },
            { value: 'contacts', label: t('teacherDash.contacts') },
            { value: 'organization', label: t('teacherDash.organization') },
            { value: 'documents', label: t('teacherDash.documents') },
          ]}
        />
      </div>
      <div className="grid max-h-52 grid-cols-2 gap-x-4 gap-y-2 overflow-y-auto px-3 pt-2 pb-3">
        {tab === 'personal' ? (
          <>
            <Fact label={t('teacherDash.birthDate')} value={formatDate(profession?.birthday, i18n.language)} />
            <Fact
              label={t('teacherDash.passport')}
              value={[profession?.passport_seria, profession?.passport_number].filter(Boolean).join(' ')}
            />
            <Fact label={t('teacherDash.pin')} value={profession?.passport_jshir} />
            <Fact
              label={t('teacherDash.givenDate')}
              value={formatDate(profession?.passport_given_date, i18n.language) ?? profession?.passport_given_date}
            />
            <Fact label={t('teacherDash.givenBy')} value={profession?.passport_given_place} />
          </>
        ) : null}
        {tab === 'education' ? (
          <>
            <Fact label={t('teacherDash.institution')} value={profession?.institution_name} />
            <Fact label={t('teacherDash.specialization')} value={profession?.specialization} />
            <Fact
              label={t('teacherDash.diploma')}
              value={`${t('teacherDash.series')}: ${textOrDash(profession?.diplom_seria)} ${profession?.diplom_number ?? ''}`.trim()}
            />
            <Fact
              label={t('teacherDash.givenDate')}
              value={formatDate(profession?.diplom_given_date, i18n.language)}
            />
          </>
        ) : null}
        {tab === 'contacts' ? (
          <>
            <Fact label={`${t('teacherDash.phone')} 1`} value={phone} />
            {phone2 ? <Fact label={`${t('teacherDash.phone')} 2`} value={phone2} /> : null}
            <Fact label={t('teacherDash.permanentAddress')} value={profession?.constant_address} />
            <Fact label={t('teacherDash.currentAddress')} value={profession?.address} />
          </>
        ) : null}
        {tab === 'organization' ? (
          <>
            <Fact label={t('teacherDash.orgName')} value={orgName} />
            <Fact label={t('teacherDash.contract')} value={profession?.organization?.contract} />
            <Fact
              label={t('teacherDash.contractDate')}
              value={formatDate(profession?.organization?.contract_date, i18n.language) ?? profession?.organization?.contract_date}
            />
            <Fact label={t('teacherDash.account')} value={profession?.organization?.hr} />
            <Fact label={t('teacherDash.inn')} value={profession?.organization?.inn} />
            <Fact label={t('teacherDash.invoice')} value={profession?.organization?.invoys_number} />
            <Fact label={t('teacherDash.licenseNumber')} value={profession?.organization?.license_number} />
            <Fact
              label={t('teacherDash.licenseDate')}
              value={formatDate(profession?.organization?.license_date, i18n.language) ?? profession?.organization?.license_date}
            />
            <Fact label={t('teacherDash.phone')} value={profession?.organization?.phone} />
            {isFilled(profession?.organization?.phone1) ? (
              <Fact label={t('teacherDash.phone')} value={profession?.organization?.phone1} />
            ) : null}
            <Fact label={t('teacherDash.address')} value={profession?.organization?.address} />
          </>
        ) : null}
        {tab === 'documents' ? (
          docs.length ? (
            docs.map((doc) => (
              <DocLink
                key={doc.key}
                label={doc.label}
                href={doc.href!}
                fileLabel={t('teacherDash.openFile')}
              />
            ))
          ) : (
            <p className="col-span-full text-[13px] text-muted">{t('teacherDash.noDocuments')}</p>
          )
        ) : null}
      </div>
      <Modal
        open={photoOpen}
        onClose={() => setPhotoOpen(false)}
        title={name}
        sizeClassName="max-w-lg"
        bodyClassName="p-3 sm:p-4"
      >
        <SafeImage
          src={photo}
          alt={name}
          size="xl"
          fit="contain"
          className="mx-auto h-[min(70svh,640px)] w-full rounded-xl bg-fog"
        />
      </Modal>
    </Panel>
  )
}

function ScheduleCard() {
  const { t } = useTranslation()
  const query = useTeacherScheduleQuery()
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const [mode, setMode] = useState<CalendarMode>('month')
  const [picked, setPicked] = useState<string | null>(null)

  const byDate = useMemo(() => indexSchedule(query.data), [query.data])
  const cells = monthCells(cursor)
  const todayKey = isoOf(today)
  const selected = picked ? (byDate.get(picked) ?? []) : []

  return (
    <Panel className="flex h-full flex-col">
      <SectionHead
        title={t('teacherDash.schedule')}
        to={routes.lessonScheduleCalendar}
        action={t('teacherDash.fullView')}
      />
      <CalendarToolbar cursor={cursor} mode={mode} onCursor={setCursor} onMode={setMode} />
      {query.isLoading ? (
        <div className="p-4">
          <Skeleton className="h-52 w-full" />
        </div>
      ) : query.isError ? (
        <div className="p-4">
          <ErrorMessage className="py-8" />
        </div>
      ) : mode === 'year' ? (
        <YearPanel
          cursor={cursor}
          today={today}
          onPick={(month) => {
            setCursor(new Date(cursor.getFullYear(), month, 1))
            setMode('month')
          }}
        />
      ) : (
        <div className="grid grid-cols-7 gap-1 px-3 pb-3">
          {WEEK.map((key) => (
            <div
              key={key}
              className="pb-1 text-center text-[11px] font-medium text-muted"
            >
              {t(`lessonSchedule.${key}`)}
            </div>
          ))}
          {cells.map((cell) => {
            const key = isoOf(cell.date)
            const count = cell.inMonth ? markedCount(byDate.get(key)) : 0
            const isToday = key === todayKey
            return (
              <Button
                key={key}
                type="button"
                variant={isToday ? 'primary' : count > 0 ? 'soft' : 'ghost'}
                size="icon-sm"
                className={cn(
                  'relative mx-auto !shadow-none',
                  !cell.inMonth && 'opacity-35',
                )}
                onClick={() => {
                  if (count > 0) setPicked(key)
                }}
              >
                {cell.date.getDate()}
                {count > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded bg-teal px-0.5 text-[9px] font-bold text-white">
                    {count}
                  </span>
                ) : null}
              </Button>
            )
          })}
        </div>
      )}
      <LessonDayModal picked={picked} rows={selected} onClose={() => setPicked(null)} />
    </Panel>
  )
}

function groupStatus(status: number | null | undefined): {
  tone: BadgeTone
  key: 'statusNew' | 'statusGraduated' | 'statusActive'
} {
  if (status === 0) return { tone: 'teal', key: 'statusNew' }
  if (status === 2) return { tone: 'rose', key: 'statusGraduated' }
  return { tone: 'signal', key: 'statusActive' }
}

function shortCategory(item: TeacherGroupCard, lang: string) {
  const edu = item.edu_type
  if (!edu) return '—'
  if (lang === 'ru') return edu.short_name_ru || edu.short_name_uz || '—'
  if (lang === 'kiril') return edu.short_name_kiril || edu.short_name_uz || '—'
  return edu.short_name_uz || '—'
}

function GroupsCard() {
  const { t, i18n } = useTranslation()
  const query = useTeacherGroupsQuery()
  const items = query.data ?? []

  return (
    <Panel>
      <SectionHead
        title={t('teacherDash.groups')}
        to={routes.groups}
        action={t('teacherDash.fullView')}
      />
      <div className="p-3">
        {query.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-36 w-full" />
            ))}
          </div>
        ) : query.isError ? (
          <ErrorMessage className="py-8" />
        ) : items.length === 0 ? (
          <EmptyState compact description={t('common.noData')} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item, index) => {
              const status = groupStatus(item.status)
              const start = formatDate(item.edu_starting_date) ?? '—'
              const end = formatDate(item.edu_ending_date) ?? '—'
              const price = formatNumber(item.education_price)
              return (
                <div
                  key={item.id ?? index}
                  className="rounded-xl border border-mist/80 p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="truncate text-[14px] font-semibold text-deep">
                      {shortCategory(item, i18n.language)}
                    </p>
                    <Badge tone={status.tone}>{t(`teacherDash.${status.key}`)}</Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    <Chip icon={CalendarDays}>{`${start} – ${end}`}</Chip>
                    <Chip icon={Users}>{asLangName(item, i18n.language)}</Chip>
                    <Chip icon={Wallet}>{`${price} ${t('teacherDash.som')}`}</Chip>
                    <Chip icon={Clock3}>
                      {t('teacherDash.hours', {
                        practical: item.edu_type?.practical_hours ?? '—',
                        theory: item.edu_type?.theoretical_hours ?? '—',
                      })}
                    </Chip>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Panel>
  )
}

function TestsCard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const query = useTemplateTestStatsQuery({
    page: 1,
    showCount: 8,
    studentSearch: '',
    groupSearch: '',
  })
  const rows = query.data?.data ?? []

  return (
    <Panel>
      <SectionHead
        title={t('teacherDash.tests')}
        to={routes.templateViewStatistic}
        action={t('teacherDash.fullView')}
      />
      {query.isLoading ? (
        <div className="p-4">
          <SkeletonLines lines={5} />
        </div>
      ) : query.isError ? (
        <div className="p-4">
          <ErrorMessage className="py-8" />
        </div>
      ) : (
        <div className="px-4 pb-3">
          <Table bordered={false} fill={false} storageKey="teacher-home-tests">
          <THead>
            <HeaderTR>
              <TH rowSpan={2} className="w-12">№</TH>
              <TH rowSpan={2}>{t('teacherDash.fio')}</TH>
              <TH rowSpan={2} className="!px-5">{t('teacherDash.group')}</TH>
              <TH rowSpan={2}>{t('teacherDash.passportCol')}</TH>
              <TH colSpan={4} className="text-center">{t('statsPage.testResults')}</TH>
              <TH rowSpan={2} className="w-14">{t('common.actions')}</TH>
            </HeaderTR>
            <HeaderTR>
              <TH className="min-w-28 whitespace-nowrap !px-4 text-center">
                {t('teacherDash.activeTime')}
              </TH>
              <TH className="min-w-32 whitespace-nowrap !px-4 text-center">
                {t('teacherDash.templates')}
              </TH>
              <TH className="min-w-44 whitespace-nowrap !px-4 text-center">
                {t('teacherDash.avgCorrect')}
              </TH>
              <TH className="min-w-40 whitespace-nowrap !px-4 text-center">
                {t('teacherDash.totalCorrect')}
              </TH>
            </HeaderTR>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <EmptyTR colSpan={9} description={t('common.noData')} />
            ) : (
              rows.map((row, index) => (
                <TestRow key={row.id} row={row} index={index} onOpen={() => navigate(templateViewStudentPath(row.id))} />
              ))
            )}
          </TBody>
          </Table>
        </div>
      )}
    </Panel>
  )
}

function groupIdOf(row: TemplateStatRow): number | null {
  const id = row.group?.id ?? row.group_id
  return id != null && Number(id) > 0 ? Number(id) : null
}

function TestRow({
  row,
  index,
  onOpen,
}: {
  row: TemplateStatRow
  index: number
  onOpen: () => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const name = fullNameOf(row) ?? '—'
  const rawReport = row.template_test_student_report
  const report =
    rawReport &&
    (rawReport.updated_at != null ||
      rawReport.templates_count_done != null ||
      rawReport.average_corrects != null ||
      rawReport.corrects_count != null)
      ? rawReport
      : null
  const groupName = row.group?.name || '—'
  const groupId = groupIdOf(row)
  return (
    <TR>
      <TD className="text-muted">{index + 1}</TD>
      <TD>
        <Button variant="link" size="inline" onClick={onOpen}>
          {name}
        </Button>
      </TD>
      <TD className="!px-5">
        {groupId ? (
          <Button
            variant="link"
            size="inline"
            onClick={() => navigate(groupShowPath(groupId))}
          >
            {groupName}
          </Button>
        ) : (
          groupName
        )}
      </TD>
      <TD className="tabular-nums">
        {maskPassport(row.passport?.seria, row.passport?.number)}
      </TD>
      {report ? (
        <>
          <TD className="text-center">
            <Badge tone="neutral">{formatDate(report.updated_at) ?? '—'}</Badge>
          </TD>
          <TD className="text-center">
            <Badge tone="signal">{report.templates_count_done ?? '—'}</Badge>
          </TD>
          <TD className="text-center">
            <Badge tone="teal">{report.average_corrects ?? '—'}</Badge>
          </TD>
          <TD className="text-center">
            <Badge tone="indigo">{report.corrects_count ?? '—'}</Badge>
          </TD>
        </>
      ) : (
        <TD colSpan={4} className="!px-6 text-center text-[13px] text-muted">
          {t('statsPage.noReport')}
        </TD>
      )}
      <TD>
        <ShowButton onClick={onOpen} />
      </TD>
    </TR>
  )
}

export function TeacherDashboard() {
  const { t } = useTranslation()
  const { me } = useAuth()

  return (
    <>
      <Header
        title={t('teacherDash.title')}
        description={t('teacherDash.description')}
      />
      <PageMain>
        <div className="grid items-stretch gap-3 xl:grid-cols-2">
          <ProfileCard profession={me?.profession} />
          <ScheduleCard />
        </div>
        <GroupsCard />
        <TestsCard />
      </PageMain>
    </>
  )
}
