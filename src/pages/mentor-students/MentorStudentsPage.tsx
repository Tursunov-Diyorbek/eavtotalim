import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { AlertTriangle, List, Users } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Button,
  EmptyTR,
  ErrorMessage,
  HeaderTR,
  ListPageSkeleton,
  Pagination,
  Panel,
  SearchInput,
  Select,
  Skeleton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { groupShowPath, PATH_PREFIX_FILE, studentPath } from '@/config'
import type { MentorSessionStat, MentorStudent } from '@/api/mentor-students'
import {
  useMentorStudentGroupsQuery,
  useMentorStatsQuery,
  useMentorStudentsQuery,
} from '@/features/mentor-students'
import { resolveFileUrl } from '@/features/lessons/utils'
import { useOpenedOnce, usePageState } from '@/hooks'
import { cn } from '@/lib/cn'

const AVATAR = ['bg-signal', 'bg-violet', 'bg-teal', 'bg-amber', 'bg-indigo'] as const

function titleWord(value: string) {
  const text = value.trim().toLocaleLowerCase('uz-UZ')
  if (!text) return ''
  return text.charAt(0).toLocaleUpperCase('uz-UZ') + text.slice(1)
}

function studentName(student: MentorStudent) {
  const joined = [titleWord(student.last_name ?? ''), titleWord(student.first_name ?? '')]
    .filter(Boolean)
    .join(' ')
  if (joined) return joined
  return String(student.full_name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(titleWord)
    .join(' ')
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  const local = digits.startsWith('998') && digits.length >= 12 ? digits.slice(-9) : digits
  if (local.length !== 9) return phone
  return `+998 (${local.slice(0, 2)}) ${local.slice(2, 5)}-${local.slice(5, 7)}-${local.slice(7, 9)}`
}

function photoSrc(image?: string | null) {
  return resolveFileUrl(image, PATH_PREFIX_FILE)
}

function attendanceTone(percent: number) {
  if (percent >= 80) return 'good' as const
  if (percent >= 50) return 'mid' as const
  return 'low' as const
}

function formatSessions(item: MentorSessionStat | null | undefined, t: TFunction) {
  const count = Number(item?.attended_count) || 0
  const hours = Number(item?.hours) || 0
  const minutes = Number(item?.minutes) || 0
  const time =
    minutes > 0
      ? t('mentorStudents.hoursMinutes', { hours, minutes })
      : t('mentorStudents.hours', { hours })
  return t('mentorStudents.sessions', { count, time })
}

function formatLastSeen(value: string | null | undefined, today: string, yesterday: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const day = start(date)
  const now = start(new Date())
  if (day === now) return `${today}, ${time}`
  if (day === now - 86_400_000) return `${yesterday}, ${time}`
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}, ${time}`
}

function studentGroup(student: MentorStudent) {
  return student.group || student.mygroup || null
}

function Avatar({ src, name, id }: { src: string; name: string; id: number }) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        className="size-9 shrink-0 rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white',
        AVATAR[Math.abs(id) % AVATAR.length],
      )}
    >
      {initials(name) || '?'}
    </span>
  )
}

export function MentorStudentsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [word, setWord] = usePageState('word', '')
  const [groupId, setGroupId] = usePageState('groupId', '')
  const [attendance, setAttendance] = usePageState('attendance', '')

  useEffect(() => {
    setPage(1)
  }, [word, groupId, attendance, pageSize])

  const [groupsEnabled, openGroups] = useOpenedOnce(Boolean(groupId))
  const statsQuery = useMentorStatsQuery()
  const groupsQuery = useMentorStudentGroupsQuery(groupsEnabled)
  const listQuery = useMentorStudentsQuery({
    page,
    showCount: pageSize,
    word: word || undefined,
    groupId: groupId || undefined,
    attendance: attendance || undefined,
  })

  const rows = listQuery.data?.data ?? []
  const total = listQuery.data?.total_items ?? 0
  const totalPages = listQuery.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const groups = groupsQuery.data ?? []
  const stats = statsQuery.data

  const groupOptions = [
    { value: '', label: t('common.all') },
    ...groups.map((group) => ({
      value: String(group.id),
      label: group.name,
      searchText: group.name,
    })),
  ]
  const attendanceOptions = [
    { value: '', label: t('common.all') },
    { value: 'low', label: t('mentorStudents.low') },
    { value: 'good', label: t('mentorStudents.good') },
  ]

  return (
    <>
      <Header
        title={t('mentorStudents.title')}
        description={t('mentorStudents.subtitle')}
        actions={
          <div className="flex flex-wrap items-end justify-end gap-2">
            <SearchInput
              size="sm"
              className="w-64 max-w-full"
              label={t('mentorStudents.search')}
              placeholder={t('mentorStudents.search')}
              value={word}
              onChange={(event) => setWord(event.target.value)}
            />
            <Select
              className="w-44"
              placeholder={t('mentorStudents.group')}
              value={groupId}
              searchable={groups.length > 5}
              clearable
              options={groupOptions}
              onOpen={openGroups}
              loading={groupsQuery.isFetching && groups.length === 0}
              onChange={(event) => setGroupId(event.target.value)}
            />
            <Select
              className="w-44"
              placeholder={t('mentorStudents.attendance')}
              value={attendance}
              searchable={false}
              clearable
              options={attendanceOptions}
              onChange={(event) => setAttendance(event.target.value)}
            />
          </div>
        }
      />
      <PageMain fill>
        <div className="grid shrink-0 gap-3 md:grid-cols-3">
          {statsQuery.isLoading ? (
            Array.from({ length: 3 }, (_, i) => (
              <Panel key={i} padding="md">
                <Skeleton className="h-14 w-full" />
              </Panel>
            ))
          ) : (
            <>
              <StatCard
                icon={Users}
                label={t('mentorStudents.total')}
                value={Number(stats?.total_mentees_count) || 0}
                unit={t('mentorStudents.unit')}
                hint={t('mentorStudents.totalHint')}
              />
              <StatCard
                icon={List}
                label={t('mentorStudents.groups')}
                value={Number(stats?.groups_count) || 0}
                unit={t('mentorStudents.unit')}
                hint={t('mentorStudents.groupsHint')}
                tone="teal"
              />
              <StatCard
                icon={AlertTriangle}
                label={t('mentorStudents.lowTitle')}
                value={Number(stats?.low_attendance_count) || 0}
                unit={t('mentorStudents.people')}
                hint={t('mentorStudents.lowHint')}
                tone="amber"
              />
            </>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {listQuery.isError ? (
            <ErrorMessage />
          ) : listQuery.isLoading ? (
            <ListPageSkeleton rows={8} />
          ) : (
            <>
              <Table storageKey="mentor-students">
                <THead>
                  <HeaderTR>
                    <TH className="w-12 text-center">№</TH>
                    <TH>{t('mentorStudents.colStudent')}</TH>
                    <TH>{t('mentorStudents.group')}</TH>
                    <TH className="min-w-40">{t('mentorStudents.attendance')}</TH>
                    <TH>{t('mentorStudents.colPractical')}</TH>
                    <TH>{t('mentorStudents.colAutodrome')}</TH>
                    <TH>{t('mentorStudents.colTests')}</TH>
                    <TH>{t('mentorStudents.colLast')}</TH>
                  </HeaderTR>
                </THead>
                <TBody>
                  {rows.length === 0 ? (
                    <EmptyTR colSpan={8} description={t('mentorStudents.empty')} />
                  ) : (
                    rows.map((student, index) => {
                      const name = studentName(student)
                      const percent = Number(student.attendance?.percent) || 0
                      const tone = attendanceTone(percent)
                      const src = photoSrc(student.image)
                      const group = studentGroup(student)
                      const groupName = group?.name_uz || group?.name || ''
                      const groupKey = group?.id
                      return (
                        <TR key={student.id ?? index}>
                          <TD className="text-center text-muted">
                            {(page - 1) * pageSize + index + 1}
                          </TD>
                          <TD>
                            <div className="flex min-w-0 items-center gap-2.5">
                              <Avatar src={src} name={name} id={Number(student.id) || 0} />
                              <div className="min-w-0">
                                {student.id ? (
                                  <Button
                                    variant="link"
                                    size="inline"
                                    onClick={() => navigate(studentPath(student.id))}
                                  >
                                    {name || '—'}
                                  </Button>
                                ) : (
                                  <span className="font-medium text-deep">{name || '—'}</span>
                                )}
                                {student.phone ? (
                                  <div className="text-[12px] text-muted">
                                    {formatPhone(student.phone)}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </TD>
                          <TD>
                            {groupKey ? (
                              <Button
                                variant="link"
                                size="inline"
                                onClick={() => navigate(groupShowPath(groupKey))}
                              >
                                {groupName || '—'}
                              </Button>
                            ) : (
                              groupName || '—'
                            )}
                          </TD>
                          <TD>
                            <div className="min-w-36">
                              <div
                                className={cn(
                                  'text-[13px] font-medium',
                                  tone === 'good' && 'text-teal',
                                  tone === 'mid' && 'text-amber',
                                  tone === 'low' && 'text-rose',
                                )}
                              >
                                {Math.round(percent)}% ·{' '}
                                {t('mentorStudents.lessons', {
                                  attended: Number(student.attendance?.attended_lessons) || 0,
                                  total: Number(student.attendance?.total_lessons) || 0,
                                })}
                              </div>
                              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist/80">
                                <span
                                  className={cn(
                                    'block h-full rounded-full',
                                    tone === 'good' && 'bg-teal',
                                    tone === 'mid' && 'bg-amber',
                                    tone === 'low' && 'bg-rose',
                                  )}
                                  style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
                                />
                              </div>
                            </div>
                          </TD>
                          <TD className="text-muted">
                            {formatSessions(student.practical, t)}
                          </TD>
                          <TD className="text-muted">
                            {formatSessions(student.autodrome, t)}
                          </TD>
                          <TD className="text-muted">
                            {t('mentorStudents.tests', {
                              count: Number(student.tests?.templates_count_done) || 0,
                              percent: Math.round(Number(student.tests?.average_corrects) || 0),
                            })}
                          </TD>
                          <TD className="whitespace-nowrap text-muted">
                            {formatLastSeen(
                              student.last_seen,
                              t('mentorStudents.today'),
                              t('mentorStudents.yesterday'),
                            )}
                          </TD>
                        </TR>
                      )
                    })
                  )}
                </TBody>
              </Table>
              <Pagination
                className="shrink-0"
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </div>
      </PageMain>
    </>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  hint,
  tone = 'signal',
}: {
  icon: typeof Users
  label: string
  value: number
  unit: string
  hint: string
  tone?: 'signal' | 'teal' | 'amber'
}) {
  const warn = tone === 'amber'
  return (
    <Panel
      padding="md"
      className={warn ? 'border-amber/30 bg-amber-soft/50' : undefined}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            tone === 'signal' && 'bg-signal-soft text-signal',
            tone === 'teal' && 'bg-teal-soft text-teal',
            tone === 'amber' && 'bg-amber-soft text-amber',
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="m-0 text-[13px] text-muted">{label}</p>
          <p className="font-display m-0 text-[22px] leading-tight font-semibold text-deep">
            {value}{' '}
            <span className="text-sm font-medium text-muted">{unit}</span>
          </p>
          <p className="m-0 text-[12px] text-muted">{hint}</p>
        </div>
      </div>
    </Panel>
  )
}
