import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  Modal,
  Pagination,
  SearchInput,
  Select,
  ShowButton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Tabs,
  notify,
} from '@/components/ui'
import {
  useAcceptGroupApplicationMutation,
  useGroupApplicationsQuery,
  useRejectGroupApplicationMutation,
} from '@/features/autodrome-group-applications'
import { usePageState } from '@/hooks'
import { cn } from '@/lib/cn'
import { formatDate, formatDateTime } from '@/lib/format'
import type {
  GroupApplicationRow,
  GroupApplicationStudent,
} from '@/types/autodrome-group-application'

type TabKey = 'all' | 'pending' | 'accepted' | 'rejected'
type DialogMode = 'view' | 'accept' | 'reject'

const EDU_TYPES = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '63',
] as const

const STATUS_FILTERS = [
  'pending',
  'accepted',
  'rejected',
  'auto_accepted',
  'auto_rejected',
] as const

function orgName(row: GroupApplicationRow) {
  return row.organization?.name?.trim() || row.organization?.name_uz?.trim() || '—'
}

function studentName(student: GroupApplicationStudent) {
  const full = student.full_name?.trim()
  if (full) return full
  return [student.last_name, student.first_name, student.middle_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ') || '—'
}

function studentsOf(row: GroupApplicationRow | null) {
  return row?.uztelecom_aes_event_group?.event_students ?? []
}

function statusTone(status?: string | null): 'amber' | 'teal' | 'rose' | 'signal' | 'violet' {
  if (status === 'pending') return 'amber'
  if (status === 'accepted') return 'teal'
  if (status === 'auto_accepted') return 'signal'
  if (status === 'auto_rejected') return 'violet'
  return 'rose'
}

function statusKey(status?: string | null) {
  if (status === 'pending') return 'statusPending'
  if (status === 'accepted') return 'statusAccepted'
  if (status === 'rejected') return 'statusRejected'
  if (status === 'auto_accepted') return 'statusAutoAccepted'
  if (status === 'auto_rejected') return 'statusAutoRejected'
  return ''
}

function clock(value: string | null | undefined, lang: string) {
  if (!value) return '—'
  return formatDateTime(value, lang) ?? value
}

function remaining(deadline: string | null | undefined, now: number) {
  if (!deadline) return ''
  const end = new Date(deadline.includes('T') ? deadline : deadline.replace(' ', 'T')).getTime()
  if (Number.isNaN(end)) return ''
  const diff = end - now
  if (diff <= 0) return 'expired'
  const total = Math.floor(diff / 1000)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${hours}:${pad(minutes)}:${pad(seconds)}`
}

function Meta({
  label,
  value,
  className,
}: {
  label: string
  value: ReactNode
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="text-[10px] leading-none font-semibold tracking-wide text-muted uppercase">
        {label}
      </p>
      <div className="mt-0.5 text-[13px] leading-snug font-medium wrap-break-word text-deep">
        {value == null || value === '' ? '—' : value}
      </div>
    </div>
  )
}

function TimeStack({
  row,
  now,
  lang,
  inline = false,
}: {
  row: GroupApplicationRow
  now: number
  lang: string
  inline?: boolean
}) {
  const { t } = useTranslation()
  const left = row.status === 'pending' ? remaining(row.deadline, now) : ''
  const accepted = String(row.status ?? '').includes('accepted')
  return (
    <div className={cn('flex gap-1', inline ? 'flex-wrap items-center' : 'flex-col items-start')}>
      <Badge tone="signal">
        {t('groupApplications.applied')}: {clock(row.application_created_time, lang)}
      </Badge>
      <Badge tone="amber">
        {t('groupApplications.deadline')}: {clock(row.deadline, lang)}
      </Badge>
      {row.status === 'pending' ? (
        <Badge tone="violet">
          {t('groupApplications.timeLeft')}:{' '}
          {left === 'expired' ? t('groupApplications.timeOver') : left || '—'}
        </Badge>
      ) : (
        <Badge tone={accepted ? 'teal' : 'rose'}>
          {accepted ? t('groupApplications.acceptedAt') : t('groupApplications.rejectedAt')}:{' '}
          {clock(row.actioned_time, lang)}
        </Badge>
      )}
    </div>
  )
}

export function AutodromeGroupApplicationsPage() {
  const { t, i18n } = useTranslation()
  const [tab, setTab] = usePageState<TabKey>('tab', 'all')
  const [organization, setOrganization] = usePageState('org', '')
  const [inn, setInn] = usePageState('inn', '')
  const [taskId, setTaskId] = usePageState('task', '')
  const [group, setGroup] = usePageState('group', '')
  const [eduTypeId, setEduTypeId] = usePageState('edu', '')
  const [status, setStatus] = usePageState('status', '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialog, setDialog] = useState<{ mode: DialogMode; row: GroupApplicationRow } | null>(
    null,
  )
  const [now, setNow] = useState(() => Date.now())

  const effectiveStatus = status || (tab === 'all' ? '' : tab)
  const filterKey = [tab, organization, inn, taskId, group, eduTypeId, status, pageSize].join('|')
  const filterRef = useRef(filterKey)

  useEffect(() => {
    if (filterRef.current === filterKey) return
    filterRef.current = filterKey
    setPage(1)
  }, [filterKey])

  const query = useGroupApplicationsQuery({
    page,
    showCount: pageSize,
    organization,
    inn,
    taskId,
    group,
    eduTypeId,
    status: effectiveStatus,
  })
  const acceptMutation = useAcceptGroupApplicationMutation()
  const rejectMutation = useRejectGroupApplicationMutation()
  const rows = query.data?.data ?? []
  const total = query.data?.total_items ?? 0
  const totalPages = query.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const pendingVisible =
    rows.some((row) => row.status === 'pending') || dialog?.row.status === 'pending'

  useEffect(() => {
    if (!pendingVisible) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [pendingVisible])

  const onError = (err: Error) => notify.error(err.message || t('common.loadError'))
  const closeDialog = () => setDialog(null)

  const decide = (mode: 'accept' | 'reject') => {
    if (!dialog) return
    const done = () => {
      notify.success(
        mode === 'accept' ? t('groupApplications.accepted') : t('groupApplications.rejected'),
      )
      setDialog(null)
    }
    if (mode === 'accept') {
      acceptMutation.mutate(dialog.row.id, { onSuccess: done, onError })
      return
    }
    rejectMutation.mutate(dialog.row.id, { onSuccess: done, onError })
  }

  const busy = acceptMutation.isPending || rejectMutation.isPending
  const people = studentsOf(dialog?.row ?? null)

  return (
    <>
      <Header title={t('groupApplications.title')} />
      <PageMain fill>
        {query.isError ? (
          <ErrorMessage />
        ) : query.isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <Tabs
              className="shrink-0"
              aria-label={t('groupApplications.title')}
              value={tab}
              onChange={(value) => {
                setTab(value)
                setStatus('')
              }}
              items={[
                { value: 'all', label: t('groupApplications.all') },
                { value: 'pending', label: t('groupApplications.pending') },
                { value: 'accepted', label: t('groupApplications.approved') },
                { value: 'rejected', label: t('groupApplications.returned') },
              ]}
            />
            <div className="flex min-h-0 flex-1 flex-col">
              <Table storageKey="autodrome-group-applications">
                <THead>
                  <HeaderTR>
                    <TH column="n" className="w-12 text-center">
                      №
                    </TH>
                    <TH column="org" className="min-w-52">
                      {t('groupApplications.org')}
                    </TH>
                    <TH column="inn" className="min-w-32">
                      {t('groupApplications.inn')}
                    </TH>
                    <TH column="task" className="min-w-32">
                      {t('groupApplications.task')}
                    </TH>
                    <TH column="group" className="min-w-36">
                      {t('groupApplications.group')}
                    </TH>
                    <TH column="edu" className="min-w-28">
                      {t('groupApplications.edu')}
                    </TH>
                    <TH column="time" className="min-w-56">
                      {t('groupApplications.time')}
                    </TH>
                    <TH column="status" className="min-w-36">
                      {t('groupApplications.status')}
                    </TH>
                    <TH column="actions" className="w-28 text-center">
                      {t('common.actions')}
                    </TH>
                  </HeaderTR>
                  <FilterTR>
                    <FilterTH column="n" />
                    <FilterTH column="org">
                      <SearchInput
                        size="sm"
                        id="app-org"
                        name="app-org"
                        label={t('groupApplications.org')}
                        placeholder={t('common.search')}
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                      />
                    </FilterTH>
                    <FilterTH column="inn">
                      <SearchInput
                        size="sm"
                        id="app-inn"
                        name="app-inn"
                        label={t('groupApplications.inn')}
                        placeholder={t('common.search')}
                        value={inn}
                        onChange={(e) => setInn(e.target.value)}
                      />
                    </FilterTH>
                    <FilterTH column="task">
                      <SearchInput
                        size="sm"
                        id="app-task"
                        name="app-task"
                        label={t('groupApplications.task')}
                        placeholder={t('common.search')}
                        value={taskId}
                        onChange={(e) => setTaskId(e.target.value)}
                      />
                    </FilterTH>
                    <FilterTH column="group">
                      <SearchInput
                        size="sm"
                        id="app-group"
                        name="app-group"
                        label={t('groupApplications.group')}
                        placeholder={t('common.search')}
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                      />
                    </FilterTH>
                    <FilterTH column="edu">
                      <Select
                        id="app-edu"
                        name="app-edu"
                        size="sm"
                        value={eduTypeId}
                        placeholder={t('groupApplications.all')}
                        onChange={(e) => setEduTypeId(e.target.value)}
                        options={[
                          { value: '', label: t('groupApplications.all') },
                          ...EDU_TYPES.map((id) => ({
                            value: id,
                            label: t(`groupApplications.edu${id}`),
                          })),
                        ]}
                      />
                    </FilterTH>
                    <FilterTH column="time" />
                    <FilterTH column="status">
                      <Select
                        id="app-status"
                        name="app-status"
                        size="sm"
                        value={status}
                        placeholder={t('groupApplications.all')}
                        onChange={(e) => setStatus(e.target.value)}
                        options={[
                          { value: '', label: t('groupApplications.all') },
                          ...STATUS_FILTERS.map((id) => ({
                            value: id,
                            label: t(`groupApplications.${statusKey(id)}`),
                          })),
                        ]}
                      />
                    </FilterTH>
                    <FilterTH column="actions" />
                  </FilterTR>
                </THead>
                <TBody>
                  {rows.length === 0 ? (
                    <EmptyTR colSpan={9} description={t('groupApplications.empty')} />
                  ) : (
                    rows.map((row, index) => (
                      <TR key={row.id}>
                        <TD column="n" className="text-center text-muted">
                          {(page - 1) * pageSize + index + 1}
                        </TD>
                        <TD column="org" className="min-w-52 whitespace-normal">
                          {orgName(row)}
                        </TD>
                        <TD column="inn" className="tabular-nums">
                          {row.organization?.inn || '—'}
                        </TD>
                        <TD column="task" className="tabular-nums">
                          {row.uztelecom_aes_event?.task_id ?? '—'}
                        </TD>
                        <TD column="group">
                          {row.uztelecom_aes_event_group?.group_name || '—'}
                        </TD>
                        <TD column="edu">
                          {row.uztelecom_aes_event_group?.edu_type?.short_name ||
                            row.uztelecom_aes_event_group?.edu_type?.name ||
                            '—'}
                        </TD>
                        <TD column="time">
                          <TimeStack row={row} now={now} lang={i18n.language} />
                        </TD>
                        <TD column="status">
                          <Badge tone={statusTone(row.status)}>
                            {statusKey(row.status)
                              ? t(`groupApplications.${statusKey(row.status)}`)
                              : row.status || '—'}
                          </Badge>
                        </TD>
                        <TD column="actions">
                          <div className="flex items-center justify-center gap-1">
                            <ShowButton onClick={() => setDialog({ mode: 'view', row })} />
                            {row.status === 'pending' ? (
                              <>
                                <Button
                                  variant="soft"
                                  size="icon-sm"
                                  aria-label={t('groupApplications.accept')}
                                  onClick={() => setDialog({ mode: 'accept', row })}
                                >
                                  <Check className="size-3.5" aria-hidden />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="icon-sm"
                                  aria-label={t('groupApplications.reject')}
                                  onClick={() => setDialog({ mode: 'reject', row })}
                                >
                                  <X className="size-3.5" aria-hidden />
                                </Button>
                              </>
                            ) : null}
                          </div>
                        </TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            </div>
            <Pagination
              className="shrink-0"
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </PageMain>

      <Modal
        open={Boolean(dialog)}
        onClose={closeDialog}
        title={
          dialog?.mode === 'view'
            ? t('groupApplications.details')
            : t('groupApplications.students')
        }
        sizeClassName="max-w-4xl"
        bodyClassName="flex min-h-0 flex-col overflow-hidden px-3 py-2.5 sm:px-4"
        dismissible={!busy}
        footer={
          dialog?.mode === 'view' ? (
            <div className="flex justify-end">
              <Button variant="outline" onClick={closeDialog}>
                {t('common.close')}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button variant="outline" disabled={busy} onClick={closeDialog}>
                {t('common.close')}
              </Button>
              <Button
                variant={dialog?.mode === 'reject' ? 'danger' : 'primary'}
                loading={busy}
                onClick={() => decide(dialog?.mode === 'reject' ? 'reject' : 'accept')}
              >
                {dialog?.mode === 'reject'
                  ? t('groupApplications.reject')
                  : t('groupApplications.accept')}
              </Button>
            </div>
          )
        }
      >
        {dialog?.mode === 'view' && dialog.row ? (
          <div className="shrink-0 space-y-1.5 border-b border-mist/70 pb-2">
            <Meta label={t('groupApplications.org')} value={orgName(dialog.row)} />
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-4">
              <Meta label={t('groupApplications.inn')} value={dialog.row.organization?.inn || '—'} />
              <Meta
                label={t('groupApplications.group')}
                value={dialog.row.uztelecom_aes_event_group?.group_name || '—'}
              />
              <Meta
                label={t('groupApplications.task')}
                value={dialog.row.uztelecom_aes_event?.task_id ?? '—'}
              />
              <Meta label={t('groupApplications.studentCount')} value={String(people.length)} />
            </div>
            <Meta
              label={t('groupApplications.edu')}
              value={
                dialog.row.uztelecom_aes_event_group?.edu_type?.name ||
                dialog.row.uztelecom_aes_event_group?.edu_type?.short_name ||
                '—'
              }
            />
            <div className="flex flex-wrap items-center gap-1">
              <Badge tone={statusTone(dialog.row.status)}>
                {statusKey(dialog.row.status)
                  ? t(`groupApplications.${statusKey(dialog.row.status)}`)
                  : dialog.row.status || '—'}
              </Badge>
              <TimeStack inline row={dialog.row} now={now} lang={i18n.language} />
            </div>
          </div>
        ) : null}
        {dialog?.mode === 'view' ? (
          <p className="shrink-0 pt-2 pb-1.5 text-[13px] font-semibold text-deep">
            {t('groupApplications.students')}
          </p>
        ) : null}
        <div className="min-h-0 max-h-[min(48svh,420px)] overflow-auto">
          <Table fill={false} storageKey="autodrome-group-application-students">
            <THead>
              <HeaderTR>
                <TH column="n" className="w-12 text-center">
                  №
                </TH>
                <TH column="name">{t('groupApplications.fullName')}</TH>
                <TH column="birthday">{t('groupApplications.birthday')}</TH>
              </HeaderTR>
            </THead>
            <TBody>
              {people.length === 0 ? (
                <EmptyTR colSpan={3} description={t('groupApplications.emptyStudents')} />
              ) : (
                people.map((student, index) => (
                  <TR key={student.id ?? index}>
                    <TD column="n" className="text-center text-muted">
                      {index + 1}
                    </TD>
                    <TD column="name">{studentName(student)}</TD>
                    <TD column="birthday">
                      {formatDate(student.birthday, i18n.language) ?? student.birthday ?? '—'}
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </div>
      </Modal>
    </>
  )
}
